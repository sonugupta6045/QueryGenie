package com.querygenie.mapper;

import com.querygenie.dto.QueryLogResponse;
import com.querygenie.entity.DataSource;
import com.querygenie.entity.QueryLog;
import com.querygenie.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-23T00:34:46+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.16 (Oracle Corporation)"
)
@Component
public class QueryLogMapperImpl implements QueryLogMapper {

    @Override
    public QueryLogResponse toResponse(QueryLog queryLog) {
        if ( queryLog == null ) {
            return null;
        }

        QueryLogResponse.QueryLogResponseBuilder queryLogResponse = QueryLogResponse.builder();

        queryLogResponse.userId( queryLogUserId( queryLog ) );
        queryLogResponse.dataSourceId( queryLogDataSourceId( queryLog ) );
        queryLogResponse.id( queryLog.getId() );
        queryLogResponse.questionText( queryLog.getQuestionText() );
        queryLogResponse.generatedSql( queryLog.getGeneratedSql() );
        if ( queryLog.getExecutionStatus() != null ) {
            queryLogResponse.executionStatus( queryLog.getExecutionStatus().name() );
        }
        queryLogResponse.executionTimeMs( queryLog.getExecutionTimeMs() );
        queryLogResponse.errorMessage( queryLog.getErrorMessage() );
        if ( queryLog.getCreatedAt() != null ) {
            queryLogResponse.createdAt( queryLog.getCreatedAt().toString() );
        }

        return queryLogResponse.build();
    }

    private Long queryLogUserId(QueryLog queryLog) {
        if ( queryLog == null ) {
            return null;
        }
        User user = queryLog.getUser();
        if ( user == null ) {
            return null;
        }
        Long id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private Long queryLogDataSourceId(QueryLog queryLog) {
        if ( queryLog == null ) {
            return null;
        }
        DataSource dataSource = queryLog.getDataSource();
        if ( dataSource == null ) {
            return null;
        }
        Long id = dataSource.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
