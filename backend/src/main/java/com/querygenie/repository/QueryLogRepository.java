package com.querygenie.repository;

import com.querygenie.entity.QueryLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface QueryLogRepository extends JpaRepository<QueryLog, Long> {

    Page<QueryLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<QueryLog> findByDataSourceIdOrderByCreatedAtDesc(Long dataSourceId, Pageable pageable);

    @Query("SELECT COUNT(q) FROM QueryLog q WHERE q.executionStatus = 'FAILED' AND q.createdAt > :since")
    long countFailuresSince(@Param("since") Instant since);
}
