package com.querygenie.service.schema;

import com.querygenie.entity.DataSource;

import java.util.Map;

public interface SchemaIntrospectionService {

    /**
     * Connects to the tenant database, reads information_schema, builds a compact
     * SchemaCache structure, persists it to the data_source record and Redis.
     *
     * @return summary map: {tableCount, columnCount, cachedAt}
     */
    Map<String, Object> introspectAndCache(DataSource dataSource);

    /**
     * Returns the cached schema JSON string for the given data source.
     * Tries Redis first, falls back to the JSONB column.
     */
    String getCachedSchema(Long dataSourceId);
}
