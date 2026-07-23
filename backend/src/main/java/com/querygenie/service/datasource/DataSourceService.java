package com.querygenie.service.datasource;

import com.querygenie.dto.DataSourceCreateRequest;
import com.querygenie.dto.DataSourceResponse;
import com.querygenie.dto.DataSourceUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface DataSourceService {

    DataSourceResponse create(Long ownerId, DataSourceCreateRequest request);

    Page<DataSourceResponse> listAll(Long ownerId, Pageable pageable);

    DataSourceResponse getById(Long id, Long requestingUserId);

    DataSourceResponse update(Long id, Long requestingUserId, DataSourceUpdateRequest request);

    void delete(Long id, Long requestingUserId);

    /**
     * Triggers a fresh schema introspection for the given data source.
     *
     * @return summary: tableCount, columnCount, cachedAt
     */
    Map<String, Object> refreshSchema(Long id, Long requestingUserId);
}
