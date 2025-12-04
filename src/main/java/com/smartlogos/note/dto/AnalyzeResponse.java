
// src/main/java/com/smartlogos/note/dto/AnalyzeResponse.java
package com.smartlogos.note.dto;

import lombok.Data;

import java.util.List;

/**
 * 后端 /api/analyze 返回给前端的结构
 * 前端可以直接用它渲染：
 * - 摘要
 * - 思维导图 Markdown
 * - 标签
 * - 题目卡片（quizzes）
 */
@Data
public class AnalyzeResponse {

    /** 对应上传文件的 Document ID（前端如果需要后续查询用） */
    private Long documentId;

    /** 生成的 Note ID（后续 /api/chat 必须带这个） */
    private Long noteId;

    /** 摘要 */
    private String summary;

    /** Markdown 思维导图源码 */
    private String mindMapMd;

    /** 标签列表 */
    private List<String> tags;

    /** 直接给前端渲染卡片的题目列表 */
    private List<AIProcessResponse.QuizDTO> quizzes;
}
