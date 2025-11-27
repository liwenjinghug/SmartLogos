// service/TextExtractionService.java
package com.smartlogos.note.service;

import com.smartlogos.note.entity.Document;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.nio.file.Files;

@Service
@Slf4j
public class TextExtractionService {

    private final FileStorageService fileStorageService;

    public TextExtractionService(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    public String extractText(Document document) throws Exception {
        File file = fileStorageService.loadFile(document.getFilePath()).toFile();
        String contentType = document.getContentType();

        if (contentType == null) {
            String fileName = document.getFileName().toLowerCase();
            if (fileName.endsWith(".pdf")) {
                return extractTextFromPdf(file);
            } else if (fileName.endsWith(".docx")) {
                return extractTextFromDocx(file);
            } else if (fileName.endsWith(".txt")) {
                return extractTextFromTxt(file);
            } else {
                return extractTextFromTxt(file);
            }
        }

        switch (contentType) {
            case "application/pdf":
                return extractTextFromPdf(file);
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                return extractTextFromDocx(file);
            case "text/plain":
                return extractTextFromTxt(file);
            default:
                return extractTextFromTxt(file);
        }
    }

    private String extractTextFromPdf(File file) throws Exception {
        try (PDDocument document = PDDocument.load(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String extractTextFromDocx(File file) throws Exception {
        try (FileInputStream fis = new FileInputStream(file);
             XWPFDocument document = new XWPFDocument(fis);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        }
    }

    private String extractTextFromTxt(File file) throws Exception {
        return new String(Files.readAllBytes(file.toPath()));
    }
}