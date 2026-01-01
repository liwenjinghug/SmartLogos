package com.smartlogos.note.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 题目 DTO - 前端题库查询使用
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizDTO {
    
    private Long id;
    private Long document_id;
    private String question;
    private List<String> options;
    private String answer;
    private String analysis;
}
