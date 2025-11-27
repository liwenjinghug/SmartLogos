package com.smartlogos.note.repository;

import com.smartlogos.note.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface NoteRepository extends JpaRepository<Note, Long> {
    Optional<Note> findByDocumentId(Long documentId);
}