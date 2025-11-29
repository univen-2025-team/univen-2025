'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';

interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

interface ToastContextValue {
    toasts: Toast[];
    showToast: (type: Toast['type'], message: string, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback(
        (type: Toast['type'], message: string, duration = 5000) => {
            const id = Math.random().toString(36).substring(7);
            const newToast: Toast = { id, type, message, duration };

            setToasts((prev) => [...prev, newToast]);

            if (duration > 0) {
                setTimeout(() => {
                    removeToast(id);
                }, duration);
            }
        },
        [removeToast]
    );

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

function ToastContainer({
    toasts,
    removeToast
}: {
    toasts: Toast[];
    removeToast: (id: string) => void;
}) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const styles = {
        success: 'bg-green-50 border-green-500 text-green-900',
        error: 'bg-red-50 border-red-500 text-red-900',
        warning: 'bg-yellow-50 border-yellow-500 text-yellow-900',
        info: 'bg-blue-50 border-blue-500 text-blue-900'
    };

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg animate-in slide-in-from-right ${
                styles[toast.type]
            }`}
        >
            <span className="text-xl font-bold flex-shrink-0">{icons[toast.type]}</span>
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
                onClick={onClose}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
                aria-label="Close"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
