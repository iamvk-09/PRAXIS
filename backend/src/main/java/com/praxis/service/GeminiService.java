package com.praxis.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import java.time.Duration;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GeminiService() {
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory();
        requestFactory.setReadTimeout(Duration.ofSeconds(20));
        this.restTemplate = new RestTemplate(requestFactory);
    }

    // ─── Default fallback ────────────────────────────────────
    private Map<String, Object> defaultExtraction() {
        Map<String, Object> d = new HashMap<>();
        d.put("activities", Collections.emptyList());
        d.put("mood", "neutral");
        d.put("energy", "medium");
        d.put("distractions", Collections.emptyList());
        return d;
    }

    // ─── Core HTTP call (JSON mode) ────────────────────────────
    private String callGeminiJson(String prompt, double temperature) {
        return callGeminiInternal(prompt, temperature, "application/json");
    }

    // ─── Core HTTP call (plain text mode — no responseMimeType set) ───
    private String callGemini(String prompt, double temperature) {
        return callGeminiInternal(prompt, temperature, null); // null = omit field, use API default
    }

    private String callGeminiInternal(String prompt, double temperature, String mimeType) {
        try {
            String url = GEMINI_URL + apiKey;

            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", temperature);
            if (mimeType != null && !mimeType.isBlank()) {
                generationConfig.put("responseMimeType", mimeType);
            }

            Map<String, Object> body = new HashMap<>();
            body.put("contents", List.of(Map.of(
                    "parts", List.of(Map.of("text", prompt))
            )));
            body.put("generationConfig", generationConfig);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("candidates").get(0)
                       .path("content").path("parts").get(0)
                       .path("text").asText();
        } catch (Exception e) {
            log.error("Gemini API call failed (mimeType={}): {}", mimeType, e.getMessage());
            return null;
        }
    }

    // ─── extractLog ───────────────────────────────────────────
    public Map<String, Object> extractLog(String userText) {
        String systemPrompt = """
                You are a behavior extraction assistant. Extract structured data from the user's \
                daily log entry. Return ONLY valid JSON with no markdown, no backticks, no explanation. \
                Use exactly this format:
                {
                  "activities": [
                    {"name": "string", "duration_minutes": 0, "type": "productive|leisure|skipped"}
                  ],
                  "mood": "positive|neutral|negative",
                  "energy": "high|medium|low",
                  "distractions": ["string"]
                }
                If something is mentioned as skipped or not done, include it with type "skipped" and duration_minutes 0.""";

        String prompt = systemPrompt + "\n\nUser log:\n" + userText;
        String raw = callGeminiJson(prompt, 0.1);

        if (raw == null) return defaultExtraction();

        // Strip markdown fences if present
        raw = raw.trim();
        if (raw.startsWith("```")) {
            raw = raw.replaceAll("```json", "").replaceAll("```", "").trim();
        }

        try {
            Map<String, Object> result = objectMapper.readValue(raw, Map.class);
            result.putIfAbsent("activities", Collections.emptyList());
            result.putIfAbsent("mood", "neutral");
            result.putIfAbsent("energy", "medium");
            result.putIfAbsent("distractions", Collections.emptyList());
            return result;
        } catch (Exception e) {
            log.error("JSON parse error in extractLog: {} | raw: {}", e.getMessage(), raw);
            return defaultExtraction();
        }
    }

    // ─── analyzeWeek ────────────────────────────────────────
    // Returns null on failure so callers can throw a proper exception.
    public String analyzeWeek(String logsText) {
        String systemPrompt = """
                You are a behavioral pattern analyst. Given 7 days of activity logs from a user, \
                identify exactly 2-3 specific, actionable insights about their behavioral patterns. \
                Be data-driven and precise. Do NOT give generic advice. Instead of "exercise more", \
                say "You studied for 90+ minutes on 3 of 4 days that started with gym — your best \
                study days correlate with morning exercise."
                Format your response as plain text with each insight on its own line starting with "•".
                Do not use JSON. Do not add headers. Just the 2-3 bullet insights.""";

        String prompt = systemPrompt + "\n\nActivity logs:\n" + logsText;
        String result = callGemini(prompt, 0.7);
        return result != null ? result.trim() : null; // null signals failure to caller
    }

    // ─── chatWithCoach ──────────────────────────────────────────
    public String chatWithCoach(String userQuery, String contextText) {
        String systemPrompt = """
                You are the 'Praxis Oracle', a highly insightful, slightly witty, and highly motivating \
                behavioral coach. You have access to the user's recent daily logs and momentum scores. \
                Answer their question directly based on their data. If they are doing well, praise them. \
                If they are slacking or making excuses, gently roast them and give them a highly specific \
                action plan. Keep your response conversational, concise (under 100 words), and formatted \
                with standard markdown for readability (bolding key points).""";

        String prompt = systemPrompt + "\n\nUser Context:\n" + contextText + "\n\nUser Query:\n" + userQuery;
        String result = callGemini(prompt, 0.8);
        return result != null ? result.trim()
                : "I seem to have lost my connection to the ether. Try asking me again later.";
    }
}
