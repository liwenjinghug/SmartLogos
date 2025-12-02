package com.smartlogos.note.repository;

import com.smartlogos.note.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NoteRepository extends JpaRepository<Note, Long> {
    Optional<Note> findByDocumentId(Long documentId);
    List<Note> findByDocumentUserId(Long userId);

    @Query("SELECT n FROM Note n WHERE n.document.user.id = :userId AND " +
           "(n.summary LIKE %:keyword% OR n.tags LIKE %:keyword%)")
    List<Note> searchByUserIdAndKeyword(@Param("userId") Long userId, @Param("keyword") String keyword);
}