package com.querygenie.service.auth;

import com.querygenie.dto.AuthResponse;
import com.querygenie.dto.LoginRequest;
import com.querygenie.dto.RefreshTokenRequest;
import com.querygenie.dto.RegisterRequest;

import com.querygenie.dto.UserSessionResponse;
import java.util.List;

public interface AuthService {

    AuthResponse register(RegisterRequest request, String userAgent, String ipAddress);

    AuthResponse login(LoginRequest request, String userAgent, String ipAddress);

    AuthResponse refresh(RefreshTokenRequest request, String userAgent, String ipAddress);

    void logout(String refreshToken);

    List<UserSessionResponse> getActiveSessions(String userEmail, String currentRefreshToken);

    void revokeSession(String userEmail, String familyId);

    void revokeOtherSessions(String userEmail, String currentRefreshToken);
}
