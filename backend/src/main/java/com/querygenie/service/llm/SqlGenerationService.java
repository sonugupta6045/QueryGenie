package com.querygenie.service.llm;

import com.querygenie.exception.LlmApiException;
import com.querygenie.service.schema.SchemaIntrospectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Orchestrates the NL→SQL generation pipeline:
 * 1. Pull cached schema from Redis/DB.
 * 2. Build the Gemini prompt via PromptBuilderService.
 * 3. Call GeminiClient.
 * 4. Detect clarification responses.
 *
 * Returns a {@link SqlGenerationResult} indicating whether the result is a SQL query
 * or a request for clarification.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SqlGenerationService {

    private static final String GEMINI_MODEL = "gemini-flash-latest";
    private static final String FALLBACK_MODEL = "gemini-3.1-flash-lite";
    private static final String CLARIFICATION_PREFIX = "CLARIFICATION:";

    private final GeminiClient geminiClient;
    private final PromptBuilderService promptBuilderService;
    private final SchemaIntrospectionService schemaIntrospectionService;

    /**
     * Generates SQL from a natural language question for a given data source.
     *
     * @param dataSourceId the tenant data source
     * @param question     the user's natural language question
     * @return {@link SqlGenerationResult} containing either a SQL string or a clarification message
     */
    public SqlGenerationResult generate(Long dataSourceId, String question) {
        String schemaJson = schemaIntrospectionService.getCachedSchema(dataSourceId);

        if (schemaJson == null || schemaJson.isBlank()) {
            throw new LlmApiException("No schema cache available for dataSource " + dataSourceId +
                    ". Please trigger a schema refresh first.");
        }

        String prompt = promptBuilderService.buildSqlGenerationPrompt(schemaJson, question);
        log.debug("Calling Gemini for dataSourceId={}, question length={}", dataSourceId, question.length());

        String rawResponse;
        try {
            rawResponse = geminiClient.generateContent(GEMINI_MODEL, prompt);
        } catch (LlmApiException e) {
            log.warn("Primary model {} failed: {}. Falling back to {}", GEMINI_MODEL, e.getMessage(), FALLBACK_MODEL);
            rawResponse = geminiClient.generateContent(FALLBACK_MODEL, prompt);
        }
        String trimmed = rawResponse == null ? "" : rawResponse.trim();

        // Strip markdown code fences if the LLM ignores the instruction not to use them
        if (trimmed.toLowerCase().startsWith("```sql")) {
            trimmed = trimmed.substring(6);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        trimmed = trimmed.trim();

        if (trimmed.toUpperCase().startsWith(CLARIFICATION_PREFIX)) {
            String message = trimmed.substring(CLARIFICATION_PREFIX.length()).trim();
            log.info("Gemini requested clarification: {}", message);
            return SqlGenerationResult.clarification(message);
        }

        log.info("Gemini generated SQL for dataSourceId={}", dataSourceId);
        return SqlGenerationResult.sql(trimmed);
    }

    // ── Inner result type ────────────────────────────────────────────────────

    public record SqlGenerationResult(boolean isClarification, String sql, String clarificationMessage) {

        public static SqlGenerationResult sql(String sql) {
            return new SqlGenerationResult(false, sql, null);
        }

        public static SqlGenerationResult clarification(String message) {
            return new SqlGenerationResult(true, null, message);
        }
    }
}
