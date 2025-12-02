
// src/main/java/com/smartlogos/note/service/AIService.java
package com.smartlogos.note.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogos.note.dto.AIProcessResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * 封装调用 AI 核心模块的逻辑
 */
@Service
@Slf4j
public class AIService {

    @Value("${ai.api.url}")
    private String aiApiUrl;

    @Value("${ai.api.chat-url}")
    private String aiChatUrl;

    @Value("${ai.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;

    public AIService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * 调用 AI 接口，对纯文本做摘要 + 思维导图 + 出题 + 打标签
     *
     * @param content    提取后的全文纯文本
     * @param targetLang "zh" / "en"
     */
    public AIProcessResponse processDocument(String content, String targetLang) {
        try {
            // 请求体
            Map<String, Object> payload = new HashMap<>();
            payload.put("content", content);
            payload.put("target_lang", targetLang);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (apiKey != null && !apiKey.isBlank()) {
                headers.set("Authorization", "Bearer " + apiKey);
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            log.info("调用 AI 接口: {} 目标语言: {}", aiApiUrl, targetLang);
            ResponseEntity<String> responseEntity =
                    restTemplate.postForEntity(aiApiUrl, entity, String.class);

            if (!responseEntity.getStatusCode().is2xxSuccessful() || responseEntity.getBody() == null) {
                log.error("AI 接口返回非 2xx：status={}, body={}",
                        responseEntity.getStatusCode(), responseEntity.getBody());
                throw new RuntimeException("AI 接口调用失败，HTTP 状态码：" + responseEntity.getStatusCode());
            }

            String body = responseEntity.getBody();
            log.debug("AI 接口返回原始 JSON: {}", body);

            // 反序列化为 AIProcessResponse
            return objectMapper.readValue(body, AIProcessResponse.class);
        } catch (Exception e) {
            log.error("调用 AI 接口异常", e);
            throw new RuntimeException("调用 AI 接口异常: " + e.getMessage(), e);
        }
    }
    /**
     * 智能问答接口（用于 /api/chat）
     */
    public String chat(String context, String question, String lang) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("context", context);
            payload.put("question", question);
            payload.put("target_lang", lang);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (apiKey != null && !apiKey.isBlank()) {
                headers.set("Authorization", "Bearer " + apiKey);
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            log.info("调用 AI 聊天接口: {}", aiChatUrl);
            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiChatUrl,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return objectMapper.readTree(response.getBody()).get("answer").asText();
            } else {
                log.error("AI 聊天接口返回非 2xx：status={}", response.getStatusCode());
                return "抱歉，我暂时无法回答，请稍后再试。";
            }
        } catch (Exception e) {
            log.error("调用 AI /chat 异常", e);
            return "抱歉，我暂时无法回答，请稍后再试。";
        }
    }

}
