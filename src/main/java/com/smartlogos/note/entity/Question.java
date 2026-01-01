// entity/Question.java
package com.smartlogos.note.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "questions")
@Data
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String answer;

    @Enumerated(EnumType.STRING)
    private QuestionType questionType;

    @Column(columnDefinition = "TEXT")
    private String options;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String explanation;  // 题目解析

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id")
    private Note note;

    public enum QuestionType {
        MULTIPLE_CHOICE, SHORT_ANSWER
    }
}