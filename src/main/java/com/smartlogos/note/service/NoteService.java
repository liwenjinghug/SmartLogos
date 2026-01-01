// service/NoteService.java
package com.smartlogos.note.service;

import com.smartlogos.note.dto.AnalyzeResponse;
import com.smartlogos.note.entity.Document;
import com.smartlogos.note.entity.Note;
import com.smartlogos.note.entity.Question;
import com.smartlogos.note.repository.NoteRepository;
import com.smartlogos.note.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NoteService {

    private final NoteRepository noteRepository;
    private final QuestionRepository questionRepository;

    public Optional<Note> getNoteByDocumentId(Long documentId) {
        return noteRepository.findByDocumentId(documentId);
    }

    public Optional<Note> getNoteById(Long noteId) {
        return noteRepository.findById(noteId);
    }

    /**
     * 从 AI 分析结果创建笔记和题目
     */
    @Transactional
    public Note createNoteFromAI(Document document, AnalyzeResponse aiResult) {
        Note note = new Note();
        note.setDocument(document);
        note.setSummary(aiResult.getSummary());
        note.setMindMapContent(aiResult.getMind_map());
        note.setTags(aiResult.getTags() != null ? String.join(",", aiResult.getTags()) : "");

        Note savedNote = noteRepository.save(note);
        log.info("保存笔记成功，ID: {}", savedNote.getId());

        // 保存题目
        if (aiResult.getQuizzes() != null) {
            for (AnalyzeResponse.QuizDTO quiz : aiResult.getQuizzes()) {
                Question question = new Question();
                question.setNote(savedNote);
                question.setQuestionText(quiz.getQuestion());
                question.setAnswer(quiz.getAnswer());
                question.setExplanation(quiz.getAnalysis());
                question.setQuestionType(Question.QuestionType.MULTIPLE_CHOICE);
                
                // 保存选项（逗号分隔）
                if (quiz.getOptions() != null && !quiz.getOptions().isEmpty()) {
                    question.setOptions(String.join(",", quiz.getOptions()));
                }
                
                questionRepository.save(question);
            }
            log.info("保存题目成功，数量: {}", aiResult.getQuizzes().size());
        }

        return savedNote;
    }
}