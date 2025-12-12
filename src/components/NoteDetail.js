import React, { useState, useEffect } from 'react';
import { Card, List, Typography, Input, Button, message, Divider } from 'antd';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize'; // 新增XSS防护
import { getNoteDetail, chatWithNote } from '../api/index';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

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
  // 新增聊天相关状态
  const [chatHistory, setChatHistory] = useState([]);
  const [userQuestion, setUserQuestion] = useState('');

  // 适配新接口的数据解析逻辑（仅修改解析部分，其他逻辑不变）
  useEffect(() => {
    const fetchNoteData = async () => {
      try {
        setLoading(true);
        const res = await getNoteDetail(noteId);
        // 按接口返回结构解析数据
        const { filename, summary, mind_map, quizzes, tags } = res.data;
        setNoteData({
          filename: filename || '',
          summary: summary || '',
          mindMap: mind_map || '', // 对应接口的mind_map字段
          quizzes: quizzes || [],  // 对应接口的quizzes数组
          tags: tags || []         // 对应接口的tags数组
        });
      } catch (err) {
        message.error('笔记加载失败：' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (noteId) {
      fetchNoteData();
    }
  }, [noteId]);

  // 新增聊天功能逻辑
  const handleSendQuestion = async () => {
    if (!userQuestion.trim() || !noteData.summary) {
      message.warning('请输入有效问题');
      return;
    }
    try {
      // 调用聊天接口，传递问题和笔记摘要作为上下文
      const res = await chatWithNote(userQuestion.trim(), noteData.summary);
      // 更新聊天记录
      setChatHistory([
        ...chatHistory,
        { role: 'user', content: userQuestion.trim() },
        { role: 'ai', content: res.data.answer || '暂无回答' }
      ]);
      setUserQuestion(''); // 清空输入框
    } catch (err) {
      message.error('聊天请求失败：' + err.message);
    }
  };

  // 保留原有UI结构，新增聊天模块
  if (loading) {
    return <div style={{ padding: 20 }}>加载中...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>{noteData.filename}</Title>
      
      <Card title="笔记摘要" style={{ marginBottom: 20 }}>
        <Paragraph>{noteData.summary}</Paragraph>
      </Card>

      <Card title="思维导图" style={{ marginBottom: 20 }}>
        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
          {noteData.mindMap}
        </ReactMarkdown>
      </Card>

      {/* 新增AI聊天模块 */}
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
      
      {/* 聊天记录展示 */}
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