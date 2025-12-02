
// src/main/java/com/smartlogos/note/dto/AIProcessResponse.java
package com.smartlogos.note.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * 对应 AI 核心模块 /api/process 或 /api/analyze 的返回结构
 * 约定 AI 返回 JSON 示例：
 * {
 *   "summary": "……",
 *   "mind_map_md": "……",
 *   "tags": ["#AI", "#计算机网络"],
 *   "quizzes": [
 *     {
 *       "question": "……？",
 *       "options": ["A", "B", "C", "D"],
 *       "answer": "A",
 *       "explanation": "……"
 *     }
 *   ]
 * }
 */
@Data
public class AIProcessResponse {

    /** 摘要 */
    private String summary;

    /** 思维导图（Markdown 源码），AI 返回字段名是 mind_map_md */
    @JsonProperty("mind_map_md")
    private String mindMapMd;

    /** 标签列表 */
    private List<String> tags;

    /** 智能题目列表 */
    private List<QuizDTO> quizzes;

    @Data
    public static class QuizDTO {
        /** 题干 */
        private String question;
        /** 选项列表（选择题时有值） */
        private List<String> options;
        /** 正确答案（可以是选项字母或完整答案） */
        private String answer;
        /** 解析 */
        private String explanation;
    }
}
