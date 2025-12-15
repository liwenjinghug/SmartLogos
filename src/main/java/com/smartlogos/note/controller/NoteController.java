// controller/NoteController.java
package com.smartlogos.note.controller;

import com.smartlogos.note.dto.ApiResponse;
import com.smartlogos.note.dto.AnalyzeResponse;
import com.smartlogos.note.entity.Document;
import com.smartlogos.note.entity.Note;
import com.smartlogos.note.entity.Question;
import com.smartlogos.note.service.DocumentService;
import com.smartlogos.note.service.NoteService;
import com.smartlogos.note.service.QuestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
@Slf4j
public class NoteController {

    private final NoteService noteService;
    private final DocumentService documentService;
    private final QuestionService questionService;

    @GetMapping("/document/{documentId}")
    public ResponseEntity<Note> getNoteByDocument(@PathVariable Long documentId) {
        Optional<Note> note = noteService.getNoteByDocumentId(documentId);
        return note.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{noteId}/mindmap")
    public ResponseEntity<String> getMindMap(@PathVariable Long noteId) {
        Optional<Note> note = noteService.getNoteById(noteId);
        if (note.isPresent()) {
            String content = note.get().getMindMapContent() != null ? note.get().getMindMapContent() : note.get().getMindMapJson();
            if (content != null) {
                return ResponseEntity.ok(content);
            }
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * 新增：保存笔记（前端从 AI 服务拿到结果后调用）
     * POST /api/notes
     * body: AnalyzeResponse
     * query: document_id
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Long>> saveNote(@RequestParam("document_id") Long documentId,
                                                      @RequestBody AnalyzeResponse aiResult) {
        try {
            Document document = documentService.getDocumentById(documentId)
                    .orElseThrow(() -> new RuntimeException("文档不存在"));

            Note note = noteService.createNoteFromAI(document, aiResult);
            return ResponseEntity.ok(ApiResponse.success("保存成功", note.getId()));
        } catch (Exception e) {
            log.error("保存笔记失败", e);
            return ResponseEntity.ok(ApiResponse.error("保存笔记失败: " + e.getMessage()));
        }
    }

    /**
     * 新增：按笔记 ID 查询题目
     */
    @GetMapping("/{noteId}/questions")
    public ResponseEntity<ApiResponse<List<Question>>> getQuestionsByNote(@PathVariable Long noteId) {
        try {
            List<Question> questions = questionService.getQuestionsByNoteId(noteId);
            return ResponseEntity.ok(ApiResponse.success(questions));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("查询题目失败: " + e.getMessage()));
        }
    }
}