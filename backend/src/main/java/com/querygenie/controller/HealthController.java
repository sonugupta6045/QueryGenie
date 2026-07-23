package com.querygenie.controller;

import com.querygenie.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@RequiredArgsConstructor
@Tag(name = "Health", description = "System health checks")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;
    private final StringRedisTemplate redisTemplate;

    @GetMapping
    @Operation(summary = "Health check — DB and Redis connectivity")
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {
        Map<String, String> status = new LinkedHashMap<>();
        status.put("status", "UP");

        // Check metadata DB
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            status.put("metadataDb", "UP");
        } catch (Exception e) {
            status.put("metadataDb", "DOWN: " + e.getMessage());
            status.put("status", "DEGRADED");
        }

        // Check Redis
        try {
            redisTemplate.opsForValue().set("health:ping", "pong");
            status.put("redis", "UP");
        } catch (Exception e) {
            status.put("redis", "DOWN: " + e.getMessage());
            status.put("status", "DEGRADED");
        }

        return ResponseEntity.ok(ApiResponse.success(status));
    }
}
