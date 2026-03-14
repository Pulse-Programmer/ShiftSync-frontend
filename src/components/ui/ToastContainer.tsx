import { X, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useToast, type Toast } from '../../contexts/ToastContext';

const icons: Record<Toast['type'], typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const colors: Record<Toast['type'], string> = {
  info: 'border-info/30 bg-info/10',
  success: 'border-success/30 bg-success/10',
  warning: 'border-warning/30 bg-warning/10',
  error: 'border-error/30 bg-error/10',
};

const iconColors: Record<Toast['type'], string> = {
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[60] space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3 rounded-xl border ${colors[toast.type]}
                       shadow-lg backdrop-blur-sm animate-in`}
          >
            <Icon size={16} className={`shrink-0 mt-0.5 ${iconColors[toast.type]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-text-secondary mt-0.5">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-0.5 rounded hover:bg-surface-hover text-text-secondary"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
