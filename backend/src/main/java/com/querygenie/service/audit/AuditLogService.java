package com.querygenie.service.audit;

import com.querygenie.entity.DataSource;
import com.querygenie.entity.QueryLog;
import com.querygenie.entity.User;
import com.querygenie.enums.ExecutionStatus;
import com.querygenie.repository.QueryLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Persists every query attempt — including failures and rejections —
 * to satisfy the auditability NFR (Phase 1 §NFR / Phase 2 §8).
 * Uses REQUIRES_NEW propagation so audit records are committed even if the outer
 * transaction rolls back (e.g., on a query execution failure).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final QueryLogRepository queryLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public QueryLog log(User user,
                        DataSource dataSource,
                        String question,
                        String generatedSql,
                        ExecutionStatus status,
                        Long executionTimeMs,
                        String errorMessage) {
        QueryLog entry = QueryLog.builder()
                .user(user)
                .dataSource(dataSource)
                .questionText(question)
                .generatedSql(generatedSql)
                .executionStatus(status)
                .executionTimeMs(executionTimeMs)
                .errorMessage(errorMessage)
                .build();
        return queryLogRepository.save(entry);
    }
}
