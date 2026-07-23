package com.querygenie.exception;

public class DataSourceConnectionException extends RuntimeException {
    public DataSourceConnectionException(String message) { super(message); }
    public DataSourceConnectionException(String message, Throwable cause) { super(message, cause); }
}
