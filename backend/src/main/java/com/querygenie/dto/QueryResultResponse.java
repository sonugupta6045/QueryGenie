package com.querygenie.dto;

import com.querygenie.enums.ExecutionStatus;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Full response envelope for a query execution per Phase 2 §7.3.
 * Fields are nullable for CLARIFICATION_NEEDED / REJECTED cases.
 */
@Data
@Builder
public class QueryResultResponse {

    private String sql;
    private List<ColumnMeta> columns;
    private List<List<Object>> rows;
    private ChartConfig chart;
    private String explanation;
    private ExecutionStatus status;
    private Long executionTimeMs;
    private String clarificationMessage;  // set when status = CLARIFICATION_NEEDED

    @Data
    @Builder
    public static class ColumnMeta {
        private String name;
        private String type;
    }
}
