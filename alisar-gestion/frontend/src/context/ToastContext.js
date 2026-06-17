import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timerRefs = useRef({});

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type };

    setToasts(prev => [...prev, toast]);

    if (duration) {
      const timerId = setTimeout(() => {
        removeToast(id);
        delete timerRefs.current[id];
      }, duration || 3000);
      timerRefs.current[id] = timerId;
    }

    return id;
  }, [removeToast]);

  const showSuccess = useCallback((message) => {
    return addToast(message, 'success');
  }, [addToast]);

  const showError = useCallback((message) => {
    return addToast(message, 'error', 4000);
  }, [addToast]);

  const showWarning = useCallback((message) => {
    return addToast(message, 'warning', 3000);
  }, [addToast]);

  const showInfo = useCallback((message) => {
    return addToast(message, 'info');
  }, [addToast]);

  useEffect(() => {
    return () => { Object.values(timerRefs.current).forEach(clearTimeout); };
  }, []);

  const value = {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
};
