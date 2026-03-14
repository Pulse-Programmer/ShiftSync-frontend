import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="text-center py-12">
      <AlertTriangle size={32} className="text-error/40 mx-auto mb-3" />
      <p className="text-sm text-text-secondary mb-3">
        {message ?? 'Something went wrong loading this data'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg
                     text-xs font-medium text-text-secondary hover:text-text hover:bg-surface-hover
                     transition-colors press-effect"
        >
          <RefreshCw size={12} />
          Retry
        </button>
      )}
    </div>
  );
}
