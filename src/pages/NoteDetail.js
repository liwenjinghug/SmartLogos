import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Tag, Divider, List } from 'antd';
import ReactMarkdown from 'react-markdown';
import { getNoteByDocumentId } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const { Title, Paragraph } = Typography;

const NoteDetail = () => {
  const { documentId } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  // 模拟数据（先避免接口报错，后续替换真实接口）
  useEffect(() => {
    setTimeout(() => {
      setNote({
        summary: '这是测试文档的摘要内容',
        mind_map_content: '# 思维导图\n- 第一章：基础概念\n  - 1.1 核心定义\n  - 1.2 应用场景\n- 第二章：实践操作',
        tags: ['人工智能', '学习笔记', '多模态'],
        questions: [
          {
            question: 'OSI参考模型共有多少层？',
            options: '["5层", "6层", "7层", "8层"]',
            answer: '7层',
            explanation: 'OSI参考模型分为物理层、数据链路层、网络层、传输层、会话层、表示层、应用层，共7层'
          }
        ]
      });
      setLoading(false);
    }, 1000);
  }, [documentId]);

  if (loading) return <LoadingSpinner loading={loading} />;
  if (!note) return <div>笔记不存在</div>;

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={2}>文档笔记</Title>
        <Divider />
        
        <Title level={4}>摘要</Title>
        <Paragraph>{note.summary}</Paragraph>
        
        <Title level={4}>标签</Title>
        {note.tags.map((tag, index) => (
          <Tag key={index} color="blue">{tag}</Tag>
        ))}
        
        <Divider />
        <Title level={4}>思维导图</Title>
        <div style={{ 
          border: '1px solid #e8e8e8', 
          padding: '10px', 
          borderRadius: '4px',
          backgroundColor: '#fafafa'
        }}>
          <ReactMarkdown>{note.mind_map_content}</ReactMarkdown>
        </div>
        
        <Divider />
        <Title level={4}>智能问题</Title>
        <List
          dataSource={note.questions}
          renderItem={(question) => (
            <List.Item>
              <div>
                <Typography.Paragraph strong>{question.question}</Typography.Paragraph>
                <div>选项：{JSON.parse(question.options).join(' | ')}</div>
                <div>答案：{question.answer}</div>
                <div>解析：{question.explanation}</div>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default NoteDetail;