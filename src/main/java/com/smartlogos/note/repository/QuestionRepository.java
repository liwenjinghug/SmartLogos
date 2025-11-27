package com.smartlogos.note.repository;

import com.smartlogos.note.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByNoteId(Long noteId);
    List<Question> findByNoteDocumentId(Long documentId);
}