package com.querygenie.service.auth;

import com.querygenie.dto.AuthResponse;
import com.querygenie.dto.LoginRequest;
import com.querygenie.dto.RefreshTokenRequest;
import com.querygenie.dto.RegisterRequest;
import com.querygenie.entity.RefreshToken;
import com.querygenie.entity.User;
import com.querygenie.enums.Role;
import com.querygenie.exception.BadRequestException;
import com.querygenie.exception.ResourceNotFoundException;
import com.querygenie.exception.UnauthorizedException;
import com.querygenie.repository.RefreshTokenRepository;
import com.querygenie.repository.UserRepository;
import com.querygenie.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.ANALYST) // use requested role or default
                .build();
        user = userRepository.save(user);

        return buildAuthResponse(user, java.util.UUID.randomUUID().toString());
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return buildAuthResponse(user, java.util.UUID.randomUUID().toString());
    }

    @Override
    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        if (request == null || request.getRefreshToken() == null || request.getRefreshToken().isBlank()) {
            throw new UnauthorizedException("Refresh token is missing");
        }

        String tokenHash = hash(request.getRefreshToken());

        RefreshToken stored = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Refresh token is invalid"));

        if (stored.isRevoked()) {
            // Reuse detection: The presented token is already revoked/rotated.
            // This is a compromise signal. Revoke the entire family immediately.
            log.warn("Token reuse detected for familyId: {}", stored.getFamilyId());
            refreshTokenRepository.revokeAllByFamilyId(stored.getFamilyId());
            throw new UnauthorizedException("Refresh token reuse detected. Session revoked.");
        }

        if (stored.getExpiresAt().isBefore(Instant.now())) {
            stored.setRevoked(true);
            refreshTokenRepository.save(stored);
            throw new UnauthorizedException("Refresh token has expired");
        }

        // Rotate: revoke old token (mark as rotated), issue new pair
        stored.setRevoked(true);
        stored.setRotatedAt(Instant.now());
        refreshTokenRepository.save(stored);

        return buildAuthResponse(stored.getUser(), stored.getFamilyId());
    }

    @Override
    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return; // Nothing to revoke
        }
        String tokenHash = hash(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(tokenHash)
                .ifPresent(token -> {
                    refreshTokenRepository.revokeAllByFamilyId(token.getFamilyId());
                });
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private AuthResponse buildAuthResponse(User user, String familyId) {
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String rawRefreshToken = jwtTokenProvider.generateRefreshToken();

        // Store hashed refresh token
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(hash(rawRefreshToken))
                .familyId(familyId)
                .expiresAt(Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenExpiryMs()))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken) // @JsonIgnore prevents this from being sent in response body
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    private String hash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 unavailable", e);
        }
    }
}
