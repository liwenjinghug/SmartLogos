// dto/AIProcessResponse.java
package com.smartlogos.note.dto;

import lombok.Data;
import java.util.List;

@Data
public class AIProcessResponse {
    private String summary;
    private String mindMapJson;
    private List<String> tags;
    private List<QuestionDTO> questions;

    @Data
    public static class QuestionDTO {
        private String questionText;
        private String answer;
        private String questionType;
        private List<String> options;
    }
}