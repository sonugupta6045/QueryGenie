package com.querygenie.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChartConfig {

    private String type;  // "bar", "line", "pie"
    private String xKey;  // column name for x-axis
    private String yKey;  // column name for y-axis
}
