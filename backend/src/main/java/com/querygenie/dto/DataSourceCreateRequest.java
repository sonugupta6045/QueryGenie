package com.querygenie.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DataSourceCreateRequest {

    @NotBlank(message = "Data source name is required")
    private String name;

    @NotBlank(message = "Host is required")
    private String dbHost;

    @NotNull(message = "Port is required")
    @Min(value = 1, message = "Port must be greater than 0")
    @Max(value = 65535, message = "Port must be less than 65536")
    private Integer dbPort;

    @NotBlank(message = "Database name is required")
    private String dbName;

    @NotBlank(message = "Username is required")
    private String dbUsername;

    @NotBlank(message = "Password is required")
    private String dbPassword;
}
