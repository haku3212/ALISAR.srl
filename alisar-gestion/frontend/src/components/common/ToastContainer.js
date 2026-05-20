import React from 'react';
import { useToast } from '../../context/ToastContext';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#4ade80" />;
      case 'error':
        return <AlertCircle size={20} color="#f87171" />;
      case 'warning':
        return <AlertTriangle size={20} color="#f97316" />;
      case 'info':
        return <Info size={20} color="#60a5fa" />;
      default:
        return null;
    }
  };

  const getStyle = (type) => {
    const baseStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      animation: 'slideIn 0.3s ease-out'
    };

    switch (type) {
      case 'success':
        return { ...baseStyle, background: '#1a221a', border: '1px solid #4ade80', color: '#4ade80' };
      case 'error':
        return { ...baseStyle, background: '#3a1a1a', border: '1px solid #f87171', color: '#f87171' };
      case 'warning':
        return { ...baseStyle, background: '#3a2a1a', border: '1px solid #f97316', color: '#f97316' };
      case 'info':
        return { ...baseStyle, background: '#1a2a3a', border: '1px solid #60a5fa', color: '#60a5fa' };
      default:
        return baseStyle;
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        maxWidth: '400px',
        color: '#e0e0e0'
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={getStyle(toast.type)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              {getIcon(toast.type)}
              <span style={{ fontSize: '14px' }}>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
                padding: '0',
                fontSize: '18px'
              }}
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default ToastContainer;
