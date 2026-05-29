'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

interface ToastContextType {
  addToast: (message: string, type?: 'info' | 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const addToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {isMounted && typeof window !== 'undefined' && createPortal(
        <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none max-w-sm w-full">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-5 bg-white border shadow-2xl pointer-events-auto transition-all duration-500 animate-in slide-in-from-right-full ${
                toast.type === 'error' ? 'border-red-200' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-1 h-4 mt-1 ${
                  toast.type === 'error' ? 'bg-red-600' : 
                  toast.type === 'success' ? 'bg-emerald-600' : 'bg-black'
                }`} />
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400 mb-1">{toast.type}</p>
                  <p className="text-xs text-black font-serif italic">{toast.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
