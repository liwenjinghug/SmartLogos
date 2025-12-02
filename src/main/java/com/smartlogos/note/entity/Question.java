// src/main/java/com/smartlogos/note/entity/Question.java
package com.smartlogos.note.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "questions")
@Data
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 题干 */
    @Lob
    @Column(name = "question_text")
    private String questionText;

    /** 参考答案（选择题是正确选项，简答题是答案文本） */
    @Lob
    private String answer;

    /** 题目类型：选择题 / 简答题 */
    @Enumerated(EnumType.STRING)
    @Column(name = "question_type")
    private QuestionType questionType;

    /** 选项 JSON 字符串（选择题时使用，例如 ["A","B","C","D"]） */
    @Lob
    private String options;

    /** 解析 */
    @Lob
    private String explanation;

    /** 所属 Note */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id")
    @JsonIgnore
    private Note note;

    public enum QuestionType {
        MULTIPLE_CHOICE,
        SHORT_ANSWER
    }
}
