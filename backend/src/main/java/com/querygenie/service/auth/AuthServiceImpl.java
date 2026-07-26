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

import com.querygenie.dto.UserSessionResponse;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
    public AuthResponse register(RegisterRequest request, String userAgent, String ipAddress) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.ANALYST)
                .build();
        user = userRepository.save(user);

        return buildAuthResponse(user, java.util.UUID.randomUUID().toString(), userAgent, ipAddress);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request, String userAgent, String ipAddress) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return buildAuthResponse(user, java.util.UUID.randomUUID().toString(), userAgent, ipAddress);
    }

    @Override
    @Transactional(noRollbackFor = UnauthorizedException.class)
    public AuthResponse refresh(RefreshTokenRequest request, String userAgent, String ipAddress) {
        if (request == null || request.getRefreshToken() == null || request.getRefreshToken().isBlank()) {
            throw new UnauthorizedException("Refresh token is missing");
        }

        String tokenHash = hash(request.getRefreshToken());

        RefreshToken stored = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Refresh token is invalid"));

        if (stored.isRevoked()) {
            // Reuse detection: The presented token is already revoked/rotated.
            // Revoke the entire family immediately.
            log.warn("Token reuse detected for familyId: {}", stored.getFamilyId());
            refreshTokenRepository.revokeAllByFamilyId(stored.getFamilyId());
            throw new UnauthorizedException("Refresh token reuse detected. Session revoked.");
        }

        if (stored.getExpiresAt().isBefore(Instant.now())) {
            stored.setRevoked(true);
            refreshTokenRepository.save(stored);
            throw new UnauthorizedException("Refresh token has expired");
        }

        // Rotate: revoke old token (mark as rotated), issue new pair under SAME familyId
        stored.setRevoked(true);
        stored.setRotatedAt(Instant.now());
        refreshTokenRepository.save(stored);

        return buildAuthResponse(stored.getUser(), stored.getFamilyId(), userAgent, ipAddress);
    }

    @Override
    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }
        String tokenHash = hash(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(tokenHash)
                .ifPresent(token -> {
                    refreshTokenRepository.revokeAllByFamilyId(token.getFamilyId());
                });
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSessionResponse> getActiveSessions(String userEmail, String currentRefreshToken) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        String currentFamilyId = null;
        if (currentRefreshToken != null && !currentRefreshToken.isBlank()) {
            String tokenHash = hash(currentRefreshToken);
            currentFamilyId = refreshTokenRepository.findByTokenHash(tokenHash)
                    .map(RefreshToken::getFamilyId)
                    .orElse(null);
        }

        final String finalCurrentFamilyId = currentFamilyId;

        // Group active tokens by familyId to get latest device info & lastUsedAt per session
        List<RefreshToken> activeTokens = refreshTokenRepository.findByUserAndRevokedFalse(user);

        Map<String, RefreshToken> familyMap = activeTokens.stream()
                .filter(t -> t.getExpiresAt().isAfter(Instant.now()))
                .collect(Collectors.toMap(
                        RefreshToken::getFamilyId,
                        t -> t,
                        (existing, replacement) -> replacement.getCreatedAt().isAfter(existing.getCreatedAt()) ? replacement : existing
                ));

        return familyMap.values().stream()
                .map(t -> UserSessionResponse.builder()
                        .familyId(t.getFamilyId())
                        .deviceLabel(t.getDeviceLabel() != null ? t.getDeviceLabel() : "Unknown Device")
                        .userAgent(t.getUserAgent())
                        .ipAddress(t.getIpAddress())
                        .createdAt(t.getCreatedAt())
                        .lastUsedAt(t.getLastUsedAt() != null ? t.getLastUsedAt() : t.getCreatedAt())
                        .currentSession(t.getFamilyId().equals(finalCurrentFamilyId))
                        .build())
                .sorted((a, b) -> Boolean.compare(b.isCurrentSession(), a.isCurrentSession()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void revokeSession(String userEmail, String familyId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        refreshTokenRepository.revokeAllByFamilyId(familyId);
    }

    @Override
    @Transactional
    public void revokeOtherSessions(String userEmail, String currentRefreshToken) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        if (currentRefreshToken == null || currentRefreshToken.isBlank()) {
            throw new BadRequestException("Current session context missing");
        }

        String tokenHash = hash(currentRefreshToken);
        RefreshToken stored = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Session invalid"));

        refreshTokenRepository.revokeAllOtherSessions(user, stored.getFamilyId());
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private AuthResponse buildAuthResponse(User user, String familyId, String userAgent, String ipAddress) {
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String rawRefreshToken = jwtTokenProvider.generateRefreshToken();

        Instant now = Instant.now();
        String deviceLabel = parseDeviceLabel(userAgent);

        // Store hashed refresh token
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(hash(rawRefreshToken))
                .familyId(familyId)
                .expiresAt(now.plusMillis(jwtTokenProvider.getRefreshTokenExpiryMs()))
                .revoked(false)
                .userAgent(userAgent)
                .ipAddress(ipAddress)
                .deviceLabel(deviceLabel)
                .lastUsedAt(now)
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    private String parseDeviceLabel(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) return "Unknown Device";
        String ua = userAgent.toLowerCase();
        
        String browser = "Browser";
        if (ua.contains("chrome") && !ua.contains("edg")) browser = "Chrome";
        else if (ua.contains("firefox")) browser = "Firefox";
        else if (ua.contains("safari") && !ua.contains("chrome")) browser = "Safari";
        else if (ua.contains("edg")) browser = "Edge";

        String os = "Unknown OS";
        if (ua.contains("windows")) os = "Windows";
        else if (ua.contains("mac os x") || ua.contains("macintosh")) os = "macOS";
        else if (ua.contains("android")) os = "Android";
        else if (ua.contains("iphone") || ua.contains("ipad")) os = "iOS";
        else if (ua.contains("linux")) os = "Linux";

        return browser + " on " + os;
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
