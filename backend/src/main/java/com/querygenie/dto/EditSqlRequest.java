package com.querygenie.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EditSqlRequest {

    @NotBlank(message = "editedSql must not be blank")
    private String editedSql;
}
