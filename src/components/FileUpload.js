import React, { useState } from 'react';
import { Upload, Button, message, Progress, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { uploadFile, getAIStatus } from '../api/index';

const { Option } = Select;
const TEST_USER_ID = 1;

const FileUpload = ({ refreshDocuments }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  // 新增目标语言状态管理
  const [targetLang, setTargetLang] = useState('zh'); // 默认中文

  const handleUpload = async () => {
    if (!file) {
      message.warning('请选择文件后上传');
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      setUploading(true);
      setUploadPercent(0);
      
      // 上传时传入选择的目标语言
      const res = await uploadFile(formData, targetLang);
      const { process_id } = res.data;
      
      if (process_id) {
        pollAIStatus(process_id);
      }
      
      message.success('文件上传成功，开始AI分析');
      refreshDocuments();
    } catch (err) {
      message.error(`上传失败：${err.message}`);
      setUploadPercent(0);
    } finally {
      setUploading(false);
    }
  };

  const pollAIStatus = async (processId) => {
    let count = 0;
    const interval = setInterval(async () => {
      count++;
      try {
        const res = await getAIStatus(processId);
        const { status } = res.data;
        
        if (status === "completed") {
          clearInterval(interval);
          message.success('AI分析完成');
          refreshDocuments();
        } else if (status === "failed") {
          clearInterval(interval);
          message.error('AI分析失败，请重新上传');
        } else if (count >= 60) {
          clearInterval(interval);
          message.warning('AI分析超时，请手动刷新查看状态');
        }
      } catch (err) {
        clearInterval(interval);
        message.error(`状态查询失败：${err.message}`);
      }
    }, 1000);
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
    <div style={{ padding: 20 }}>
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
      
      {/* 新增语言选择下拉框 */}
      <Select
        value={targetLang}
        style={{ width: 120, marginLeft: 10, verticalAlign: 'middle' }}
        onChange={(value) => setTargetLang(value)}
        disabled={uploading}
      >
        <Option value="zh">中文</Option>
        <Option value="en">英文</Option>
      </Select>
      
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={!file || uploading}
        style={{ marginLeft: 10 }}
      >
        {uploading ? '上传中...' : '上传并分析'}
      </Button>
      
      {uploadPercent > 0 && (
        <Progress 
          percent={uploadPercent} 
          style={{ marginTop: 10, width: 300 }} 
          status={uploadPercent === 100 ? "success" : "active"}
        />
      )}
    </div>
  );
};

export default FileUpload;