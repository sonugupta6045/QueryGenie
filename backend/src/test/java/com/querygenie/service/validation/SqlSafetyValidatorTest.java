package com.querygenie.service.validation;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

class SqlSafetyValidatorTest {

    private SqlSafetyValidator validator;

    @BeforeEach
    void setUp() {
        validator = new SqlSafetyValidator();
    }

    @Test
    void validate_validSelect_passes() {
        String sql = "SELECT * FROM users WHERE active = true";
        ValidationResult result = validator.validate(sql);
        assertTrue(result.isValid());
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "select id, name from customers",
            "SELECT count(*) FROM orders",
            "  SELECT * FROM test  "
    })
    void validate_validVariations_passes(String sql) {
        ValidationResult result = validator.validate(sql);
        assertTrue(result.isValid(), "Should pass: " + sql);
    }

    @Test
    void validate_doesNotStartWithSelect_fails() {
        String sql = "WITH cte AS (SELECT * FROM users) SELECT * FROM cte";
        ValidationResult result = validator.validate(sql);
        assertFalse(result.isValid());
        assertTrue(result.getReason().contains("must start with SELECT"));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "DROP TABLE users",
            "SELECT * FROM users; DELETE FROM users",
            "UPDATE users SET active = false",
            "INSERT INTO logs (msg) VALUES ('test')"
    })
    void validate_blacklistedKeywords_fails(String sql) {
        ValidationResult result = validator.validate(sql);
        assertFalse(result.isValid());
        assertTrue(result.getReason().contains("Query must start with SELECT") || 
                   result.getReason().contains("Query contains blacklisted keyword") ||
                   result.getReason().contains("Query contains statement chaining"));
    }

    @Test
    void validate_chainedStatement_fails() {
        String sql = "SELECT * FROM users; SELECT * FROM orders";
        ValidationResult result = validator.validate(sql);
        assertFalse(result.isValid());
        assertTrue(result.getReason().contains("statement chaining"));
    }

    @Test
    void validate_inlineComment_fails() {
        String sql = "SELECT * FROM users -- bypass";
        ValidationResult result = validator.validate(sql);
        assertFalse(result.isValid());
        assertTrue(result.getReason().contains("inline comment"));
    }

    @Test
    void validate_blockComment_fails() {
        String sql = "SELECT /* injected */ * FROM users";
        ValidationResult result = validator.validate(sql);
        assertFalse(result.isValid());
        assertTrue(result.getReason().contains("block comment"));
    }
}
