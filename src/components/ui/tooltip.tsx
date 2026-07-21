'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}

/** Tooltip escuro de alto contraste — aparece no hover/foco. */
export function Tooltip({ label, children, side = 'top', className }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const timeout = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current) window.clearTimeout(timeout.current);
    };
  }, []);

  function show() {
    if (timeout.current) window.clearTimeout(timeout.current);
    setOpen(true);
  }

  function hide() {
    if (timeout.current) window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => setOpen(false), 80);
  }

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <span aria-describedby={open ? id : undefined}>{children}</span>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className={cn(
            'pointer-events-none absolute left-1/2 z-50 w-max max-w-[16rem] -translate-x-1/2 rounded-lg',
            'bg-slate-900 px-2.5 py-1.5 text-center text-[11px] font-semibold leading-4 text-white shadow-lg',
            side === 'top' ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]'
          )}
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}
