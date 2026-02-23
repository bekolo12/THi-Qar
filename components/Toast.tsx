import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage, ToastType } from '../types';

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getColors = (type: ToastType) => {
    switch (type) {
      case 'success': return 'bg-green-500 text-white';
      case 'error': return 'bg-red-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 ${getColors(toast.type)} px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 flex items-center gap-3 z-50 animate-fade-in-up`}>
      {getIcon(toast.type)}
      <span className="font-medium">{toast.message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;