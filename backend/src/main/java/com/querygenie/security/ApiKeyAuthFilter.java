package com.querygenie.security;

import com.querygenie.entity.ApiConsumer;
import com.querygenie.repository.ApiConsumerRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;

/**
 * Handles API Consumer requests authenticated via the {@code X-API-Key} header.
 * The raw key is SHA-256 hashed before lookup — keys are never stored plaintext.
 * Grants the API_CONSUMER role and scopes access to the consumer's data_source_id
 * (the service layer enforces the scope; this filter only sets identity).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    public static final String API_KEY_HEADER = "X-API-Key";

    private final ApiConsumerRepository apiConsumerRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Only process if not already authenticated by JWT
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String rawKey = request.getHeader(API_KEY_HEADER);
        if (!StringUtils.hasText(rawKey)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String keyHash = sha256Hex(rawKey);
            Optional<ApiConsumer> consumer = apiConsumerRepository.findByApiKeyHash(keyHash);

            if (consumer.isPresent()) {
                ApiConsumerPrincipal principal = new ApiConsumerPrincipal(consumer.get());
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        principal, null,
                        List.of(new SimpleGrantedAuthority("ROLE_API_CONSUMER"))
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-256 not available", e);
        }

        filterChain.doFilter(request, response);
    }

    private String sha256Hex(String input) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }
}
