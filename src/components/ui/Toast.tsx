import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
  onUndo?: () => void;
}

export function Toast({ message, onDismiss, onUndo }: ToastProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 mb-5 rounded-xl bg-brand-mint-pale border border-brand-mint text-sm font-medium"
      style={{ color: '#5A607F' }}
    >
      <CheckCircle size={16} className="flex-shrink-0 text-brand-navy" />
      <span>{message}</span>
      {onUndo && (
        <button
          onClick={() => { onUndo(); onDismiss(); }}
          className="ml-2 font-semibold underline hover:opacity-70 transition-opacity whitespace-nowrap"
        >
          Undo
        </button>
      )}
      <button
        onClick={onDismiss}
        className="ml-auto text-neutral-400 hover:text-neutral-600 transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
