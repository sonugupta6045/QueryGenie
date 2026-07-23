package com.querygenie.mapper;

import com.querygenie.dto.DataSourceCreateRequest;
import com.querygenie.dto.DataSourceResponse;
import com.querygenie.entity.DataSource;
import com.querygenie.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-23T00:34:45+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.16 (Oracle Corporation)"
)
@Component
public class DataSourceMapperImpl implements DataSourceMapper {

    @Override
    public DataSource toEntity(DataSourceCreateRequest request) {
        if ( request == null ) {
            return null;
        }

        DataSource.DataSourceBuilder dataSource = DataSource.builder();

        dataSource.name( request.getName() );
        dataSource.dbHost( request.getDbHost() );
        dataSource.dbPort( request.getDbPort() );
        dataSource.dbName( request.getDbName() );

        return dataSource.build();
    }

    @Override
    public DataSourceResponse toResponse(DataSource dataSource) {
        if ( dataSource == null ) {
            return null;
        }

        DataSourceResponse.DataSourceResponseBuilder dataSourceResponse = DataSourceResponse.builder();

        dataSourceResponse.ownerId( dataSourceOwnerId( dataSource ) );
        dataSourceResponse.id( dataSource.getId() );
        dataSourceResponse.name( dataSource.getName() );
        dataSourceResponse.dbHost( dataSource.getDbHost() );
        dataSourceResponse.dbPort( dataSource.getDbPort() );
        dataSourceResponse.dbName( dataSource.getDbName() );
        dataSourceResponse.createdAt( dataSource.getCreatedAt() );
        dataSourceResponse.updatedAt( dataSource.getUpdatedAt() );

        return dataSourceResponse.build();
    }

    private Long dataSourceOwnerId(DataSource dataSource) {
        if ( dataSource == null ) {
            return null;
        }
        User owner = dataSource.getOwner();
        if ( owner == null ) {
            return null;
        }
        Long id = owner.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
