'use client';

import { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColors = {
        success: 'rgba(101, 179, 173, 0.95)',
        error: 'rgba(239, 68, 68, 0.95)',
        info: 'rgba(26, 29, 36, 0.95)'
    };

    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };

    return (
        <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: bgColors[type],
            color: '#fff',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 9999,
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'all 0.3s ease'
        }}>
            <span style={{ fontSize: '1.2rem' }}>{icons[type]}</span>
            <span style={{ fontWeight: '500' }}>{message}</span>
        </div>
    );
}

// Hook for easier usage
export function useToast() {
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ message, type });
    };

    const closeToast = () => setToast(null);

    const ToastComponent = toast ? (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
    ) : null;

    return { showToast, ToastComponent };
}
