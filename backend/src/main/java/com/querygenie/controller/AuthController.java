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

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login, token refresh, and logout")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .header(org.springframework.http.HttpHeaders.SET_COOKIE, createCookie(response.getRefreshToken(), 7 * 24 * 60 * 60))
                .body(ApiResponse.success(response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.SET_COOKIE, createCookie(response.getRefreshToken(), 7 * 24 * 60 * 60))
                .body(ApiResponse.success(response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using a refresh token cookie")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken(refreshToken);
        
        AuthResponse response = authService.refresh(request);
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
