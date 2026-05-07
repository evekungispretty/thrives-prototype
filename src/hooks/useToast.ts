import { useState, useEffect, useCallback } from 'react';

interface ToastState {
  message: string;
  onUndo?: () => void;
  variant?: 'default' | 'delete';
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const show = useCallback((message: string, options?: { onUndo?: () => void; variant?: 'default' | 'delete' }) => {
    setToast({ message, ...options });
  }, []);

  const dismiss = useCallback(() => setToast(null), []);

  return { toast, show, dismiss };
}
