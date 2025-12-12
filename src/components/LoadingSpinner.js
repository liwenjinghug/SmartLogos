import React from 'react';
import { ClipLoader } from 'react-spinners';
import { Typography } from 'antd'; // 从Typography中导入Text

const { Text } = Typography;

const LoadingSpinner = ({ loading }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
    }}>
      <ClipLoader
        color="#1890ff"
        loading={loading}
        size={50}
        aria-label="Loading Spinner"
      />
    </div>
  );
};

export default LoadingSpinner;