package com.querygenie.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueryLogResponse {

    private Long id;
    private Long userId;
    private Long dataSourceId;
    private String dataSourceName;
    private String questionText;
    private String generatedSql;
    private String executionStatus;
    private Long executionTimeMs;
    private String errorMessage;
    private String createdAt;
}
