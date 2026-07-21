'use client';

import type { ReactNode } from 'react';
import { ToolsBackButton } from '@/components/shared/tools-back-button';
import { cn } from '@/lib/utils';

interface DocumentStickyActionsProps {
  children: ReactNode;
  className?: string;
  /** Inclui botão Voltar → /ferramentas (padrão: true). */
  showBack?: boolean;
}

/** Barra sticky no início da área de trabalho (logo acima do formulário/preview). */
export function DocumentStickyActions({
  children,
  className,
  showBack = true
}: DocumentStickyActionsProps) {
  return (
    <div
      className={cn(
        'sticky top-[var(--rj-chrome-top)] z-40 -mx-1 mb-1 rounded-2xl border border-slate-200/90 bg-white/95 px-3 py-2.5 shadow-md shadow-slate-900/5 backdrop-blur-xl sm:mx-0 sm:px-4',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {showBack ? <ToolsBackButton className="ml-auto" /> : null}
      </div>
    </div>
  );
}
