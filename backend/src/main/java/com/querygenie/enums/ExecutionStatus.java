package com.querygenie.enums;

public enum ExecutionStatus {
    SUCCESS,
    REJECTED,              // failed safety validation
    FAILED,                // execution error (SQL runtime error, timeout)
    CLARIFICATION_NEEDED   // LLM asked for more info rather than generating SQL
}
