// service/AIService.java
package com.smartlogos.note.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogos.note.dto.AIProcessRequest;
import com.smartlogos.note.dto.AIProcessResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Service
@Slf4j
public class AIService {

    @Value("${ai.api.url:http://localhost:5000/api/process}")
    private String aiApiUrl;

    @Value("${ai.api.key:}")
    private String aiApiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AIService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public AIProcessResponse processContent(String content, String fileName) {
        try {
            AIProcessRequest request = new AIProcessRequest();
            request.setContent(content);
            request.setFileName(fileName);
            request.setContentType("text");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (aiApiKey != null && !aiApiKey.isEmpty()) {
                headers.set("Authorization", "Bearer " + aiApiKey);
            }

            HttpEntity<AIProcessRequest> httpEntity = new HttpEntity<>(request, headers);

            log.info("调用AI接口处理内容，长度: {}", content.length());
            ResponseEntity<AIProcessResponse> response = restTemplate.postForEntity(
                    aiApiUrl, httpEntity, AIProcessResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("AI处理成功，生成摘要长度: {}", response.getBody().getSummary().length());
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("调用AI接口失败", e);
            return createMockResponse(content);
        }

        return createMockResponse(content);
    }

    private AIProcessResponse createMockResponse(String content) {
        AIProcessResponse response = new AIProcessResponse();
        response.setSummary("这是AI生成的摘要：" + content.substring(0, Math.min(100, content.length())) + "...");
        response.setMindMapJson("{\"name\":\"根节点\",\"children\":[{\"name\":\"子节点1\"},{\"name\":\"子节点2\"}]}");
        response.setTags(Arrays.asList("#测试", "#AI生成"));

        AIProcessResponse.QuestionDTO question1 = new AIProcessResponse.QuestionDTO();
        question1.setQuestionText("这是一个测试选择题？");
        question1.setQuestionType("MULTIPLE_CHOICE");
        question1.setAnswer("A");
        question1.setOptions(Arrays.asList("选项A", "选项B", "选项C", "选项D"));

        AIProcessResponse.QuestionDTO question2 = new AIProcessResponse.QuestionDTO();
        question2.setQuestionText("这是一个测试简答题？");
        question2.setQuestionType("SHORT_ANSWER");
        question2.setAnswer("这是简答题的参考答案");

        response.setQuestions(Arrays.asList(question1, question2));

        return response;
    }
}