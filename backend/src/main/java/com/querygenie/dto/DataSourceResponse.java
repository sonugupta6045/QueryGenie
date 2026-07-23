package com.querygenie.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DataSourceResponse {

    private Long id;
    private String name;
    private Long ownerId;
    private String dbHost;
    private Integer dbPort;
    private String dbName;
    private Instant createdAt;
    private Instant updatedAt;
}
