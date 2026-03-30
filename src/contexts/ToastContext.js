import { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/toast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info',
    duration: 3000,
    position: 'top',
  });

  const showToast = useCallback(
    ({ message, type = 'info', duration = 3000, position = 'top' }) => {
      setToast({
        visible: true,
        message,
        type,
        duration,
        position,
      });
    },
    [],
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  // Convenience methods
  const success = useCallback(
    (message, duration) => {
      showToast({ message, type: 'success', duration });
    },
    [showToast],
  );

  const error = useCallback(
    (message, duration) => {
      showToast({ message, type: 'error', duration });
    },
    [showToast],
  );

  const warning = useCallback(
    (message, duration) => {
      showToast({ message, type: 'warning', duration });
    },
    [showToast],
  );

  const info = useCallback(
    (message, duration) => {
      showToast({ message, type: 'info', duration });
    },
    [showToast],
  );

  return (
    <ToastContext.Provider
      value={{
        showToast,
        hideToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        position={toast.position}
        onDismiss={hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
