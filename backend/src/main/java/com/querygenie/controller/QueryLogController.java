package com.querygenie.controller;

import com.querygenie.dto.ApiResponse;
import com.querygenie.dto.QueryLogResponse;
import com.querygenie.entity.QueryLog;
import com.querygenie.exception.ResourceNotFoundException;
import com.querygenie.repository.QueryLogRepository;
import com.querygenie.security.SecurityUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.StringJoiner;

@RestController
@RequestMapping("/api/v1/query-logs")
@RequiredArgsConstructor
@Tag(name = "Query History", description = "View and export query history")
public class QueryLogController {

    private final QueryLogRepository queryLogRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ANALYST', 'DATA_SOURCE_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "List query history for the authenticated user")
    public ResponseEntity<ApiResponse<Page<QueryLogResponse>>> list(
            @AuthenticationPrincipal SecurityUserDetails principal,
            @RequestParam(required = false) Long dataSourceId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

        com.querygenie.enums.ExecutionStatus execStatus = null;
        if (org.springframework.util.StringUtils.hasText(status)) {
            try {
                execStatus = com.querygenie.enums.ExecutionStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid status enum string
            }
        }

        String searchPattern = org.springframework.util.StringUtils.hasText(search)
                ? "%" + search.trim().toLowerCase() + "%"
                : null;

        Page<QueryLogResponse> page = queryLogRepository
                .findByUserIdAndFilters(principal.getUser().getId(), dataSourceId, execStatus, searchPattern, pageable)
                .map(this::toResponse);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/{id}/export")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Export a query log as CSV")
    public ResponseEntity<byte[]> export(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUserDetails principal) {
        QueryLog log = queryLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QueryLog not found: " + id));

        // Build a simple CSV of the log metadata
        StringJoiner csv = new StringJoiner("\n");
        csv.add("field,value");
        csv.add("id," + log.getId());
        csv.add("question,\"" + escapeCsv(log.getQuestionText()) + "\"");
        csv.add("generatedSql,\"" + escapeCsv(log.getGeneratedSql()) + "\"");
        csv.add("status," + log.getExecutionStatus().name());
        csv.add("executionTimeMs," + log.getExecutionTimeMs());
        csv.add("createdAt," + log.getCreatedAt());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header("Content-Disposition", "attachment; filename=query-log-" + id + ".csv")
                .body(csv.toString().getBytes());
    }

    private QueryLogResponse toResponse(QueryLog log) {
        QueryLogResponse r = new QueryLogResponse();
        r.setId(log.getId());
        r.setUserId(log.getUser() != null ? log.getUser().getId() : null);
        if (log.getDataSource() != null) {
            r.setDataSourceId(log.getDataSource().getId());
            r.setDataSourceName(log.getDataSource().getName());
        }
        r.setQuestionText(log.getQuestionText());
        r.setGeneratedSql(log.getGeneratedSql());
        r.setExecutionStatus(log.getExecutionStatus().name());
        r.setExecutionTimeMs(log.getExecutionTimeMs());
        r.setErrorMessage(log.getErrorMessage());
        r.setCreatedAt(log.getCreatedAt() != null ? log.getCreatedAt().toString() : null);
        return r;
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
}
