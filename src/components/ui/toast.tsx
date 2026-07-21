'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastItem {
  id: string;
  message: string;
  undoLabel?: string;
  onUndo?: () => void;
}

interface ToastOptions {
  undoLabel?: string;
  onUndo?: () => void;
  durationMs?: number;
}

interface ToastContextValue {
  toast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = crypto.randomUUID();
      setItems((current) => [
        ...current,
        {
          id,
          message,
          undoLabel: options?.undoLabel,
          onUndo: options?.onUndo
        }
      ]);
      window.setTimeout(() => dismiss(id), options?.durationMs ?? (options?.onUndo ? 7000 : 4500));
    },
    [dismiss]
  );

  useEffect(() => {
    function onBillableSuccess(event: Event) {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      if (detail?.message) toast(detail.message);
    }
    window.addEventListener('rj-billable-success', onBillableSuccess);
    return () => window.removeEventListener('rj-billable-success', onBillableSuccess);
  }, [toast]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[300] flex justify-center px-4 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:justify-end"
        aria-live="polite"
        aria-relevant="additions"
      >
        <div className="flex w-full max-w-md flex-col gap-2 sm:w-[min(100vw-2rem,24rem)]">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3.5',
                'shadow-[0_18px_40px_rgba(15,23,42,0.18)] rj-toast-in'
              )}
              role="status"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-5 text-emerald-950">{item.message}</p>
                {item.onUndo ? (
                  <button
                    type="button"
                    className="mt-2 text-xs font-bold uppercase tracking-wide text-emerald-800 underline-offset-2 hover:underline"
                    onClick={() => {
                      item.onUndo?.();
                      dismiss(item.id);
                    }}
                  >
                    {item.undoLabel || 'Desfazer'}
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-emerald-700/70 hover:bg-emerald-100 hover:text-emerald-950"
                onClick={() => dismiss(item.id)}
                aria-label="Fechar confirmação"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: (message: string) => {
        if (typeof window !== 'undefined') window.alert(message);
      }
    };
  }
  return ctx;
}
