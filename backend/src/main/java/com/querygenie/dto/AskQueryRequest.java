package com.querygenie.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class AskQueryRequest {

    @NotNull(message = "dataSourceId is required")
    private Long dataSourceId;

    @NotBlank(message = "question must not be blank")
    private String question;
}
