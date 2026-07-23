package com.querygenie.repository;

import com.querygenie.entity.DataSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DataSourceRepository extends JpaRepository<DataSource, Long> {

    Page<DataSource> findByOwnerId(Long ownerId, Pageable pageable);

    Optional<DataSource> findByIdAndOwnerId(Long id, Long ownerId);
}
