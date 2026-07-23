package com.querygenie.service.ratelimit;

import com.querygenie.exception.RateLimitExceededException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Redis sliding-window rate limiter keyed by consumer ID.
 * Uses a simple counter with TTL — one window per consumer.
 * Window size: 1 minute. Default limit: 60 requests/minute.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitService {

    private static final String KEY_PREFIX = "ratelimit:";
    private static final int DEFAULT_LIMIT = 60;
    private static final Duration WINDOW = Duration.ofMinutes(1);

    private final StringRedisTemplate redisTemplate;

    /**
     * Checks and increments the rate limit counter for the given key.
     *
     * @param consumerId the rate limit subject (apiConsumerId or userId)
     * @throws RateLimitExceededException if the limit is exceeded
     */
    public void checkAndIncrement(String consumerId) {
        String key = KEY_PREFIX + consumerId;

        Long count = redisTemplate.opsForValue().increment(key);

        if (count != null && count == 1) {
            // First request in this window — set TTL
            redisTemplate.expire(key, WINDOW);
        }

        if (count != null && count > DEFAULT_LIMIT) {
            log.warn("Rate limit exceeded for consumerId={}, count={}", consumerId, count);
            throw new RateLimitExceededException(
                    "Rate limit exceeded. Maximum " + DEFAULT_LIMIT + " requests per minute.");
        }
    }
}
