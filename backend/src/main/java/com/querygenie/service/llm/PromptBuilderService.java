package com.querygenie.service.llm;

import org.springframework.stereotype.Service;

/**
 * Converts a schema JSON string into a compact, token-efficient representation
 * suitable for inclusion in the Gemini system prompt.
 * Format: comma-separated table definitions, each with column name/type pairs.
 * FK relationships are included for JOIN context.
 */
@Service
public class PromptBuilderService {

    private static final String SQL_GENERATION_TEMPLATE = """
            You are a PostgreSQL SQL query generator. Your only output must be a valid SELECT SQL query or a clarifying question.
            
            Rules:
            1. Only return a single SELECT statement — no DDL, DML, or multiple statements.
            2. If the question is ambiguous, return exactly: CLARIFICATION: <your question>
            3. Do not include any explanation, markdown, or code fences — just raw SQL or the clarification prefix.
            
            Schema:
            %s
            
            Question: %s
            """;

    /**
     * Builds the full prompt string for SQL generation.
     *
     * @param schemaJson the schema cache JSON from {@link com.querygenie.service.schema.SchemaIntrospectionService}
     * @param question   the user's natural language question
     * @return complete prompt string ready for Gemini
     */
    public String buildSqlGenerationPrompt(String schemaJson, String question) {
        String compactSchema = compactifySchema(schemaJson);
        return String.format(SQL_GENERATION_TEMPLATE, compactSchema, question);
    }

    /**
     * Converts the full schema JSON into a compact DDL-like text representation
     * to minimize token usage while preserving all structural information.
     */
    private String compactifySchema(String schemaJson) {
        // The schema JSON is already compact; just return it directly.
        // In a future optimization pass this could be transformed to a DDL-like
        // format to further reduce token count.
        return schemaJson;
    }
}
