package com.smartlogos.note.controller;

import com.smartlogos.note.dto.ApiResponse;
import com.smartlogos.note.dto.QuizDTO;
import com.smartlogos.note.entity.Question;
import com.smartlogos.note.service.QuestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 题目查询接口
 */
@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
@Slf4j
public class QuizController {

    private final QuestionService questionService;

    /**
     * 前端接口 4: 题目列表查询
     * GET /api/quizzes?user_id=1
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<QuizDTO>>> getQuizzes(
            @RequestParam(name = "user_id", required = false) Long userId,
            @RequestParam(name = "note_id", required = false) Long noteId) {
        try {
            List<Question> questions;

            if (noteId != null) {
                // 按笔记查询
                questions = questionService.getQuestionsByNoteId(noteId);
            } else {
                // 查询所有题目（可根据需要添加用户过滤）
                questions = questionService.getAllQuestions();
            }

            List<QuizDTO> dtoList = questions.stream().map(q -> {
                QuizDTO dto = new QuizDTO();
                dto.setId(q.getId());
                dto.setDocument_id(q.getNote() != null && q.getNote().getDocument() != null 
                    ? q.getNote().getDocument().getId() : null);
                dto.setQuestion(q.getQuestionText());
                dto.setAnswer(q.getAnswer());
                dto.setAnalysis(q.getExplanation());
                
                // 解析选项（存储格式为逗号分隔）
                if (q.getOptions() != null && !q.getOptions().isEmpty()) {
                    dto.setOptions(Arrays.asList(q.getOptions().split(",")));
                } else {
                    dto.setOptions(List.of());
                }
                
                return dto;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dtoList));

        } catch (Exception e) {
            log.error("获取题目列表失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取题目失败: " + e.getMessage()));
        }
    }
}
