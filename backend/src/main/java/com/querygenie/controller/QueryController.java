package com.querygenie.controller;

import com.querygenie.dto.*;
import com.querygenie.entity.DataSource;
import com.querygenie.entity.QueryLog;
import com.querygenie.entity.User;
import com.querygenie.enums.ExecutionStatus;
import com.querygenie.exception.ResourceNotFoundException;
import com.querygenie.exception.UnsafeSqlException;
import com.querygenie.repository.DataSourceRepository;
import com.querygenie.repository.QueryLogRepository;
import com.querygenie.security.SecurityUserDetails;
import com.querygenie.service.audit.AuditLogService;
import com.querygenie.service.chart.ChartMappingService;
import com.querygenie.service.execution.QueryExecutionService;
import com.querygenie.service.explanation.ExplanationService;
import com.querygenie.service.llm.SqlGenerationService;
import com.querygenie.service.ratelimit.RateLimitService;
import com.querygenie.service.validation.SqlSafetyValidator;
import com.querygenie.service.validation.ValidationResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Core query controller — orchestrates the full NL→SQL→Execute→Chart→Explain pipeline.
 * Each step is delegated to the appropriate service; this controller stays thin.
 */
@RestController
@RequestMapping("/api/v1/queries")
@RequiredArgsConstructor
@Tag(name = "Queries", description = "Ask natural language questions; get SQL, results, and charts")
@Slf4j
public class QueryController {

    private final SqlGenerationService sqlGenerationService;
    private final SqlSafetyValidator sqlSafetyValidator;
    private final QueryExecutionService queryExecutionService;
    private final ChartMappingService chartMappingService;
    private final ExplanationService explanationService;
    private final AuditLogService auditLogService;
    private final RateLimitService rateLimitService;
    private final DataSourceRepository dataSourceRepository;
    private final QueryLogRepository queryLogRepository;

    @PostMapping("/ask")
    @PreAuthorize("hasAnyRole('ANALYST', 'DATA_SOURCE_ADMIN', 'SUPER_ADMIN', 'API_CONSUMER')")
    @Operation(summary = "Ask a natural language question — returns SQL, results, chart, and explanation")
    public ResponseEntity<ApiResponse<QueryResultResponse>> ask(
            @Valid @RequestBody AskQueryRequest request,
            @AuthenticationPrincipal SecurityUserDetails principal) {

        User user = principal.getUser();
        rateLimitService.checkAndIncrement(user.getId().toString());

        DataSource dataSource = dataSourceRepository.findById(request.getDataSourceId())
                .orElseThrow(() -> new ResourceNotFoundException("DataSource not found: " + request.getDataSourceId()));

        // Step 1: Generate SQL
        SqlGenerationService.SqlGenerationResult generated =
                sqlGenerationService.generate(dataSource.getId(), request.getQuestion());

        // Step 2: Handle clarification
        if (generated.isClarification()) {
            auditLogService.log(user, dataSource, request.getQuestion(), null,
                    ExecutionStatus.CLARIFICATION_NEEDED, null, null);
            return ResponseEntity.ok(ApiResponse.success(
                    QueryResultResponse.builder()
                            .status(ExecutionStatus.CLARIFICATION_NEEDED)
                            .clarificationMessage(generated.clarificationMessage())
                            .build()));
        }

        String sql = generated.sql();

        // Step 3: Safety validation (Layer 1)
        ValidationResult validation = sqlSafetyValidator.validate(sql);
        if (!validation.isValid()) {
            auditLogService.log(user, dataSource, request.getQuestion(), sql,
                    ExecutionStatus.REJECTED, null, validation.getReason());
            return ResponseEntity.unprocessableEntity().body(
                    ApiResponse.error("UNSAFE_SQL_REJECTED", validation.getReason()));
        }

        // Step 4: Execute (Layer 2 — read-only pool)
        QueryExecutionService.ExecutionResult result = queryExecutionService.execute(dataSource, sql);

        // Step 5: Determine chart type
        ChartConfig chart = chartMappingService.determineChart(result.columns(), result.rows());

        // Step 6: Generate explanation (non-fatal)
        String explanation = explanationService.explain(
                request.getQuestion(), result.rows().size(), result.rows());

        // Step 7: Audit log
        auditLogService.log(user, dataSource, request.getQuestion(), sql,
                ExecutionStatus.SUCCESS, result.executionTimeMs(), null);

        QueryResultResponse response = QueryResultResponse.builder()
                .sql(sql)
                .columns(result.columns())
                .rows(result.rows())
                .chart(chart)
                .explanation(explanation)
                .status(ExecutionStatus.SUCCESS)
                .executionTimeMs(result.executionTimeMs())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{logId}/rerun")
    @PreAuthorize("hasAnyRole('ANALYST', 'DATA_SOURCE_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Edit the generated SQL and rerun the query")
    public ResponseEntity<ApiResponse<QueryResultResponse>> rerun(
            @PathVariable Long logId,
            @Valid @RequestBody EditSqlRequest request,
            @AuthenticationPrincipal SecurityUserDetails principal) {

        QueryLog originalLog = queryLogRepository.findById(logId)
                .orElseThrow(() -> new ResourceNotFoundException("QueryLog not found: " + logId));

        // Safety validation on edited SQL
        ValidationResult validation = sqlSafetyValidator.validate(request.getEditedSql());
        if (!validation.isValid()) {
            throw new UnsafeSqlException(validation.getReason());
        }

        DataSource dataSource = originalLog.getDataSource();
        QueryExecutionService.ExecutionResult result =
                queryExecutionService.execute(dataSource, request.getEditedSql());

        ChartConfig chart = chartMappingService.determineChart(result.columns(), result.rows());
        String explanation = explanationService.explain(
                originalLog.getQuestionText(), result.rows().size(), result.rows());

        auditLogService.log(principal.getUser(), dataSource,
                originalLog.getQuestionText(), request.getEditedSql(),
                ExecutionStatus.SUCCESS, result.executionTimeMs(), null);

        return ResponseEntity.ok(ApiResponse.success(QueryResultResponse.builder()
                .sql(request.getEditedSql())
                .columns(result.columns())
                .rows(result.rows())
                .chart(chart)
                .explanation(explanation)
                .status(ExecutionStatus.SUCCESS)
                .executionTimeMs(result.executionTimeMs())
                .build()));
    }

    @GetMapping("/{logId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get a specific query log entry")
    public ResponseEntity<ApiResponse<QueryLogResponse>> getLog(
            @PathVariable Long logId,
            @AuthenticationPrincipal SecurityUserDetails principal) {
        QueryLog log = queryLogRepository.findById(logId)
                .orElseThrow(() -> new ResourceNotFoundException("QueryLog not found: " + logId));
        return ResponseEntity.ok(ApiResponse.success(toResponse(log)));
    }

    private QueryLogResponse toResponse(QueryLog log) {
        QueryLogResponse r = new QueryLogResponse();
        r.setId(log.getId());
        r.setQuestionText(log.getQuestionText());
        r.setGeneratedSql(log.getGeneratedSql());
        r.setExecutionStatus(log.getExecutionStatus().name());
        r.setExecutionTimeMs(log.getExecutionTimeMs());
        r.setCreatedAt(log.getCreatedAt().toString());
        return r;
    }
}
