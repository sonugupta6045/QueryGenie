package com.querygenie.service.execution;

import com.querygenie.entity.DataSource;
import com.querygenie.exception.DataSourceConnectionException;
import com.querygenie.util.EncryptionUtil;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Manages one HikariCP connection pool per tenant data source.
 * Each pool connects using the decrypted credentials and uses a
 * SELECT-only PostgreSQL role (Layer 2 of defense-in-depth per AGENTS.md).
 * Pools are created lazily and cached for the lifetime of the application.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TenantConnectionPoolManager {

    private final EncryptionUtil encryptionUtil;

    // Pool cache: dataSourceId → HikariDataSource
    private final Map<Long, HikariDataSource> pools = new ConcurrentHashMap<>();

    /**
     * Returns an existing pool or creates a new one for the given data source.
     * Thread-safe via ConcurrentHashMap.computeIfAbsent.
     */
    public javax.sql.DataSource getOrCreatePool(DataSource dataSource) {
        return pools.computeIfAbsent(dataSource.getId(), id -> createPool(dataSource));
    }

    /**
     * Evicts the pool for the given data source (call after datasource deletion or credential change).
     */
    public void evictPool(Long dataSourceId) {
        HikariDataSource removed = pools.remove(dataSourceId);
        if (removed != null && !removed.isClosed()) {
            removed.close();
            log.info("Evicted connection pool for dataSourceId={}", dataSourceId);
        }
    }

    @PreDestroy
    public void closeAll() {
        pools.values().forEach(ds -> {
            if (!ds.isClosed()) ds.close();
        });
        pools.clear();
        log.info("All tenant connection pools closed");
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private HikariDataSource createPool(DataSource dataSource) {
        String decrypted = encryptionUtil.decrypt(dataSource.getEncryptedCredentials());
        String[] parts = decrypted.split(":", 2);
        if (parts.length != 2) {
            throw new DataSourceConnectionException(
                    "Malformed credentials for dataSource: " + dataSource.getId());
        }
        String username = parts[0];
        String password = parts[1];

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:postgresql://" + dataSource.getDbHost() + ":" +
                dataSource.getDbPort() + "/" + dataSource.getDbName());
        config.setUsername(username);
        config.setPassword(password);

        // Safety: pool-level connection init SQL to enforce read-only mode at the session level
        config.setConnectionInitSql("SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY");
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setConnectionTimeout(10_000);  // 10s connect timeout
        config.setPoolName("tenant-pool-" + dataSource.getId());

        log.info("Creating connection pool for dataSourceId={} ({}:{})", 
                dataSource.getId(), dataSource.getDbHost(), dataSource.getDbPort());
        try {
            return new HikariDataSource(config);
        } catch (Exception e) {
            throw new DataSourceConnectionException(
                    "Failed to connect to dataSource " + dataSource.getId() + ": " + e.getMessage(), e);
        }
    }
}
