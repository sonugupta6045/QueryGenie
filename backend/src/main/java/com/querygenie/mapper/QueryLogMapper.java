package com.querygenie.mapper;

import com.querygenie.dto.QueryLogResponse;
import com.querygenie.entity.QueryLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QueryLogMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "dataSourceId", source = "dataSource.id")
    QueryLogResponse toResponse(QueryLog queryLog);
}
