package com.querygenie.service.llm;

import com.querygenie.exception.LlmApiException;
import com.querygenie.service.schema.SchemaIntrospectionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SqlGenerationServiceTest {

    @Mock
    private GeminiClient geminiClient;

    @Mock
    private PromptBuilderService promptBuilderService;

    @Mock
    private SchemaIntrospectionService schemaIntrospectionService;

    @InjectMocks
    private SqlGenerationService sqlGenerationService;

    @Test
    void generate_validSql_returnsSql() {
        Long dataSourceId = 1L;
        String question = "show me all users";
        String schemaJson = "{\"tables\": []}";
        String prompt = "system prompt...";
        String generatedSql = "SELECT * FROM users";

        when(schemaIntrospectionService.getCachedSchema(dataSourceId)).thenReturn(schemaJson);
        when(promptBuilderService.buildSqlGenerationPrompt(schemaJson, question)).thenReturn(prompt);
        when(geminiClient.generateContent(eq("gemini-1.5-flash"), eq(prompt))).thenReturn(generatedSql);

        SqlGenerationService.SqlGenerationResult result = sqlGenerationService.generate(dataSourceId, question);

        assertFalse(result.isClarification());
        assertEquals(generatedSql, result.sql());
        assertNull(result.clarificationMessage());
    }

    @Test
    void generate_clarification_returnsClarification() {
        Long dataSourceId = 1L;
        String question = "show me the best data";
        String schemaJson = "{\"tables\": []}";
        String prompt = "system prompt...";
        String clarificationRaw = "CLARIFICATION: What do you mean by best?";

        when(schemaIntrospectionService.getCachedSchema(dataSourceId)).thenReturn(schemaJson);
        when(promptBuilderService.buildSqlGenerationPrompt(schemaJson, question)).thenReturn(prompt);
        when(geminiClient.generateContent(eq("gemini-1.5-flash"), eq(prompt))).thenReturn(clarificationRaw);

        SqlGenerationService.SqlGenerationResult result = sqlGenerationService.generate(dataSourceId, question);

        assertTrue(result.isClarification());
        assertEquals("What do you mean by best?", result.clarificationMessage());
        assertNull(result.sql());
    }

    @Test
    void generate_noSchema_throwsException() {
        Long dataSourceId = 1L;
        String question = "show me all users";

        when(schemaIntrospectionService.getCachedSchema(dataSourceId)).thenReturn(null);

        LlmApiException exception = assertThrows(LlmApiException.class, () ->
                sqlGenerationService.generate(dataSourceId, question)
        );

        assertTrue(exception.getMessage().contains("No schema cache available"));
    }
}
