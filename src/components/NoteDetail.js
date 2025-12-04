import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Button } from 'react-router-dom';
import { Card, Typography, Tag, Divider, List, Spin, message, Tabs, Empty } from 'antd';
import ReactMarkdown from 'react-markdown';
import { getNoteByDocumentId, getDocumentQuestions, getMindMap } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const TEST_USER_ID = 1;

const NoteDetail = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [mindMap, setMindMap] = useState(null);
  const [loading, setLoading] = useState(true);

  // 适配新Notes表字段
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. 获取笔记（适配summary/mind_map_content/tags/lang）
      const noteRes = await getNoteByDocumentId(documentId);
      const noteData = noteRes.data;
      if (!noteData) {
        message.warning('暂无AI分析结果');
        setLoading(false);
        return;
      }
      setNote(noteData);

      // 2. 获取问题（适配quizzes解析后的字段）
      const questionsRes = await getDocumentQuestions(documentId, TEST_USER_ID);
      setQuestions(questionsRes.data || []);

      // 3. 获取思维导图（优先mind_map_content，其次接口返回）
      if (noteData.id) {
        try {
          const mindMapRes = await getMindMap(noteData.id);
          setMindMap(mindMapRes.data || JSON.parse(noteData.mind_map_content || '{}'));
        } catch (e) {
          // 降级使用mind_map_content（Markdown源码）
          setMindMap({ mdContent: noteData.mind_map_content });
        }
      }
    } catch (err) {
      message.error('数据加载失败：' + err.message);
      console.error('笔记加载错误：', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) fetchAllData();
  }, [documentId]);

  // 解析标签（适配JSON/数组/逗号分隔）
  const parseTags = (tags) => {
    if (!tags) return [];
    // 适配JSON字符串
    if (typeof tags === 'string' && tags.startsWith('[')) {
      try {
        return JSON.parse(tags);
      } catch (e) {}
    }
    // 适配逗号分隔
    if (typeof tags === 'string' && tags.includes(',')) {
      return tags.split(',').filter(t => t.trim());
    }
    // 适配数组
    if (Array.isArray(tags)) {
      return tags;
    }
    return [tags];
  };

  // 解析选项（适配JSON字符串）
  const parseOptions = (options) => {
    if (!options) return [];
    try {
      return JSON.parse(options);
    } catch (e) {
      return options.split(',') || [];
    }
  };

  if (loading) return <LoadingSpinner loading={loading} />;
  if (!note) return (
    <div style={{ padding: '20px 50px', textAlign: 'center' }}>
      <Empty description="暂无AI分析结果（文档可能还在处理中）" />
      <Button type="primary" onClick={() => navigate('/')} style={{ marginTop: 20 }}>
        返回文档列表
      </Button>
    </div>
  );

  return (
    <div style={{ padding: '20px 50px' }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              文档笔记详情 
              <Tag size="small" style={{ marginLeft: 8 }}>
                {note.lang === 'en' ? '英文' : '中文'}
              </Tag>
            </span>
            <Button type="primary" size="small" onClick={() => navigate('/')}>
              返回列表
            </Button>
          </div>
        }
        bordered
      >
        <Tabs defaultActiveKey="1" animated={false}>
          {/* 摘要标签页（适配新字段） */}
          <TabPane tab="AI摘要" key="1">
            <Title level={4} style={{ marginBottom: 16 }}>
              {note.lang === 'en' ? 'AI Summary' : '智能摘要'}
            </Title>
            <Paragraph style={{ lineHeight: 1.8, fontSize: 14 }}>
              {note.summary || '暂无摘要'}
            </Paragraph>

            <Divider orientation="left" plain>
              {note.lang === 'en' ? 'Document Tags' : '文档标签'}
            </Divider>
            <div>
              {parseTags(note.tags).map((tag, idx) => (
                <Tag key={idx} color="blue" style={{ margin: '0 8px 8px 0' }}>
                  {tag}
                </Tag>
              ))}
            </div>
          </TabPane>

          {/* 思维导图（适配mind_map_content Markdown） */}
          <TabPane tab={note.lang === 'en' ? 'Mind Map' : '思维导图'} key="2">
            <div style={{ 
              border: '1px solid #e8e8e8', 
              padding: 20, 
              borderRadius: 8,
              backgroundColor: '#fafafa',
              minHeight: 400
            }}>
              {mindMap?.mdContent || note.mind_map_content ? (
                <ReactMarkdown children={mindMap.mdContent || note.mind_map_content} />
              ) : (
                <Spin tip={note.lang === 'en' ? 'Loading mind map...' : '加载思维导图中...'}>
                  <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span>{note.lang === 'en' ? 'No mind map data' : '暂无思维导图数据'}</span>
                  </div>
                </Spin>
              )}
            </div>
          </TabPane>

          {/* 智能问题（适配quizzes解析后的字段） */}
          <TabPane tab={note.lang === 'en' ? 'AI Questions' : '智能问题'} key="3">
            {questions.length > 0 ? (
              <List
                dataSource={questions}
                renderItem={(q, idx) => (
                  <List.Item
                    style={{ 
                      border: '1px solid #e8e8e8', 
                      borderRadius: 8, 
                      padding: 16, 
                      marginBottom: 16 
                    }}
                  >
                    <div>
                      <Paragraph strong style={{ margin: 12, fontSize: 14 }}>
                        {idx + 1}. {q.question || q.questionText}
                      </Paragraph>

                      {q.options && (
                        <div style={{ marginBottom: 8, fontSize: 13 }}>
                          <span style={{ fontWeight: 600 }}>
                            {note.lang === 'en' ? 'Options: ' : '选项：'}
                          </span>
                          {parseOptions(q.options).map((opt, oIdx) => (
                            <div key={oIdx} style={{ marginLeft: 16, marginTop: 4 }}>
                              {String.fromCharCode(65 + oIdx)}. {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ marginBottom: 8, fontSize: 13 }}>
                        <span style={{ fontWeight: 600 }}>
                          {note.lang === 'en' ? 'Answer: ' : '答案：'}
                        </span>
                        <span style={{ color: '#52c41a' }}>{q.answer || 'N/A'}</span>
                      </div>

                      {q.explanation && (
                        <div style={{ fontSize: 13, color: '#666' }}>
                          <span style={{ fontWeight: 600 }}>
                            {note.lang === 'en' ? 'Explanation: ' : '解析：'}
                          </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description={note.lang === 'en' ? 'No AI generated questions' : '暂无智能生成的问题'} />
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default NoteDetail;