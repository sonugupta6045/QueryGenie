package com.querygenie.service.llm;

import com.querygenie.exception.LlmApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Thin wrapper around the Google Gemini API (generateContent endpoint).
 * Uses WebClient (non-blocking) with a 30s timeout.
 * Circuit breaker is applied at the {@link SqlGenerationService} level via Resilience4j.
 */
@Component
@Slf4j
public class GeminiClient {

    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
    private static final Duration TIMEOUT = Duration.ofSeconds(15);

    private final WebClient webClient;
    private final String apiKey;

    public GeminiClient(WebClient.Builder webClientBuilder,
                        @Value("${gemini.api-key}") String apiKey) {
        this.webClient = webClientBuilder
                .baseUrl(GEMINI_BASE_URL)
                .build();
        this.apiKey = apiKey;
    }

    /**
     * Sends a single-turn text prompt to Gemini and returns the raw text response.
     *
     * @param model  e.g. "gemini-3.5-flash"
     * @param prompt the full prompt string
     * @return raw text content from the first candidate
     */
    public String generateContent(String model, String prompt) {
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt))
                ))
        );

        try {
            Map<?, ?> response = webClient.post()
                    .uri("/models/{model}:generateContent?key={key}", model, apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .flatMap(body -> Mono.error(new LlmApiException("Gemini API error: " + body))))
                    .bodyToMono(Map.class)
                    .retryWhen(Retry.backoff(3, Duration.ofSeconds(2))
                            .filter(throwable -> throwable instanceof LlmApiException && 
                                    throwable.getMessage().contains("503")))
                    .timeout(TIMEOUT)
                    .block();

            return extractText(response);
        } catch (LlmApiException e) {
            throw e;
        } catch (Exception e) {
            throw new LlmApiException("Failed to call Gemini API: " + e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<?, ?> response) {
        try {
            List<Map<?, ?>> candidates = (List<Map<?, ?>>) response.get("candidates");
            Map<?, ?> content = (Map<?, ?>) candidates.get(0).get("content");
            List<Map<?, ?>> parts = (List<Map<?, ?>>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            throw new LlmApiException("Failed to parse Gemini response: " + e.getMessage(), e);
        }
    }
}
