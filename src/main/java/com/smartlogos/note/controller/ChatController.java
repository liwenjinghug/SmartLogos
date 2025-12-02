
package com.smartlogos.note.controller;

import com.smartlogos.note.dto.ChatRequest;
import com.smartlogos.note.dto.ChatResponse;
import com.smartlogos.note.entity.Note;
import com.smartlogos.note.repository.NoteRepository;
import com.smartlogos.note.service.AIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final NoteRepository noteRepository;
    private final AIService aiService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        if (request.getNoteId() == null) {
            return ResponseEntity.badRequest().build();
        }

        Note note = noteRepository.findById(request.getNoteId()).orElse(null);
        if (note == null) {
            return ResponseEntity.notFound().build();
        }

        // 拼接完整上下文
        StringBuilder context = new StringBuilder();
        context.append("【摘要】\n").append(note.getSummary()).append("\n\n")
                .append("【思维导图 Markdown】\n").append(note.getMindMapContent()).append("\n\n");

        String aiAnswer = aiService.chat(context.toString(), request.getQuestion(), request.getTargetLang());

        ChatResponse resp = new ChatResponse();
        resp.setAnswer(aiAnswer);
        return ResponseEntity.ok(resp);
    }
}
