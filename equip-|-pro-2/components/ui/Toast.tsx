import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-surfaceHighlight/90 backdrop-blur-xl border border-white/10 shadow-2xl animate-fade-in-up min-w-[300px] pointer-events-auto">
      {toast.type === 'success' ? (
        <CheckCircle size={20} className="text-success shrink-0" />
      ) : (
        <AlertCircle size={20} className="text-danger shrink-0" />
      )}
      <div className="flex-1">
        <p className="text-sm font-medium text-white leading-tight">{toast.message}</p>
      </div>
      <button 
        onClick={() => onClose(toast.id)} 
        className="p-1 -mr-1 text-text-tertiary hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
};
