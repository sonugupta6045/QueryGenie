package com.querygenie.service.execution;

import com.querygenie.dto.QueryResultResponse;
import com.querygenie.entity.DataSource;
import com.querygenie.exception.DataSourceConnectionException;
import com.querygenie.exception.QueryExecutionException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Layer 2 of defense-in-depth (AGENTS.md rule 2).
 * Executes only SELECT statements against the read-only tenant pool.
 * Applies a statement_timeout at the JDBC level.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class QueryExecutionService {

    private static final int STATEMENT_TIMEOUT_SECONDS = 10;

    private final TenantConnectionPoolManager poolManager;

    /**
     * Executes the given SQL against the tenant data source.
     *
     * @param dataSource the tenant data source
     * @param sql        the validated SELECT SQL query
     * @return columns and rows as structured data
     */
    public ExecutionResult execute(DataSource dataSource, String sql) {
        log.debug("Executing SQL on dataSourceId={}: {}", dataSource.getId(), sql);
        long startMs = System.currentTimeMillis();

        try (Connection conn = poolManager.getOrCreatePool(dataSource).getConnection();
             Statement stmt = conn.createStatement()) {

            // Apply statement timeout (Layer 2 safety net)
            stmt.setQueryTimeout(STATEMENT_TIMEOUT_SECONDS);

            ResultSet rs = stmt.executeQuery(sql);
            ResultSetMetaData meta = rs.getMetaData();
            int columnCount = meta.getColumnCount();

            // Extract column metadata
            List<QueryResultResponse.ColumnMeta> columns = new ArrayList<>();
            for (int i = 1; i <= columnCount; i++) {
                columns.add(QueryResultResponse.ColumnMeta.builder()
                        .name(meta.getColumnLabel(i))
                        .type(meta.getColumnTypeName(i).toLowerCase())
                        .build());
            }

            // Extract rows
            List<List<Object>> rows = new ArrayList<>();
            while (rs.next()) {
                List<Object> row = new ArrayList<>();
                for (int i = 1; i <= columnCount; i++) {
                    row.add(rs.getObject(i));
                }
                rows.add(row);
            }

            long executionTimeMs = System.currentTimeMillis() - startMs;
            log.info("Query executed in {}ms, returned {} rows for dataSourceId={}",
                    executionTimeMs, rows.size(), dataSource.getId());

            return new ExecutionResult(columns, rows, executionTimeMs);

        } catch (SQLTimeoutException e) {
            throw new QueryExecutionException("Query exceeded the " + STATEMENT_TIMEOUT_SECONDS + "s timeout", e);
        } catch (SQLException e) {
            throw new QueryExecutionException("SQL execution failed: " + e.getMessage(), e);
        }
    }

    public record ExecutionResult(
            List<QueryResultResponse.ColumnMeta> columns,
            List<List<Object>> rows,
            long executionTimeMs
    ) {}
}
