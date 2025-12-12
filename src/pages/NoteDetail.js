import React, { useState, useEffect } from 'react';
import { Card, Typography, Tag, Divider, List, Button, message } from 'antd';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { getNoteDetail, chatWithNote, saveQuizzesToDB } from '../api/index';

const { Title, Text, Paragraph, TextArea } = Typography;

const NoteDetail = ({ match }) => {
  const noteId = match.params.id;
  const [noteData, setNoteData] = useState({
    filename: '',
    summary: '',
    mindMap: '',
    quizzes: [],
    tags: []
  });
  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [quizzesSaved, setQuizzesSaved] = useState(false); // 题目是否已存储

  // 获取笔记详情 + 自动存储题目
  useEffect(() => {
    const fetchNoteData = async () => {
      try {
        setLoading(true);
        const res = await getNoteDetail(noteId);
        const { filename, summary, mind_map, quizzes, tags } = res.data;
        const noteInfo = {
          filename: filename || '',
          summary: summary || '',
          mindMap: mind_map || '',
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

  // Chat with Note 逻辑
  const handleSendQuestion = async () => {
    if (!userQuestion.trim() || !noteData.summary) {
      message.warning('请输入有效问题');
      return;
    }
    try {
      const res = await chatWithNote(userQuestion.trim(), noteData.summary);
      setChatHistory([
        ...chatHistory,
        { role: 'user', content: userQuestion.trim() },
        { role: 'ai', content: res.data.answer || '暂无回答' }
      ]);
      setUserQuestion('');
    } catch (err) {
      message.error('聊天请求失败：' + err.message);
    }
  };

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

  // 渲染题目列表
  const renderQuizzes = () => {
    if (!noteData.quizzes || noteData.quizzes.length === 0) {
      return <Text>暂无题目</Text>;
    }
    return (
      <List
        dataSource={noteData.quizzes}
        renderItem={(quiz, index) => (
          <List.Item key={index} style={{ margin: '10px 0', padding: '10px', border: '1px solid #e8e8e8', borderRadius: '4px' }}>
            <div>
              <Paragraph strong>
                第{index + 1}题：{quiz.question || quiz.title}
              </Paragraph>
              {quiz.options && (
                <div style={{ margin: '8px 0' }}>
                  {Object.entries(quiz.options).map(([key, value]) => (
                    <div key={key} style={{ margin: '4px 0' }}>
                      {key}. {value}
                    </div>
                  ))}
                </div>
              )}
              {quiz.answer && (
                <Text type="success">
                  答案：{quiz.answer}
                </Text>
              )}
            </div>
          </List.Item>
        )}
      />
    );
  };

  if (loading) {
    return <div style={{ padding: 20 }}>加载中...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>{noteData.filename}</Title>
      
      {/* 笔记摘要 */}
      <Card title="笔记摘要" style={{ marginBottom: 20 }}>
        <Paragraph>{noteData.summary}</Paragraph>
      </Card>

      {/* 思维导图 */}
      <Card title="思维导图" style={{ marginBottom: 20 }}>
        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
          {noteData.mindMap}
        </ReactMarkdown>
      </Card>

      {/* AI提取题目（新增） */}
      <Card 
        title={`AI提取题目（共${noteData.quizzes.length}道）`} 
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

      {/* AI问答 */}
      <Divider title="AI问答" titlePlacement="left" />
      <div style={{ marginBottom: 20 }}>
        <TextArea
          placeholder="输入你想咨询的问题..."
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
          rows={4}
          style={{ marginBottom: 10 }}
        />
        <Button 
          type="primary" 
          onClick={handleSendQuestion}
          disabled={!userQuestion.trim()}
        >
          发送
        </Button>
      </div>
      
      {/* 聊天记录 */}
      <List
        dataSource={chatHistory}
        renderItem={(item) => (
          <List.Item
            style={{ 
              background: item.role === 'user' ? '#f0f8ff' : '#fff',
              padding: 10,
              marginBottom: 5,
              borderRadius: 4
            }}
          >
            <Text strong>{item.role === 'user' ? '我：' : 'AI：'}</Text>
            <Text>{item.content}</Text>
          </List.Item>
        )}
      />
    </div>
  );
};

export default NoteDetail;