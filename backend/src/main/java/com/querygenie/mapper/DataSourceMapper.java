package com.querygenie.mapper;

import com.querygenie.dto.DataSourceCreateRequest;
import com.querygenie.dto.DataSourceResponse;
import com.querygenie.entity.DataSource;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DataSourceMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "encryptedCredentials", ignore = true)
    @Mapping(target = "schemaCache", ignore = true)
    @Mapping(target = "schemaCachedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    DataSource toEntity(DataSourceCreateRequest request);

    @Mapping(target = "ownerId", source = "owner.id")
    DataSourceResponse toResponse(DataSource dataSource);
}
