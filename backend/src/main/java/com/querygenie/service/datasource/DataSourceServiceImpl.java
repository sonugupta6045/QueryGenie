package com.querygenie.service.datasource;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.querygenie.dto.DataSourceCreateRequest;
import com.querygenie.dto.DataSourceResponse;
import com.querygenie.dto.DataSourceUpdateRequest;
import com.querygenie.entity.DataSource;
import com.querygenie.entity.User;
import com.querygenie.exception.BadRequestException;
import com.querygenie.exception.ResourceNotFoundException;
import com.querygenie.exception.UnauthorizedException;
import com.querygenie.mapper.DataSourceMapper;
import com.querygenie.repository.DataSourceRepository;
import com.querygenie.repository.UserRepository;
import com.querygenie.service.schema.SchemaIntrospectionService;
import com.querygenie.util.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataSourceServiceImpl implements DataSourceService {

    private final DataSourceRepository dataSourceRepository;
    private final UserRepository userRepository;
    private final DataSourceMapper dataSourceMapper;
    private final EncryptionUtil encryptionUtil;
    private final SchemaIntrospectionService schemaIntrospectionService;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public DataSourceResponse create(Long ownerId, DataSourceCreateRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + ownerId));

        String credentials = request.getDbUsername() + ":" + request.getDbPassword();
        String encryptedCredentials = encryptionUtil.encrypt(credentials);

        DataSource ds = DataSource.builder()
                .name(request.getName())
                .owner(owner)
                .dbHost(request.getDbHost())
                .dbPort(request.getDbPort())
                .dbName(request.getDbName())
                .encryptedCredentials(encryptedCredentials)
                .build();

        ds = dataSourceRepository.save(ds);
        log.info("Data source created: id={}, name={}, owner={}", ds.getId(), ds.getName(), ownerId);
        return dataSourceMapper.toResponse(ds);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DataSourceResponse> listAll(Long ownerId, Pageable pageable) {
        return dataSourceRepository.findByOwnerId(ownerId, pageable)
                .map(dataSourceMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public DataSourceResponse getById(Long id, Long requestingUserId) {
        DataSource ds = findAndAuthorize(id, requestingUserId);
        return dataSourceMapper.toResponse(ds);
    }

    @Override
    @Transactional
    public DataSourceResponse update(Long id, Long requestingUserId, DataSourceUpdateRequest request) {
        DataSource ds = findAndAuthorize(id, requestingUserId);

        if (StringUtils.hasText(request.getName())) ds.setName(request.getName());
        if (StringUtils.hasText(request.getDbHost())) ds.setDbHost(request.getDbHost());
        if (request.getDbPort() != null) ds.setDbPort(request.getDbPort());
        if (StringUtils.hasText(request.getDbName())) ds.setDbName(request.getDbName());

        // If new credentials provided, re-encrypt
        if (StringUtils.hasText(request.getDbUsername()) && StringUtils.hasText(request.getDbPassword())) {
            ds.setEncryptedCredentials(encryptionUtil.encrypt(
                    request.getDbUsername() + ":" + request.getDbPassword()));
        }

        return dataSourceMapper.toResponse(dataSourceRepository.save(ds));
    }

    @Override
    @Transactional
    public void delete(Long id, Long requestingUserId) {
        DataSource ds = findAndAuthorize(id, requestingUserId);
        dataSourceRepository.delete(ds);
        log.info("Data source deleted: id={}, by user={}", id, requestingUserId);
    }

    @Override
    @Transactional
    public Map<String, Object> refreshSchema(Long id, Long requestingUserId) {
        DataSource ds = findAndAuthorize(id, requestingUserId);
        Map<String, Object> summary = schemaIntrospectionService.introspectAndCache(ds);
        log.info("Schema refreshed for dataSourceId={}", id);
        return summary;
    }

    @Override
    @Transactional(readOnly = true)
    public String getSchema(Long id, Long requestingUserId) {
        findAndAuthorize(id, requestingUserId);
        return schemaIntrospectionService.getCachedSchema(id);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private DataSource findAndAuthorize(Long id, Long requestingUserId) {
        DataSource ds = dataSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DataSource not found: " + id));
        if (!ds.getOwner().getId().equals(requestingUserId)) {
            throw new UnauthorizedException("Access denied to data source: " + id);
        }
        return ds;
    }
}
