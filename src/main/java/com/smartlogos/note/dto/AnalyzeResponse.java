package com.smartlogos.note.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * AI 分析完整响应 - 包含摘要、思维导图、题目等
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyzeResponse {
    
    private String filename;
    private String summary;
    private String mind_map;
    private List<QuizDTO> quizzes;
    private List<String> tags;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizDTO {
        private String question;
        private List<String> options;
        private String answer;
        private String analysis;
    }
}
