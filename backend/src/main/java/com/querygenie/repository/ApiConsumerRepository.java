package com.querygenie.repository;

import com.querygenie.entity.ApiConsumer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApiConsumerRepository extends JpaRepository<ApiConsumer, Long> {
    Optional<ApiConsumer> findByApiKeyHash(String apiKeyHash);
}
