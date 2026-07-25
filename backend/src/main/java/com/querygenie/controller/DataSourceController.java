package com.querygenie.controller;

import com.querygenie.dto.ApiResponse;
import com.querygenie.dto.DataSourceCreateRequest;
import com.querygenie.dto.DataSourceResponse;
import com.querygenie.dto.DataSourceUpdateRequest;
import com.querygenie.security.SecurityUserDetails;
import com.querygenie.service.datasource.DataSourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/data-sources")
@RequiredArgsConstructor
@Tag(name = "Data Sources", description = "Register, list, update, and delete tenant data sources")
public class DataSourceController {

    private final DataSourceService dataSourceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DATA_SOURCE_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Register a new data source")
    public ResponseEntity<ApiResponse<DataSourceResponse>> create(
            @Valid @RequestBody DataSourceCreateRequest request,
            @AuthenticationPrincipal SecurityUserDetails principal) {
        DataSourceResponse response = dataSourceService.create(principal.getUser().getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List all data sources owned by the authenticated user")
    public ResponseEntity<ApiResponse<Page<DataSourceResponse>>> listAll(
            @AuthenticationPrincipal SecurityUserDetails principal,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        Page<DataSourceResponse> page = dataSourceService.listAll(principal.getUser().getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get a specific data source by ID")
    public ResponseEntity<ApiResponse<DataSourceResponse>> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUserDetails principal) {
        DataSourceResponse response = dataSourceService.getById(id, principal.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update a data source")
    public ResponseEntity<ApiResponse<DataSourceResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody DataSourceUpdateRequest request,
            @AuthenticationPrincipal SecurityUserDetails principal) {
        DataSourceResponse response = dataSourceService.update(id, principal.getUser().getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete a data source")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUserDetails principal) {
        dataSourceService.delete(id, principal.getUser().getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/refresh-schema")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Trigger a schema refresh for this data source")
    public ResponseEntity<ApiResponse<Map<String, Object>>> refreshSchema(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUserDetails principal) {
        Map<String, Object> summary = dataSourceService.refreshSchema(id, principal.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/{id}/schema")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get cached schema JSON for this data source")
    public ResponseEntity<ApiResponse<String>> getSchema(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUserDetails principal) {
        String schemaJson = dataSourceService.getSchema(id, principal.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success(schemaJson));
    }
}
