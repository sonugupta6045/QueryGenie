package com.querygenie.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueryAskResponse {

    private String generatedSql;
    private String explanation;
    private List<Map<String, Object>> results;
    private ChartConfig chartConfig;
    private Long executionTimeMs;
    private Long queryLogId;
}
