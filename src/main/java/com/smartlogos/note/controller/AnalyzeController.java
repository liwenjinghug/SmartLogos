

// src/main/java/com/smartlogos/note/controller/AnalyzeController.java
package com.smartlogos.note.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogos.note.dto.AIProcessResponse;
import com.smartlogos.note.dto.AnalyzeResponse;
import com.smartlogos.note.entity.Document;
import com.smartlogos.note.entity.Note;
import com.smartlogos.note.entity.Question;
import com.smartlogos.note.entity.User;
import com.smartlogos.note.repository.DocumentRepository;
import com.smartlogos.note.repository.NoteRepository;
import com.smartlogos.note.repository.QuestionRepository;
import com.smartlogos.note.repository.UserRepository;
import com.smartlogos.note.service.AIService;
import com.smartlogos.note.service.FileStorageService;
import com.smartlogos.note.service.TextExtractionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class AnalyzeController {

    private final FileStorageService fileStorageService;
    private final TextExtractionService textExtractionService;
    private final AIService aiService;

    private final DocumentRepository documentRepository;
    private final NoteRepository noteRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;

    private final ObjectMapper objectMapper;

    /**
     * 核心接口：上传文件 + 选择语言 -> 返回摘要 / 思维导图 / 题目 / 标签
     *
     * 参数：
     *  - file: 二进制文件流
     *  - target_lang: "zh" / "en"，默认 "zh"
     *  - userId: 可选，当前登录用户 ID（如果你已经有登录体系）
     */
    @PostMapping("/analyze")
    public ResponseEntity<AnalyzeResponse> analyze(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "target_lang", required = false, defaultValue = "zh") String targetLang,
            @RequestParam(value = "userId", required = false) Long userId
    ) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            log.info("收到文件分析请求: name={}, size={}, targetLang={}",
                    file.getOriginalFilename(), file.getSize(), targetLang);

            // 1. 保存文件到本地
            String storedFileName = fileStorageService.storeFile(file);
            Path storedPath = fileStorageService.loadFile(storedFileName);

            // 2. 创建 Document 记录（先标记为 PROCESSING）
            Document document = new Document();
            document.setFileName(file.getOriginalFilename());
            document.setFilePath(storedPath.toString());
            document.setContentType(file.getContentType());
            document.setFileSize(file.getSize());
            document.setStatus(Document.DocumentStatus.PROCESSING);

            if (userId != null) {
                userRepository.findById(userId).ifPresent(document::setUser);
            }

            document = documentRepository.save(document);

            // 3. 抽取纯文本
            String content = textExtractionService.extractText(document);
            log.info("文本提取完成，长度: {}", content != null ? content.length() : 0);

            // 4. 调用 AI 核心模块
            AIProcessResponse aiResp = aiService.processDocument(content, targetLang);

            // 5. 保存 Note
            Note note = new Note();
            note.setSummary(aiResp.getSummary());
            note.setMindMapContent(aiResp.getMindMapMd());
            if (aiResp.getTags() != null) {
                // 存成 JSON 字符串，方便前端直接解析
                note.setTags(objectMapper.writeValueAsString(aiResp.getTags()));
            }
            note.setLang(targetLang);
            note.setDocument(document);

            note = noteRepository.save(note);

            // 6. 保存题目列表
            List<AIProcessResponse.QuizDTO> quizzes = aiResp.getQuizzes();
            if (quizzes != null && !quizzes.isEmpty()) {
                for (AIProcessResponse.QuizDTO quiz : quizzes) {
                    Question q = new Question();
                    q.setNote(note);
                    q.setQuestionText(quiz.getQuestion());
                    q.setAnswer(quiz.getAnswer());
                    q.setExplanation(quiz.getExplanation());

                    if (quiz.getOptions() != null && !quiz.getOptions().isEmpty()) {
                        q.setQuestionType(Question.QuestionType.MULTIPLE_CHOICE);
                        q.setOptions(objectMapper.writeValueAsString(quiz.getOptions()));
                    } else {
                        q.setQuestionType(Question.QuestionType.SHORT_ANSWER);
                        q.setOptions(null);
                    }

                    questionRepository.save(q);
                }
            }

            // 7. 更新 Document 状态 & 关联 Note
            document.setStatus(Document.DocumentStatus.COMPLETED);
            document.setNote(note);
            documentRepository.save(document);

            // 8. 组装返回给前端
            AnalyzeResponse resp = new AnalyzeResponse();
            resp.setDocumentId(document.getId());
            resp.setNoteId(note.getId());
            resp.setSummary(aiResp.getSummary());
            resp.setMindMapMd(aiResp.getMindMapMd());
            resp.setTags(aiResp.getTags());
            resp.setQuizzes(aiResp.getQuizzes());

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            log.error("处理 /api/analyze 请求失败", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
