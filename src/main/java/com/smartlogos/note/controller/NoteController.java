// controller/NoteController.java
package com.smartlogos.note.controller;

import com.smartlogos.note.entity.Note;
import com.smartlogos.note.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @GetMapping("/document/{documentId}")
    public ResponseEntity<Note> getNoteByDocument(@PathVariable Long documentId) {
        Optional<Note> note = noteService.getNoteByDocumentId(documentId);
        return note.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{noteId}/mindmap")
    public ResponseEntity<String> getMindMap(@PathVariable Long noteId) {
        Optional<Note> note = noteService.getNoteById(noteId);
        if (note.isPresent() && note.get().getMindMapJson() != null) {
            return ResponseEntity.ok(note.get().getMindMapJson());
        }
        return ResponseEntity.notFound().build();
    }
}