'use client';

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Ação principal / rodapé (ex.: botões Confirmar / Cancelar). */
  footer?: ReactNode;
  className?: string;
  size?: 'md' | 'lg' | 'xl';
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  size = 'lg'
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] transition-opacity"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)] sm:rounded-[28px]',
          size === 'md' && 'sm:max-w-lg',
          size === 'lg' && 'sm:max-w-3xl',
          size === 'xl' && 'sm:max-w-5xl',
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0 pr-2">
            <h2 id="modal-title" className="rj-display text-xl font-bold text-slate-900">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm font-medium leading-6 text-slate-600">{description}</p>
            ) : null}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar modal" className="shrink-0">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
