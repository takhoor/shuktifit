import { create } from 'zustand';
import { useEffect } from 'react';

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'pr';
}

interface ToastState {
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: number) => void;
}

let nextId = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function toast(message: string, type?: ToastMessage['type']) {
  useToastStore.getState().addToast(message, type);
}

const typeStyles: Record<ToastMessage['type'], string> = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-bg-elevated border border-border',
  pr: 'bg-yellow-600',
};

const typeIcons: Record<ToastMessage['type'], string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  pr: '🏆',
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-12 left-0 right-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg ${typeStyles[t.type]} text-text-primary text-sm font-medium animate-fade-in`}
      onClick={onDismiss}
    >
      <span>{typeIcons[t.type]}</span>
      <span>{t.message}</span>
    </div>
  );
}
