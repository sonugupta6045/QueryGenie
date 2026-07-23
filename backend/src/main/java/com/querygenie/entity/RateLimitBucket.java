package com.querygenie.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "rate_limit_buckets", uniqueConstraints = {
    @UniqueConstraint(name = "uk_consumer_window", columnNames = {"api_consumer_id", "window_start"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RateLimitBucket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "api_consumer_id", nullable = false)
    private ApiConsumer apiConsumer;

    @Column(name = "window_start", nullable = false)
    private Instant windowStart;

    @Column(name = "request_count", nullable = false)
    private Integer requestCount;
}
