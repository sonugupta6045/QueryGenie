package com.querygenie.service.chart;

import com.querygenie.dto.ChartConfig;
import com.querygenie.dto.QueryResultResponse;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Deterministic, rule-based chart type selection (Phase 2 §4.5).
 * Not an LLM call — purely structural analysis of the result columns.
 *
 * Rules (in priority order):
 * 1. date/timestamp column + 1 numeric column → Line chart
 * 2. 1 categorical + 1 numeric, ≤6 distinct values → Pie chart
 * 3. 1 categorical + 1 numeric → Bar chart
 * 4. >2 columns or purely textual → Table fallback (null chart)
 */
@Service
public class ChartMappingService {

    private static final List<String> NUMERIC_TYPES = List.of(
            "int2", "int4", "int8", "float4", "float8", "numeric", "decimal",
            "integer", "bigint", "smallint", "real", "double precision", "money"
    );
    private static final List<String> DATE_TYPES = List.of(
            "date", "timestamp", "timestamptz", "timestamp with time zone",
            "timestamp without time zone"
    );
    private static final int PIE_MAX_CATEGORIES = 6;

    /**
     * Determines the best chart type for the given result.
     *
     * @param columns the column metadata from the query result
     * @param rows    the result rows (used for cardinality check for pie charts)
     * @return a {@link ChartConfig} or {@code null} if a table is more appropriate
     */
    public ChartConfig determineChart(List<QueryResultResponse.ColumnMeta> columns,
                                      List<List<Object>> rows) {
        if (columns == null || columns.size() < 2) return null;

        String col0Type = columns.get(0).getType().toLowerCase();
        String col1Type = columns.get(1).getType().toLowerCase();

        // Rule 1: date/timestamp + numeric → Line
        if (isDateType(col0Type) && isNumericType(col1Type)) {
            return ChartConfig.builder()
                    .type("line")
                    .xKey(columns.get(0).getName())
                    .yKey(columns.get(1).getName())
                    .build();
        }

        // Rules 2 & 3: categorical + numeric (exactly 2 columns)
        if (columns.size() == 2 && !isNumericType(col0Type) && isNumericType(col1Type)) {
            int rowCount = rows != null ? rows.size() : Integer.MAX_VALUE;

            // Rule 2: small cardinality → Pie
            if (rowCount <= PIE_MAX_CATEGORIES) {
                return ChartConfig.builder()
                        .type("pie")
                        .xKey(columns.get(0).getName())
                        .yKey(columns.get(1).getName())
                        .build();
            }

            // Rule 3: larger cardinality → Bar
            return ChartConfig.builder()
                    .type("bar")
                    .xKey(columns.get(0).getName())
                    .yKey(columns.get(1).getName())
                    .build();
        }

        // Rule 4: everything else → table fallback
        return null;
    }

    private boolean isNumericType(String type) {
        return NUMERIC_TYPES.stream().anyMatch(t -> type.contains(t));
    }

    private boolean isDateType(String type) {
        return DATE_TYPES.stream().anyMatch(t -> type.contains(t));
    }
}
