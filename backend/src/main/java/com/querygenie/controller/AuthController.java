package com.querygenie.controller;

import com.querygenie.dto.ApiResponse;
import com.querygenie.dto.AuthResponse;
import com.querygenie.dto.LoginRequest;
import com.querygenie.dto.RefreshTokenRequest;
import com.querygenie.dto.RegisterRequest;
import com.querygenie.service.auth.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.querygenie.dto.UserSessionResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login, token refresh, sessions management, and logout")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            HttpServletRequest httpRequest) {
        String clientIp = extractClientIp(httpRequest);
        AuthResponse response = authService.register(request, userAgent, clientIp);
        return ResponseEntity.status(HttpStatus.CREATED)
                .header(org.springframework.http.HttpHeaders.SET_COOKIE, createCookie(response.getRefreshToken(), 7 * 24 * 60 * 60))
                .body(ApiResponse.success(response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            HttpServletRequest httpRequest) {
        String clientIp = extractClientIp(httpRequest);
        AuthResponse response = authService.login(request, userAgent, clientIp);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.SET_COOKIE, createCookie(response.getRefreshToken(), 7 * 24 * 60 * 60))
                .body(ApiResponse.success(response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using a refresh token cookie")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            HttpServletRequest httpRequest) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken(refreshToken);
        
        String clientIp = extractClientIp(httpRequest);
        AuthResponse response = authService.refresh(request, userAgent, clientIp);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.SET_COOKIE, createCookie(response.getRefreshToken(), 7 * 24 * 60 * 60))
                .body(ApiResponse.success(response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Revoke the supplied refresh token (logout)")
    public ResponseEntity<Void> logout(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            authService.logout(refreshToken);
        }
        return ResponseEntity.noContent()
                .header(org.springframework.http.HttpHeaders.SET_COOKIE, createCookie("", 0))
                .build();
    }

    @GetMapping("/sessions")
    @Operation(summary = "List all active sessions for the current user")
    public ResponseEntity<ApiResponse<List<UserSessionResponse>>> getActiveSessions(
            @AuthenticationPrincipal UserDetails userDetails,
            @CookieValue(name = "refreshToken", required = false) String refreshToken) {
        List<UserSessionResponse> sessions = authService.getActiveSessions(userDetails.getUsername(), refreshToken);
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    @DeleteMapping("/sessions/{familyId}")
    @Operation(summary = "Revoke a specific session family")
    public ResponseEntity<ApiResponse<Void>> revokeSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String familyId) {
        authService.revokeSession(userDetails.getUsername(), familyId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/sessions/revoke-others")
    @Operation(summary = "Revoke all other active sessions for current user except current one")
    public ResponseEntity<ApiResponse<Void>> revokeOtherSessions(
            @AuthenticationPrincipal UserDetails userDetails,
            @CookieValue(name = "refreshToken", required = false) String refreshToken) {
        authService.revokeOtherSessions(userDetails.getUsername(), refreshToken);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String createCookie(String value, long maxAge) {
        return org.springframework.http.ResponseCookie.from("refreshToken", value)
                .httpOnly(true)
                .secure(true) // Should be true for production/HTTPS
                .sameSite("Strict")
                .path("/api/v1/auth")
                .maxAge(maxAge)
                .build()
                .toString();
    }
}
