package com.smartlogos.note.controller;

import com.smartlogos.note.dto.ApiResponse;
import com.smartlogos.note.dto.AnalyzeResponse;
import com.smartlogos.note.dto.DocumentDTO;
import com.smartlogos.note.entity.Document;
import com.smartlogos.note.entity.Note;
import com.smartlogos.note.service.DocumentService;
import com.smartlogos.note.service.NoteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class DocumentController {

    private final DocumentService documentService;
    private final NoteService noteService;

    /**
     * 前端接口 1: 获取用户文档列表
     * GET /api/documents?user_id=1
     */
    @GetMapping("/documents")
    public ResponseEntity<ApiResponse<List<DocumentDTO>>> getUserDocuments(
            @RequestParam(name = "user_id", defaultValue = "1") Long userId) {
        try {
            List<Document> documents = documentService.getUserDocuments(userId);
            
            List<DocumentDTO> dtoList = documents.stream().map(doc -> {
                DocumentDTO dto = new DocumentDTO();
                dto.setId(doc.getId());
                dto.setFilename(doc.getFileName());
                dto.setUpload_time(doc.getUploadTime().format(
                    DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
                dto.setStatus(doc.getStatus().name());
                
                // 如果有关联的笔记，获取摘要
                if (doc.getNote() != null) {
                    dto.setSummary(doc.getNote().getSummary());
                }
                
                return dto;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(dtoList));
        } catch (Exception e) {
            log.error("获取文档列表失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取文档列表失败: " + e.getMessage()));
        }
    }

    // 说明：/api/analyze 由现有 AI 服务实现；后端不再重复实现该接口。

    /**
     * 前端接口 3: 笔记详情查询
     * GET /api/documents/{id}
     */
    @GetMapping("/documents/{id}")
    public ResponseEntity<ApiResponse<AnalyzeResponse>> getDocumentDetail(@PathVariable Long id) {
        try {
            Document document = documentService.getDocumentById(id)
                    .orElseThrow(() -> new RuntimeException("文档不存在"));

            Note note = document.getNote();
            if (note == null) {
                return ResponseEntity.ok(ApiResponse.error("笔记数据不存在"));
            }

            // 构建返回格式
            AnalyzeResponse response = new AnalyzeResponse();
            response.setFilename(document.getFileName());
            response.setSummary(note.getSummary());
            response.setMind_map(note.getMindMapContent());
            response.setTags(note.getTags() != null ? List.of(note.getTags().split(",")) : List.of());

            // 获取题目列表
            List<AnalyzeResponse.QuizDTO> quizzes = note.getQuestions().stream()
                    .map(q -> new AnalyzeResponse.QuizDTO(
                        q.getQuestionText(),
                        q.getOptions() != null ? List.of(q.getOptions().split(",")) : List.of(),
                        q.getAnswer(),
                        q.getExplanation()
                    ))
                    .collect(Collectors.toList());
            response.setQuizzes(quizzes);

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            log.error("获取文档详情失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取详情失败: " + e.getMessage()));
        }
    }

    /**
     * 前端接口 4: 上传文件，返回 document_id，用于后续落库
     * POST /api/documents/upload?user_id=1
     */
    @PostMapping(value = "/documents/upload")
    public ResponseEntity<ApiResponse<DocumentDTO>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(name = "user_id", defaultValue = "1") Long userId) {
        try {
            Document document = documentService.uploadDocument(file, userId);

            DocumentDTO dto = new DocumentDTO();
            dto.setId(document.getId());
            dto.setFilename(document.getFileName());
            dto.setUpload_time(document.getUploadTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            dto.setStatus(document.getStatus().name());

            return ResponseEntity.ok(ApiResponse.success("文件上传成功", dto));
        } catch (Exception e) {
            log.error("文件上传失败", e);
            return ResponseEntity.ok(ApiResponse.error("文件上传失败: " + e.getMessage()));
        }
    }

    // 说明：/api/chat 由现有 AI 服务实现；后端不再重复实现该接口。
}