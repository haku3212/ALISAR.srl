import React from 'react';

const LoadingSpinner = ({ size = 40 }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px'
  }}>
    <div style={{
      width: size,
      height: size,
      border: '4px solid #374151',
      borderTop: '4px solid #4ade80',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default LoadingSpinner;
