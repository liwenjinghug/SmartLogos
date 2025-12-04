import React, { useState, useEffect } from 'react';
import { Layout, List, Card, Divider, Empty, message } from 'antd';
import { Link } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import { getUserDocuments } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const { Content } = Layout;
const TEST_USER_ID = 1;

const Home = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 刷新文档列表
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await getUserDocuments(TEST_USER_ID);
      setDocuments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      message.error('获取文档列表失败：' + err.message);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // 格式化文件大小
  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  };

  // 格式化状态
  const formatStatus = (status) => {
    const map = {
      UPLOADED: '待分析',
      PROCESSING: 'AI分析中',
      COMPLETED: '分析完成',
      ERROR: '分析失败'
    };
    return map[status] || '未知状态';
  };

  // 状态颜色
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
      <Content style={{ padding: '20px 50px', maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ color: '#1890ff', textAlign: 'center', marginBottom: 20 }}>
          智学链 (SmartLogos) - AI知识聚合系统
        </h1>

        {/* 上传组件 */}
        <FileUpload refreshDocuments={fetchDocuments} />

        <Divider orientation="left">我的文档</Divider>

        {loading ? (
          <LoadingSpinner loading={loading} />
        ) : documents.length === 0 ? (
          <Empty description="暂无上传的文档，上传文件开始AI分析吧！" />
        ) : (
          <List
            grid={{ gutter: 16, column: 3, xs: 1, sm: 2, md: 3 }}
            dataSource={documents}
            renderItem={(doc) => (
              <List.Item>
                <Card
                  title={doc.fileName}
                  bordered
                  hoverable
                  extra={
                    doc.status === 'COMPLETED' ? (
                      <Link to={`/note/${doc.id}`} style={{ color: '#1890ff' }}>
                        查看笔记
                      </Link>
                    ) : (
                      <span style={{ color: getStatusColor(doc.status) }}>
                        {formatStatus(doc.status)}
                      </span>
                    )
                  }
                >
                  <p>文件类型：{doc.contentType || '-'}</p>
                  <p>大小：{formatSize(doc.fileSize)}</p>
                  <p>上传时间：{new Date(doc.uploadTime).toLocaleString()}</p>
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
      </Content>
    </Layout>
  );
};

export default Home;