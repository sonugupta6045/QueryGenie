package com.querygenie.security;

import com.querygenie.entity.ApiConsumer;
import com.querygenie.repository.ApiConsumerRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApiKeyAuthFilterTest {

    @Mock
    private ApiConsumerRepository apiConsumerRepository;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private ApiKeyAuthFilter apiKeyAuthFilter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_validApiKey_setsAuthentication() throws ServletException, IOException, NoSuchAlgorithmException {
        String rawKey = "test-api-key-123";
        String keyHash = sha256Hex(rawKey);
        
        ApiConsumer consumer = new ApiConsumer();
        consumer.setId(1L);
        consumer.setClientName("Test Consumer");
        
        com.querygenie.entity.DataSource ds = new com.querygenie.entity.DataSource();
        ds.setId(10L);
        consumer.setDataSource(ds);

        when(request.getHeader("X-API-Key")).thenReturn(rawKey);
        when(apiConsumerRepository.findByApiKeyHash(keyHash)).thenReturn(Optional.of(consumer));

        apiKeyAuthFilter.doFilterInternal(request, response, filterChain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertTrue(auth instanceof UsernamePasswordAuthenticationToken);
        assertEquals("ROLE_API_CONSUMER", auth.getAuthorities().iterator().next().getAuthority());
        
        ApiConsumerPrincipal principal = (ApiConsumerPrincipal) auth.getPrincipal();
        assertEquals(1L, principal.getApiConsumer().getId());
        assertEquals(10L, principal.getApiConsumer().getDataSource().getId());
        
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_invalidApiKey_doesNotSetAuthentication() throws ServletException, IOException, NoSuchAlgorithmException {
        String rawKey = "invalid-api-key";
        String keyHash = sha256Hex(rawKey);

        when(request.getHeader("X-API-Key")).thenReturn(rawKey);
        when(apiConsumerRepository.findByApiKeyHash(keyHash)).thenReturn(Optional.empty());

        apiKeyAuthFilter.doFilterInternal(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_noApiKey_doesNotSetAuthentication() throws ServletException, IOException {
        when(request.getHeader("X-API-Key")).thenReturn(null);

        apiKeyAuthFilter.doFilterInternal(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_alreadyAuthenticated_skipsFilter() throws ServletException, IOException {
        Authentication existingAuth = mock(Authentication.class);
        SecurityContextHolder.getContext().setAuthentication(existingAuth);

        apiKeyAuthFilter.doFilterInternal(request, response, filterChain);

        verify(request, never()).getHeader("X-API-Key");
        verify(apiConsumerRepository, never()).findByApiKeyHash(anyString());
        verify(filterChain).doFilter(request, response);
        assertEquals(existingAuth, SecurityContextHolder.getContext().getAuthentication());
    }

    private String sha256Hex(String input) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }
}
