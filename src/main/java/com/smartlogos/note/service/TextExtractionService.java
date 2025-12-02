
// src/main/java/com/smartlogos/note/service/TextExtractionService.java
package com.smartlogos.note.service;

import com.smartlogos.note.entity.Document;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFShape;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextShape;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.nio.file.Files;

/**
 * 负责从已保存的文件中抽取纯文本
 */
@Service
@Slf4j
public class TextExtractionService {

    /**
     * 根据 Document 中的 filePath 抽取文本
     */
    public String extractText(Document document) {
        String filePath = document.getFilePath();
        if (filePath == null || filePath.isBlank()) {
            throw new IllegalArgumentException("Document 未设置 filePath，无法读取文件");
        }
        File file = new File(filePath);
        return extractText(file);
    }

    /**
     * 根据文件类型分发到不同解析器
     */
    public String extractText(File file) {
        if (file == null || !file.exists()) {
            throw new IllegalArgumentException("文件不存在: " + (file == null ? "null" : file.getAbsolutePath()));
        }

        String name = file.getName().toLowerCase();
        log.info("开始提取文件文本: {}", file.getAbsolutePath());
        try {
            if (name.endsWith(".pdf")) {
                return extractTextFromPdf(file);
            } else if (name.endsWith(".docx")) {
                return extractTextFromDocx(file);
            } else if (name.endsWith(".pptx")) {
                return extractTextFromPptx(file);
            } else if (name.endsWith(".txt")) {
                return extractTextFromTxt(file);
            } else {
                // 其他格式先简单按文本尝试
                log.warn("不支持的文件类型: {}，尝试按 UTF-8 文本读取", name);
                return extractTextFromTxt(file);
            }
        } catch (Exception e) {
            log.error("提取文件文本失败: {}", file.getAbsolutePath(), e);
            throw new RuntimeException("提取文件文本失败: " + e.getMessage(), e);
        }
    }

    private String extractTextFromPdf(File file) throws Exception {
        try (PDDocument pdDocument = PDDocument.load(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(pdDocument);
        }
    }

    private String extractTextFromDocx(File file) throws Exception {
        try (FileInputStream fis = new FileInputStream(file);
             XWPFDocument document = new XWPFDocument(fis);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        }
    }

    private String extractTextFromPptx(File file) throws Exception {
        StringBuilder sb = new StringBuilder();
        try (FileInputStream fis = new FileInputStream(file);
             XMLSlideShow ppt = new XMLSlideShow(fis)) {
            for (XSLFSlide slide : ppt.getSlides()) {
                for (XSLFShape shape : slide.getShapes()) {
                    if (shape instanceof XSLFTextShape textShape) {
                        sb.append(textShape.getText()).append("\n");
                    }
                }
            }
        }
        return sb.toString();
    }

    private String extractTextFromTxt(File file) throws Exception {
        return new String(Files.readAllBytes(file.toPath()));
    }
}
