package com.querygenie.controller;

import com.querygenie.dto.ApiResponse;
import com.querygenie.enums.ExecutionStatus;
import com.querygenie.enums.Role;
import com.querygenie.exception.ResourceNotFoundException;
import com.querygenie.repository.QueryLogRepository;
import com.querygenie.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Usage analytics and user management (SUPER_ADMIN only)")
@Slf4j
public class AdminController {

    private final QueryLogRepository queryLogRepository;
    private final UserRepository userRepository;

    @GetMapping("/analytics/usage")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'DATA_SOURCE_ADMIN')")
    @Operation(summary = "Get usage analytics: total queries, success rate, avg latency")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUsage() {
        long total = queryLogRepository.count();
        long failures = queryLogRepository.countFailuresSince(Instant.now().minus(30, ChronoUnit.DAYS));
        double successRate = total > 0 ? ((double)(total - failures) / total) * 100.0 : 100.0;
        Double avgLatency = queryLogRepository.findAvgExecutionTimeMs();
        
        var dsCounts = queryLogRepository.countQueriesByDataSource().stream()
                .map(row -> Map.of(
                        "dataSourceId", row[0],
                        "dataSourceName", row[1] != null ? row[1] : "Unknown",
                        "queryCount", row[2]
                ))
                .toList();

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "totalQueries", total,
                "successRate", Math.round(successRate * 10.0) / 10.0,
                "avgLatencyMs", Math.round((avgLatency != null ? avgLatency : 0.0) * 10.0) / 10.0,
                "byDataSource", dsCounts
        )));
    }

    @GetMapping("/analytics/top-questions")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'DATA_SOURCE_ADMIN')")
    @Operation(summary = "Get top asked questions")
    public ResponseEntity<ApiResponse<java.util.List<Map<String, Object>>>> getTopQuestions() {
        var topQuestions = queryLogRepository.findTopQuestions(org.springframework.data.domain.PageRequest.of(0, 10)).stream()
                .map(row -> Map.of(
                        "question", row[0] != null ? row[0] : "",
                        "count", row[1]
                ))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(topQuestions));
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "List all users")
    public ResponseEntity<ApiResponse<?>> listUsers(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(userRepository.findAll(pageable)));
    }

    @PatchMapping("/users/{id}/role")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update a user's role")
    public ResponseEntity<ApiResponse<String>> updateRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String roleStr = body.get("role");
        Role role;
        try {
            role = Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("BAD_REQUEST", "Invalid role: " + roleStr));
        }

        var user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setRole(role);
        userRepository.save(user);
        log.info("Role updated for userId={} to {}", id, role);
        return ResponseEntity.ok(ApiResponse.success("Role updated to " + role.name()));
    }
}
