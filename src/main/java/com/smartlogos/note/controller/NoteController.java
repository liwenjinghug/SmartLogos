
package com.smartlogos.note.controller;

import com.smartlogos.note.entity.Note;
import com.smartlogos.note.entity.Question;
import com.smartlogos.note.service.NoteService;
import com.smartlogos.note.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {
    private final NoteService noteService;
    private final QuestionService questionService;

    @GetMapping("/{id}")
    public ResponseEntity<Note> getNote(@PathVariable Long id) {
        Note note = noteService.getNote(id);
        if (note == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(note);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Note>> getUserNotes(@PathVariable Long userId) {
        List<Note> notes = noteService.getNotesByUserId(userId);
        return ResponseEntity.ok(notes);
    }

    @GetMapping("/user/{userId}/search")
    public ResponseEntity<List<Note>> searchNotes(
            @PathVariable Long userId,
            @RequestParam String keyword) {
        List<Note> notes = noteService.searchNotes(userId, keyword);
        return ResponseEntity.ok(notes);
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<List<Question>> listQuestions(@PathVariable Long id) {
        return ResponseEntity.ok(questionService.getByNoteId(id));
    }
}
