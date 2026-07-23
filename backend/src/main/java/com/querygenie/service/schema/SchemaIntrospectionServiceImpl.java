package com.querygenie.service.schema;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.querygenie.entity.DataSource;
import com.querygenie.exception.SchemaIntrospectionException;
import com.querygenie.repository.DataSourceRepository;
import com.querygenie.service.execution.TenantConnectionPoolManager;
import com.querygenie.util.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.sql.*;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

/**
 * Reads information_schema from the tenant database to build a compact schema description.
 * Schema structure (JSON):
 * {
 *   "tables": [
 *     { "name": "orders", "columns": [{"name": "id","type":"bigint"}, ...], "foreignKeys": [...] }
 *   ]
 * }
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SchemaIntrospectionServiceImpl implements SchemaIntrospectionService {

    private static final String REDIS_KEY_PREFIX = "schema:";
    private static final Duration REDIS_TTL = Duration.ofHours(24);

    private final TenantConnectionPoolManager poolManager;
    private final DataSourceRepository dataSourceRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public Map<String, Object> introspectAndCache(DataSource dataSource) {
        log.info("Starting schema introspection for dataSourceId={}", dataSource.getId());
        try {
            javax.sql.DataSource tenantDs = poolManager.getOrCreatePool(dataSource);
            Map<String, Object> schema = readSchema(tenantDs, dataSource.getDbName());

            String schemaJson = objectMapper.writeValueAsString(schema);
            int tableCount = ((List<?>) schema.get("tables")).size();
            int columnCount = countColumns(schema);

            // Persist to DB
            dataSource.setSchemaCache(schemaJson);
            dataSource.setSchemaCachedAt(Instant.now());
            dataSourceRepository.save(dataSource);

            // Persist to Redis
            redisTemplate.opsForValue().set(REDIS_KEY_PREFIX + dataSource.getId(), schemaJson, REDIS_TTL);

            return Map.of("tableCount", tableCount, "columnCount", columnCount,
                    "cachedAt", dataSource.getSchemaCachedAt().toString());

        } catch (JsonProcessingException e) {
            throw new SchemaIntrospectionException("Failed to serialize schema for dataSource: " + dataSource.getId(), e);
        } catch (SQLException e) {
            throw new SchemaIntrospectionException("Failed to introspect schema for dataSource: " + dataSource.getId(), e);
        }
    }

    @Override
    public String getCachedSchema(Long dataSourceId) {
        // Try Redis first
        String cached = redisTemplate.opsForValue().get(REDIS_KEY_PREFIX + dataSourceId);
        if (StringUtils.hasText(cached)) {
            return cached;
        }
        // Fall back to DB
        return dataSourceRepository.findById(dataSourceId)
                .map(DataSource::getSchemaCache)
                .orElseThrow(() -> new SchemaIntrospectionException("No schema cache found for dataSource: " + dataSourceId));
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private Map<String, Object> readSchema(javax.sql.DataSource tenantDs, String dbName) throws SQLException {
        List<Map<String, Object>> tables = new ArrayList<>();

        try (Connection conn = tenantDs.getConnection()) {
            DatabaseMetaData meta = conn.getMetaData();

            // List all user-defined tables
            try (ResultSet rs = meta.getTables(null, "public", "%", new String[]{"TABLE"})) {
                while (rs.next()) {
                    String tableName = rs.getString("TABLE_NAME");
                    List<Map<String, String>> columns = readColumns(meta, tableName);
                    List<Map<String, String>> fks = readForeignKeys(meta, tableName);

                    Map<String, Object> table = new LinkedHashMap<>();
                    table.put("name", tableName);
                    table.put("columns", columns);
                    table.put("foreignKeys", fks);
                    tables.add(table);
                }
            }
        }

        return Map.of("tables", tables);
    }

    private List<Map<String, String>> readColumns(DatabaseMetaData meta, String tableName) throws SQLException {
        List<Map<String, String>> columns = new ArrayList<>();
        try (ResultSet rs = meta.getColumns(null, "public", tableName, "%")) {
            while (rs.next()) {
                Map<String, String> col = new LinkedHashMap<>();
                col.put("name", rs.getString("COLUMN_NAME"));
                col.put("type", rs.getString("TYPE_NAME").toLowerCase());
                columns.add(col);
            }
        }
        return columns;
    }

    private List<Map<String, String>> readForeignKeys(DatabaseMetaData meta, String tableName) throws SQLException {
        List<Map<String, String>> fks = new ArrayList<>();
        try (ResultSet rs = meta.getImportedKeys(null, "public", tableName)) {
            while (rs.next()) {
                Map<String, String> fk = new LinkedHashMap<>();
                fk.put("fromColumn", rs.getString("FKCOLUMN_NAME"));
                fk.put("toTable", rs.getString("PKTABLE_NAME"));
                fk.put("toColumn", rs.getString("PKCOLUMN_NAME"));
                fks.add(fk);
            }
        }
        return fks;
    }

    @SuppressWarnings("unchecked")
    private int countColumns(Map<String, Object> schema) {
        List<Map<String, Object>> tables = (List<Map<String, Object>>) schema.get("tables");
        return tables.stream()
                .mapToInt(t -> ((List<?>) t.get("columns")).size())
                .sum();
    }
}
