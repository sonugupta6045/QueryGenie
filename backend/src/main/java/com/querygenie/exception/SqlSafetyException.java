package com.querygenie.exception;

public class SqlSafetyException extends RuntimeException {
    public SqlSafetyException(String message) {
        super(message);
    }
}
