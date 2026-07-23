package com.querygenie.service.explanation;

import com.querygenie.service.llm.GeminiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Generates a plain-English summary of query results via a lightweight Gemini call.
 * Kept separate from SqlGenerationService so it can fail independently —
 * a failure here degrades gracefully to "Explanation unavailable" rather than
 * blocking the full result.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExplanationService {

    private static final String GEMINI_MODEL = "gemini-1.5-flash";
    private static final int MAX_SAMPLE_ROWS = 3;

    private final GeminiClient geminiClient;

    /**
     * Generates a 1-2 sentence plain-English explanation of the query result.
     *
     * @param question the original user question
     * @param rowCount total number of rows returned
     * @param sampleRows first few rows for context
     * @return explanation string, or "Explanation unavailable." on failure
     */
    public String explain(String question, int rowCount, List<List<Object>> sampleRows) {
        try {
            List<List<Object>> sample = sampleRows.stream().limit(MAX_SAMPLE_ROWS).toList();
            String prompt = """
                    Summarize the following query result in 1-2 plain English sentences.
                    
                    Original question: %s
                    Total rows returned: %d
                    Sample rows: %s
                    
                    Be concise. Do not include SQL or technical terms.
                    """.formatted(question, rowCount, sample);

            return geminiClient.generateContent(GEMINI_MODEL, prompt).trim();
        } catch (Exception e) {
            log.warn("Explanation generation failed (non-fatal): {}", e.getMessage());
            return "Explanation unavailable.";
        }
    }
}
