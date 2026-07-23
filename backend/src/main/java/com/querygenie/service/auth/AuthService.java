package com.querygenie.service.auth;

import com.querygenie.dto.AuthResponse;
import com.querygenie.dto.LoginRequest;
import com.querygenie.dto.RefreshTokenRequest;
import com.querygenie.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(RefreshTokenRequest request);

    void logout(String refreshToken);
}
