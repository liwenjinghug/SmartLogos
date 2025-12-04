import React from 'react';
import { ClipLoader } from 'react-spinners';

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