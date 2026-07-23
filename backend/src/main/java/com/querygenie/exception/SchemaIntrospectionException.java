package com.querygenie.exception;

public class SchemaIntrospectionException extends RuntimeException {
    public SchemaIntrospectionException(String message) { super(message); }
    public SchemaIntrospectionException(String message, Throwable cause) { super(message, cause); }
}
