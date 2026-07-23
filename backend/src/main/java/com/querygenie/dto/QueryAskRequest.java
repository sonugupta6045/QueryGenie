package com.querygenie.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QueryAskRequest {

    @NotNull(message = "Data source ID is required")
    private Long dataSourceId;

    @NotBlank(message = "Question text is required")
    private String question;
}
