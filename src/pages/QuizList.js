import React, { useState, useEffect } from 'react';
import { Card, List, Typography, Input, Button, Select, message, Spin } from 'antd';
import { getQuizzesFromDB, getUserDocuments } from '../api/index';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const getDocId = (doc) => doc?.id ?? doc?.document_id ?? doc?.documentId;
const getDocName = (doc) => doc?.filename ?? doc?.fileName ?? '未命名';

const QuizList = () => {
  const [loading, setLoading] = useState(true);
  const [quizzesList, setQuizzesList] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const { user } = useAuth();

  // 加载笔记列表（用于筛选）
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        if (!user?.id) return;
        const res = await getUserDocuments(user.id);
        setDocuments(Array.isArray(res) ? res : []);
      } catch (err) {
        message.error('加载笔记列表失败：' + err.message);
      }
    };
    fetchDocuments();
  }, [user?.id]);

  // 加载题目列表（支持筛选）
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const params = selectedNoteId ? { note_id: selectedNoteId } : {};
        const data = await getQuizzesFromDB(params);
        let quizzes = Array.isArray(data) ? data : [];
        
        // 关键词过滤
        if (searchKeyword) {
          quizzes = quizzes.filter(quiz => 
            (quiz.question || quiz.title).includes(searchKeyword)
          );
        }
        
        setQuizzesList(quizzes);
      } catch (err) {
        message.error('加载题目失败：' + err.message);
        setQuizzesList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [selectedNoteId, searchKeyword, user?.id]);

  // 渲染题目列表
  const renderQuizzes = () => {
    if (loading) return <Spin tip="加载题目中..." />;
    if (quizzesList.length === 0) return <Text>暂无已存储的题目</Text>;

    return (
      <List
        dataSource={quizzesList}
        renderItem={(quiz, index) => (
          <List.Item key={index} style={{ 
            margin: '10px 0', 
            padding: '15px', 
            border: '1px solid #e8e8e8', 
            borderRadius: '6px' 
          }}>
            <div>
              <Paragraph strong>
                {index + 1}. {quiz.question || quiz.title}
              </Paragraph>
              
              {/* 所属笔记 */}
              <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
                所属笔记：{(() => {
                  const quizDocId = quiz.document_id ?? quiz.note_id ?? quiz.id;
                  const doc = documents.find((d) => String(getDocId(d)) === String(quizDocId));
                  return doc ? getDocName(doc) : '未知';
                })()}
              </Text>

              {/* 选项 */}
              {quiz.options && (
                <div style={{ margin: '8px 0' }}>
                  {Object.entries(quiz.options).map(([key, value]) => (
                    <div key={key} style={{ margin: '4px 0' }}>
                      {key}. {value}
                    </div>
                  ))}
                </div>
              )}

              {/* 答案 */}
              {quiz.answer && (
                <Text type="success" strong>
                  答案：{quiz.answer}
                </Text>
              )}
            </div>
          </List.Item>
        )}
      />
    );
  };

  return (
    <div className="page-decor page-decor--quiz" style={{ padding: 20 }}>
      <Title level={2}>已存储题目查询</Title>
      
      {/* 筛选区域 */}
      <Card title="筛选条件" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ width: 200 }}>
            <Text strong>按笔记筛选：</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              placeholder="选择笔记"
              value={selectedNoteId}
              onChange={(value) => setSelectedNoteId(value)}
            >
              <Option value="">全部笔记</Option>
              {documents.map(doc => (
                <Option key={String(getDocId(doc))} value={String(getDocId(doc))}>
                  {getDocName(doc)}
                </Option>
              ))}
            </Select>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <Text strong>关键词搜索：</Text>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Input
                placeholder="输入题目关键词"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <Button 
                type="primary" 
                onClick={() => setSearchKeyword('')}
              >
                清空
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* 题目列表 */}
      <Card title={`题目列表（共${quizzesList.length}道）`}>
        {renderQuizzes()}
      </Card>
    </div>
  );
};

export default QuizList;