import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const STYLES: Record<ToastType, string> = {
  success: 'bg-success text-on-success',
  error: 'bg-error text-on-error',
  info: 'bg-on-surface text-surface',
  warning: 'bg-warning text-on-warning',
};

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 5000);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0"
        role="region"
        aria-label="Notificações"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          return (
            <div
              key={toast.id}
              role="status"
              className={`flex items-center gap-3 rounded py-1 pl-4 pr-1 shadow-flyout ${STYLES[toast.type]}`}
            >
              <Icon size={20} className="shrink-0" aria-hidden="true" />
              <p className="flex-1 text-body-medium">{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Fechar notificação"
                className="icon-button text-current hover:bg-surface/20"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
