package com.querygenie.service.validation;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Layer 1 of defense-in-depth (Phase 2 §4.3 / AGENTS.md rule 2).
 * Performs static keyword checks on the generated SQL before execution.
 * Layer 2 is enforced at the DB level by using a SELECT-only role.
 *
 * <p>Rules:
 * <ol>
 *   <li>Query must start with SELECT (trimmed, case-insensitive)</li>
 *   <li>No blacklisted DML/DDL keywords</li>
 *   <li>No statement chaining via semicolons followed by more tokens</li>
 *   <li>No comment-based injection patterns (-- or /* *\/)</li>
 * </ol>
 */
@Component
public class SqlSafetyValidator {

    private static final List<String> BLACKLISTED_KEYWORDS = List.of(
            "DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "TRUNCATE",
            "GRANT", "REVOKE", "CREATE", "EXEC", "EXECUTE", "CALL",
            "MERGE", "REPLACE", "LOAD", "IMPORT"
    );

    // Matches semicolon followed by any non-whitespace (statement chaining)
    private static final Pattern CHAINED_STATEMENT_PATTERN =
            Pattern.compile(";\\s*\\S", Pattern.CASE_INSENSITIVE);

    // Matches SQL comment patterns
    private static final Pattern INLINE_COMMENT_PATTERN =
            Pattern.compile("--", Pattern.CASE_INSENSITIVE);
    private static final Pattern BLOCK_COMMENT_PATTERN =
            Pattern.compile("/\\*", Pattern.CASE_INSENSITIVE);

    /**
     * Validates the SQL string against all safety rules.
     *
     * @param sql the generated SQL to validate
     * @return {@link ValidationResult#pass()} if safe, otherwise {@link ValidationResult#fail(String)}
     */
    public ValidationResult validate(String sql) {
        if (sql == null || sql.isBlank()) {
            return ValidationResult.fail("SQL query is empty");
        }

        String trimmed = sql.trim();

        // Rule 1: Must start with SELECT
        if (!trimmed.toUpperCase().startsWith("SELECT")) {
            return ValidationResult.fail("Query must start with SELECT; got: " + firstWord(trimmed));
        }

        // Rule 2: Blacklisted keywords
        String upperSql = trimmed.toUpperCase();
        for (String keyword : BLACKLISTED_KEYWORDS) {
            // Use word boundary to avoid false positives (e.g., "SELECTED" contains "SELECT")
            if (Pattern.compile("\\b" + keyword + "\\b").matcher(upperSql).find()) {
                return ValidationResult.fail("Query contains blacklisted keyword: " + keyword);
            }
        }

        // Rule 3: Statement chaining
        if (CHAINED_STATEMENT_PATTERN.matcher(trimmed).find()) {
            return ValidationResult.fail("Query contains statement chaining via semicolons");
        }

        // Rule 4: Comment-based injection
        if (INLINE_COMMENT_PATTERN.matcher(trimmed).find()) {
            return ValidationResult.fail("Query contains inline comment (--) which is not permitted");
        }
        if (BLOCK_COMMENT_PATTERN.matcher(trimmed).find()) {
            return ValidationResult.fail("Query contains block comment (/* */) which is not permitted");
        }

        return ValidationResult.pass();
    }

    private String firstWord(String sql) {
        int spaceIdx = sql.indexOf(' ');
        return spaceIdx == -1 ? sql : sql.substring(0, spaceIdx);
    }
}
