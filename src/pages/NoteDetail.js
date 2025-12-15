import React, { useMemo, useState, useEffect } from 'react';
import { Card, Typography, Tag, List, Button, message, Space } from 'antd';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import LoadingSpinner from '../components/LoadingSpinner';
import ChatFloat from '../components/ChatFloat';
import { getNoteDetail, saveQuizzesToDB } from '../api/index';

const { Title, Text, Paragraph } = Typography;

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const normalize = (s) => String(s ?? '').trim().toLowerCase();

const toMarkdownMindMap = (value) => {
  if (value == null) return '';

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';
    // 如果后端把 JSON 当字符串存了，这里尽量解析成 Markdown
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return toMarkdownMindMap(parsed);
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }

  const pickText = (node) => {
    if (node == null) return '';
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (typeof node !== 'object') return '';
    return (
      node.topic ??
      node.title ??
      node.name ??
      node.text ??
      node.label ??
      node.value ??
      ''
    );
  };

  const pickChildren = (node) => {
    if (!node || typeof node !== 'object') return [];
    const children = node.children ?? node.nodes ?? node.items ?? node.subtopics ?? node.subNodes;
    return Array.isArray(children) ? children : [];
  };

  const lines = [];
  const walk = (node, depth) => {
    const text = pickText(node);
    if (text) {
      lines.push(`${'  '.repeat(depth)}- ${text}`);
    }
    for (const child of pickChildren(node)) {
      walk(child, Math.min(depth + 1, 10));
    }
  };

  if (Array.isArray(value)) {
    for (const node of value) walk(node, 0);
  } else if (typeof value === 'object') {
    // 常见结构：{root:{...}} / {data:{...}}
    const root = value.root ?? value.data ?? value.tree ?? value;
    walk(root, 0);
  }

  return lines.join('\n');
};

const NoteDetail = () => {
  const { id: noteId } = useParams();
  const [noteData, setNoteData] = useState({
    filename: '',
    summary: '',
    mindMap: '',
    quizzes: [],
    tags: []
  });
  const [loading, setLoading] = useState(true);
  const [quizzesSaved, setQuizzesSaved] = useState(false); // 题目是否已存储
  const [selectedMap, setSelectedMap] = useState({});
  const [showExplainMap, setShowExplainMap] = useState({});

  // 获取笔记详情 + 自动存储题目
  useEffect(() => {
    const fetchNoteData = async () => {
      try {
        setLoading(true);
        setSelectedMap({});
        setShowExplainMap({});
        const data = await getNoteDetail(noteId);
        const { filename, summary, mind_map, mind_map_md, quizzes, tags } = data;
        const mindMapRaw =
          mind_map_md ??
          data.mindMapMd ??
          data.mind_map_markdown ??
          data.mindMapMarkdown ??
          mind_map ??
          data.mindMap;
        const noteInfo = {
          filename: filename || '',
          summary: summary || '',
          mindMap: toMarkdownMindMap(mindMapRaw),
          quizzes: quizzes || [],
          tags: tags || []
        };
        setNoteData(noteInfo);
        
        // 自动存储题目到后端
        if (quizzes && quizzes.length > 0 && !quizzesSaved) {
          await saveQuizzesToDB(noteId, quizzes);
          setQuizzesSaved(true);
          message.success('题目已成功存入数据库！');
        }
      } catch (err) {
        message.error('笔记加载失败：' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (noteId) {
      fetchNoteData();
    }
  }, [noteId, quizzesSaved]);

  // 手动存储题目（备用）
  const handleSaveQuizzes = async () => {
    if (noteData.quizzes.length === 0) {
      message.warning('暂无题目可存储');
      return;
    }
    try {
      await saveQuizzesToDB(noteId, noteData.quizzes);
      setQuizzesSaved(true);
      message.success('题目已存入数据库！');
    } catch (err) {
      message.error('存储失败：' + err.message);
    }
  };

  const contextForChat = useMemo(() => {
    if (!noteData) return '';
    const parts = [
      noteData.filename ? `文件名：${noteData.filename}` : '',
      noteData.summary ? `摘要：\n${noteData.summary}` : '',
      noteData.mindMap ? `思维导图（Markdown）：\n${noteData.mindMap}` : '',
    ].filter(Boolean);
    return parts.join('\n\n');
  }, [noteData]);

  const quizItems = useMemo(() => (Array.isArray(noteData?.quizzes) ? noteData.quizzes : []), [noteData]);

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

  // 渲染题目列表
  const renderQuizzes = () => {
    if (!quizItems || quizItems.length === 0) {
      return <Text>暂无题目</Text>;
    }
    return (
      <List
        dataSource={quizItems}
        renderItem={(quiz, index) => {
          const options = Array.isArray(quiz?.options) ? quiz.options : [];
          const selected = selectedMap[index];
          const selectedDone = typeof selected === 'number';
          const showExplain = !!showExplainMap[index];
          return (
            <List.Item key={index} style={{ padding: 0, border: 'none' }}>
              <Card style={{ width: '100%' }} type="inner" title={`第 ${index + 1} 题`}>
                <Paragraph strong style={{ marginBottom: 8 }}>{quiz?.question || quiz?.title}</Paragraph>

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
                        onClick={() => onSelectOption(index, oi)}
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
                      <Button size="small" onClick={() => toggleExplain(index)}>
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
            </List.Item>
          );
        }}
      />
    );
  };

  if (loading) return <LoadingSpinner loading={loading} />;

  return (
    <div className="note-page">
      <Title level={2}>{noteData.filename}</Title>
      
      {/* 笔记摘要 */}
      <Card title="笔记摘要" style={{ marginBottom: 20 }}>
        <Paragraph>{noteData.summary}</Paragraph>
      </Card>

      {/* 思维导图 */}
      <Card title="思维导图" style={{ marginBottom: 20 }}>
        {noteData.mindMap ? (
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
            {noteData.mindMap}
          </ReactMarkdown>
        ) : (
          <Text type="secondary">暂无思维导图数据</Text>
        )}
      </Card>

      {/* AI提取题目（新增） */}
      <Card 
        title={`AI提取题目（共${quizItems.length}道）`} 
        style={{ marginBottom: 20 }}
        extra={
          quizzesSaved ? (
            <Tag color="green">已存入数据库</Tag>
          ) : (
            <Button 
              type="primary" 
              size="small"
              onClick={handleSaveQuizzes}
            >
              存入数据库
            </Button>
          )
        }
      >
        {renderQuizzes()}
      </Card>

      {/* 悬浮问答窗：调用 /api/chat，并携带当前笔记上下文 */}
      <ChatFloat context={contextForChat} title="智能问答" />
    </div>
  );
};

export default NoteDetail;