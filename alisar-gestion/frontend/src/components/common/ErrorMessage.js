import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, onDismiss }) => (
  <div style={{
    background: '#3a1a1a',
    border: '1px solid #f87171',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#f87171'
  }}>
    <AlertCircle size={20} />
    <span style={{ flex: 1 }}>{message}</span>
    {onDismiss && (
      <button
        onClick={onDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#f87171',
          cursor: 'pointer',
          fontSize: '20px'
        }}
      >
        ×
      </button>
    )}
  </div>
);

export default ErrorMessage;
