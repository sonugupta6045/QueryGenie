package com.querygenie.repository;

import com.querygenie.entity.RateLimitBucket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface RateLimitBucketRepository extends JpaRepository<RateLimitBucket, Long> {
    Optional<RateLimitBucket> findByApiConsumerIdAndWindowStart(Long apiConsumerId, Instant windowStart);
}
