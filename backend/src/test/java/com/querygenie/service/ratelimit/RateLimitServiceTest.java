package com.querygenie.service.ratelimit;

import com.querygenie.exception.RateLimitExceededException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RateLimitServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private RateLimitService rateLimitService;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void checkAndIncrement_firstRequest_setsExpiry() {
        String consumerId = "consumer-1";
        String key = "ratelimit:" + consumerId;

        when(valueOperations.increment(key)).thenReturn(1L);

        rateLimitService.checkAndIncrement(consumerId);

        verify(valueOperations).increment(key);
        verify(redisTemplate).expire(eq(key), any(Duration.class));
    }

    @Test
    void checkAndIncrement_subsequentRequestWithinLimit_succeeds() {
        String consumerId = "consumer-2";
        String key = "ratelimit:" + consumerId;

        when(valueOperations.increment(key)).thenReturn(5L);

        rateLimitService.checkAndIncrement(consumerId);

        verify(valueOperations).increment(key);
        verify(redisTemplate, never()).expire(anyString(), any(Duration.class));
    }

    @Test
    void checkAndIncrement_exceedsLimit_throwsException() {
        String consumerId = "consumer-3";
        String key = "ratelimit:" + consumerId;

        when(valueOperations.increment(key)).thenReturn(61L); // DEFAULT_LIMIT + 1

        assertThrows(RateLimitExceededException.class, () -> 
            rateLimitService.checkAndIncrement(consumerId)
        );

        verify(valueOperations).increment(key);
        verify(redisTemplate, never()).expire(anyString(), any(Duration.class));
    }
}
