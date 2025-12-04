import React, { useState } from 'react';
import { Upload, Button, Select, message, Spin, Progress } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { analyzeFile, getUserDocuments } from '../api';

const { Option } = Select;
const TEST_USER_ID = 1; // 测试用户ID

const FileUpload = ({ refreshDocuments }) => {
  const [loading, setLoading] = useState(false); // 上传中
  const [processing, setProcessing] = useState(false); // AI处理中
  const [uploadPercent, setUploadPercent] = useState(0); // 上传进度
  const [processPercent, setProcessPercent] = useState(0); // AI处理进度
  const [targetLang, setTargetLang] = useState('zh'); // 目标语言

  // 轮询AI处理状态（适配长处理时间）
  const pollAIStatus = (documentId) => {
    let pollCount = 0;
    const maxPollCount = 60; // 最多轮询60次（60秒超时）
    const interval = setInterval(async () => {
      pollCount++;
      setProcessPercent(Math.min(Math.floor((pollCount / maxPollCount) * 100), 95)); // 最高95%，避免提前100%

      try {
        const res = await getUserDocuments(TEST_USER_ID);
        const targetDoc = res.data.find(doc => doc.id === documentId);
        if (!targetDoc) {
          clearInterval(interval);
          setProcessing(false);
          message.error('文档状态查询失败');
          return;
        }

        // 状态判断（适配AI处理）
        switch (targetDoc.status) {
          case 'COMPLETED':
            clearInterval(interval);
            setProcessPercent(100);
            setProcessing(false);
            message.success('AI分析完成！');
            refreshDocuments();
            break;
          case 'ERROR':
            clearInterval(interval);
            setProcessing(false);
            setProcessPercent(0);
            message.error('AI分析失败：' + (targetDoc.errorMsg || '未知错误'));
            break;
          case 'UPLOADED':
            // 刚上传，还未开始处理
            break;
              default:
            console.warn('未知的文档状态：', targetDoc.status);
            // 可选：超时前继续轮询，不中断
            break;
        }

        // 超时处理
        if (pollCount >= maxPollCount) {
          clearInterval(interval);
          setProcessing(false);
          message.warning('AI分析超时，可手动刷新查看结果');
        }
      } catch (err) {
        clearInterval(interval);
        setProcessing(false);
        message.error('状态查询失败：' + err.message);
      }
    }, 1000);
    return interval;
  };

  const handleUpload = async (file) => {
    setLoading(true);
    setUploadPercent(0);

    // 文件校验
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      message.error('仅支持PDF/Word/PPT/TXT格式！');
      setLoading(false);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      message.error('文件大小不能超过10MB！');
      setLoading(false);
      return;
    }

    // 构造FormData（适配AI接口参数）
    const formData = new FormData();
    formData.append('file', file); // 二进制文件流
    formData.append('target_lang', targetLang); // 目标语言（zh/en）
    formData.append('userId', TEST_USER_ID); // 用户ID

    try {
      // 调用AI核心接口
      const res = await analyzeFile(formData);
      const { success, documentId, message: resMsg } = res.data;
      
      if (success && documentId) {
        message.success(resMsg || '文件上传成功，开始AI深度分析（预计10秒左右）...');
        setLoading(false);
        setProcessing(true);
        setUploadPercent(100);
        // 启动AI状态轮询
        pollAIStatus(documentId);
      } else {
        message.error(resMsg || '文件上传失败');
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      setProcessing(false);
      const errMsg = err.response?.data?.message || 'AI接口调用失败：' + err.message;
      message.error(errMsg);
      console.error('AI分析接口错误：', err);
    }
  };

  return (
    <div style={{ margin: '20px 0', padding: '10px', border: '1px solid #e8e8e8', borderRadius: 8 }}>
      {/* 目标语言选择 */}
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: 8, fontWeight: 600 }}>目标语言：</span>
        <Select
          value={targetLang}
          style={{ width: 120 }}
          onChange={(v) => setTargetLang(v)}
          disabled={loading || processing}
        >
          <Option value="zh">中文</Option>
          <Option value="en">英文</Option>
        </Select>
        <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>
          AI将以所选语言生成摘要/问题
        </span>
      </div>

      {/* 上传按钮 */}
      <Upload
        name="file"
        beforeUpload={(file) => {
          handleUpload(file);
          return false;
        }}
        showUploadList={false}
        disabled={loading || processing}
      >
        <Button 
          type="primary" 
          icon={<UploadOutlined />} 
          loading={loading || processing}
        >
          {loading ? '文件上传中...' : processing ? <Spin size="small" /> : '上传文件（PDF/Word/PPT/TXT）'}
        </Button>
      </Upload>

      {/* 进度条（先显示上传进度，再显示AI处理进度） */}
      {(loading || processing) && (
        <div style={{ marginTop: 12 }}>
          <Progress
            percent={loading ? uploadPercent : processPercent}
            status={processing ? "active" : "normal"}
            style={{ width: '100%' }}
            format={(percent) => {
              if (loading) return `文件上传 ${percent}%`;
              if (processing) return `AI分析中 ${percent}%（预计10秒）`;
              return `${percent}%`;
            }}
          />
          {processing && (
            <p style={{ textAlign: 'center', fontSize: 12, color: '#999', marginTop: 4 }}>
              通义千问Plus正在深度分析文档，请耐心等待...
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;