'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolsBackButtonProps {
  className?: string;
  size?: 'default' | 'sm' | 'lg';
}

/** Volta para a grade de ferramentas (/ferramentas). */
export function ToolsBackButton({ className, size = 'sm' }: ToolsBackButtonProps) {
  return (
    <Link
      href="/ferramentas"
      aria-label="Voltar para ferramentas"
      className={cn(
        'rj-press inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition-all duration-150',
        'hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2',
        size === 'default' && 'min-h-11 h-11 px-4 text-sm',
        size === 'sm' && 'min-h-10 h-10 px-3 text-xs',
        size === 'lg' && 'min-h-12 h-12 px-6 text-base',
        className
      )}
    >
      <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
      Voltar
    </Link>
  );
}
