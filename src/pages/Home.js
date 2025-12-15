import React, { useState, useEffect, useCallback } from 'react';
import { Layout, List, Card, Divider, Empty, message, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import { getUserDocuments } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const { Content } = Layout;

const getDocId = (doc) => doc?.id ?? doc?.document_id ?? doc?.documentId;

const Home = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthed, user } = useAuth();
  const navigate = useNavigate();

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    if (!isAuthed || !user?.id) {
      setDocuments([]);
      setLoading(false);
      return;
    }
    try {
      const data = await getUserDocuments(user.id);
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error('获取文档列表失败：' + err.message);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthed, user?.id]);

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  };

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const formatStatus = (status) => {
    const map = {
      UPLOADED: '待分析',
      PROCESSING: 'AI分析中',
      COMPLETED: '分析完成',
      ERROR: '分析失败'
    };
    return map[status] || '未知状态';
  };

  const getStatusColor = (status) => {
    const map = {
      UPLOADED: '#1890ff',
      PROCESSING: '#faad14',
      COMPLETED: '#52c41a',
      ERROR: '#f5222d'
    };
    return map[status] || '#666';
  };

  return (
    <Layout>
      <Content>
        <div className="page-decor page-decor--home" style={{ padding: '20px 50px', maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ color: '#1890ff', textAlign: 'center', marginBottom: 20 }}>
          智学链 (SmartLogos) - AI知识聚合系统
        </h1>

        {isAuthed ? (
          <FileUpload refreshDocuments={fetchDocuments} />
        ) : (
          <Card style={{ marginBottom: 24 }}>
            <p style={{ marginBottom: 12 }}>登录后即可上传并查看个人文档。</p>
            <Button type="primary" onClick={() => navigate('/login')}>
              去登录 / 注册
            </Button>
          </Card>
        )}

        <Divider orientation="left">我的文档</Divider>

        {loading ? (
          <LoadingSpinner loading={loading} />
        ) : !isAuthed ? (
          <Empty description="请先登录后查看文档" />
        ) : documents.length === 0 ? (
          <Empty description="暂无上传的文档，上传文件开始AI分析吧！" />
        ) : (
          <List
            grid={{ gutter: 16, column: 3, xs: 1, sm: 2, md: 3 }}
            dataSource={documents}
            renderItem={(doc) => (
              <List.Item>
                <Card
                  title={doc.filename || doc.fileName}
                  bordered
                  hoverable
                  onClick={() => {
                    const docId = getDocId(doc);
                    if (!docId) {
                      message.error('未获取到文档ID，无法打开');
                      return;
                    }
                    navigate(`/note/${docId}`);
                  }}
                  extra={
                    (() => {
                      const docId = getDocId(doc);
                      return docId ? (
                        <Link
                          to={`/note/${docId}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{ color: '#1890ff' }}
                        >
                          打开
                        </Link>
                      ) : (
                        <span style={{ color: getStatusColor(doc.status) }}>
                          {formatStatus(doc.status)}
                        </span>
                      );
                    })()
                  }
                >
                  <p>文件类型：{doc.contentType || '-'}</p>
                  <p>大小：{formatSize(doc.fileSize || doc.file_size)}</p>
                  <p>上传时间：{doc.upload_time || new Date(doc.uploadTime).toLocaleString()}</p>
                  <p>
                    状态：<span style={{ color: getStatusColor(doc.status), fontWeight: 600 }}>
                      {formatStatus(doc.status)}
                    </span>
                  </p>
                </Card>
              </List.Item>
            )}
          />
        )}
        </div>
      </Content>
    </Layout>
  );
};

export default Home;