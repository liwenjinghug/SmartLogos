import React, { useMemo, useState } from 'react';
import { Upload, Button, message, Progress, Select, Card, Typography, Tag, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import LoadingSpinner from './LoadingSpinner';
import ChatFloat from './ChatFloat';
import { analyzeFile, uploadDocument, saveNoteData } from '../api/index';
import { useAuth } from '../contexts/AuthContext';

const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const normalize = (s) => String(s ?? '').trim().toLowerCase();

const FileUpload = ({ refreshDocuments }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  // 新增目标语言状态管理
  const [targetLang, setTargetLang] = useState('zh'); // 默认中文

  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedMap, setSelectedMap] = useState({});
  const [showExplainMap, setShowExplainMap] = useState({});
  const { isAuthed, user } = useAuth();

  const handleUpload = async () => {
    if (!file) {
      message.warning('请选择文件后上传');
      return;
    }
    if (!isAuthed || !user?.id) {
      message.warning('请先登录后再上传');
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      setUploading(true);
      setUploadPercent(0);

      setAnalysisResult(null);
      setSelectedMap({});
      setShowExplainMap({});

      // 第一步：上传到数据服务，获取 document_id
      const uploadRes = await uploadDocument(formData, user.id);
      const documentId = uploadRes?.document_id ?? uploadRes?.documentId ?? uploadRes?.id;

      // 第二步：调用 AI 分析（需要新的 FormData 避免流被消费）
      const aiForm = new FormData();
      aiForm.append('file', file);
      const res = await analyzeFile(
        aiForm,
        targetLang,
        (progressEvent) => {
          if (!progressEvent.total) return;
          const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setUploadPercent(percent);
        }
      );

      const aiData = res.data;
      setAnalysisResult(aiData);
      message.success('AI分析完成');

      // 第三步：落库笔记与题目
      try {
        if (documentId) {
          await saveNoteData(documentId, aiData);
          message.success('笔记数据已保存到数据库');
        } else {
          message.warning('未获取到 document_id，跳过落库');
        }
      } catch (dbErr) {
        console.error('落库失败：', dbErr);
        message.warning('AI分析成功，但保存到数据库失败：' + dbErr.message);
      }

      if (typeof refreshDocuments === 'function') {
        refreshDocuments();
      }
    } catch (err) {
      message.error(`上传失败：${err.message}`);
      setUploadPercent(0);
    } finally {
      setUploading(false);
    }
  };

  const quizItems = useMemo(() => {
    const quizzes = analysisResult?.quizzes;
    return Array.isArray(quizzes) ? quizzes : [];
  }, [analysisResult]);

  const tags = useMemo(() => {
    const t = analysisResult?.tags;
    return Array.isArray(t) ? t : [];
  }, [analysisResult]);

  const contextForChat = useMemo(() => {
    if (!analysisResult) return '';
    const parts = [
      analysisResult.filename ? `文件名：${analysisResult.filename}` : '',
      analysisResult.summary ? `摘要：\n${analysisResult.summary}` : '',
      analysisResult.mind_map_md ? `思维导图（Markdown）：\n${analysisResult.mind_map_md}` : '',
    ].filter(Boolean);
    return parts.join('\n\n');
  }, [analysisResult]);

  const onSelectOption = (quizIndex, optionIndex) => {
    setSelectedMap((prev) => ({ ...prev, [quizIndex]: optionIndex }));
  };

  const toggleExplain = (quizIndex) => {
    setShowExplainMap((prev) => ({ ...prev, [quizIndex]: !prev[quizIndex] }));
  };

  const isCorrect = (quiz, optionIndex) => {
    const answer = quiz?.answer;
    const options = Array.isArray(quiz?.options) ? quiz.options : [];
    const selectedLetter = LETTERS[optionIndex] || '';
    const selectedText = options[optionIndex] || '';
    return normalize(answer) === normalize(selectedLetter) || normalize(answer) === normalize(selectedText);
  };

  const handleFileChange = (info) => {
    if (info.fileList.length > 0) {
      const selectedFile = info.fileList[0];
      if (selectedFile.status !== 'removed' && selectedFile.originFileObj) {
        setFile(selectedFile.originFileObj);
        message.success('文件选择成功');
      }
    } else {
      setFile(null);
    }
  };

  return (
    <div className="page-decor page-decor--upload" style={{ padding: 20 }}>
      <Card title="上传文档并生成笔记" style={{ marginBottom: 16 }}>
        <div className="upload-toolbar">
          <Upload
            name="file"
            beforeUpload={() => false}
            onChange={handleFileChange}
            showUploadList={false}
            multiple={false}
          >
            <Button icon={<UploadOutlined />} disabled={uploading}>
              选择文件
            </Button>
          </Upload>

          <Select
            value={targetLang}
            style={{ width: 140 }}
            onChange={(value) => setTargetLang(value)}
            disabled={uploading}
          >
            <Option value="zh">输出中文</Option>
            <Option value="en">输出英文</Option>
          </Select>

          <Button
            type="primary"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? 'AI处理中...' : '上传并分析'}
          </Button>
        </div>

        <div className="upload-hint">
          {file ? `已选择：${file.name}` : '支持 PDF / Docx / PPT / TXT。AI 处理大约 10 秒。'}
        </div>
      
      {uploadPercent > 0 && (
        <Progress 
          percent={uploadPercent} 
          style={{ marginTop: 10, maxWidth: 520 }} 
          status={uploadPercent === 100 ? "success" : "active"}
        />
      )}

      {uploading && (
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">AI处理中（通义千问Plus），通常约 10 秒，请稍候…</Text>
          <LoadingSpinner loading={uploading} />
        </div>
      )}
      </Card>

      {analysisResult && (
        <div style={{ marginTop: 20 }}>
          <Title level={3} style={{ marginTop: 0 }}>{analysisResult.filename || '分析结果'}</Title>

          <Card title="摘要" style={{ marginBottom: 16 }}>
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{analysisResult.summary}</Paragraph>
          </Card>

          <Card title="思维导图（Markdown）" style={{ marginBottom: 16 }}>
            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
              {analysisResult.mind_map_md || ''}
            </ReactMarkdown>
          </Card>

          <Card title={`智能选择题（共${quizItems.length}道）`} style={{ marginBottom: 16 }}>
            {quizItems.length === 0 ? (
              <Text type="secondary">暂无题目</Text>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                {quizItems.map((quiz, qi) => {
                  const options = Array.isArray(quiz?.options) ? quiz.options : [];
                  const selected = selectedMap[qi];
                  const selectedDone = typeof selected === 'number';
                  const showExplain = !!showExplainMap[qi];
                  return (
                    <Card key={qi} type="inner" title={`第 ${qi + 1} 题`}>
                      <Paragraph strong style={{ marginBottom: 8 }}>{quiz?.question}</Paragraph>

                      <Space direction="vertical" style={{ width: '100%' }}>
                        {options.map((opt, oi) => {
                          const picked = selected === oi;
                          const correct = selectedDone && isCorrect(quiz, oi);
                          const wrong = selectedDone && picked && !isCorrect(quiz, oi);
                          const shouldHighlightCorrect = selectedDone && isCorrect(quiz, oi);
                          return (
                            <Button
                              key={oi}
                              block
                              onClick={() => onSelectOption(qi, oi)}
                              disabled={selectedDone}
                              type={picked ? 'primary' : 'default'}
                              danger={wrong}
                              className={
                                'quiz-option-btn ' +
                                (wrong ? 'quiz-option-wrong ' : '') +
                                (shouldHighlightCorrect ? 'quiz-option-correct' : '')
                              }
                            >
                              {LETTERS[oi]}. {opt}
                              {correct ? '（正确）' : ''}
                              {wrong ? '（错误）' : ''}
                            </Button>
                          );
                        })}
                      </Space>

                      {selectedDone && (
                        <div style={{ marginTop: 12 }}>
                          <Space>
                            <Text strong>正确答案：</Text>
                            <Text type="success">{quiz?.answer}</Text>
                            <Button size="small" onClick={() => toggleExplain(qi)}>
                              {showExplain ? '收起解析' : '查看解析'}
                            </Button>
                          </Space>

                          {showExplain && (
                            <div className="quiz-explain">
                              <Text strong>解析：</Text>
                              <div style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{quiz?.explanation || quiz?.analysis}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </Space>
            )}
          </Card>

          <Card title="标签" style={{ marginBottom: 16 }}>
            {tags.length === 0 ? (
              <Text type="secondary">暂无标签</Text>
            ) : (
              <Space wrap>
                {tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </Space>
            )}
          </Card>

          <ChatFloat context={contextForChat} title="智能问答" />
        </div>
      )}
    </div>
  );
};

export default FileUpload;