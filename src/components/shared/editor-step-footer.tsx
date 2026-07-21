'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditorStepFooterProps {
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  nextLabel?: string;
}

/** Rodapé de abas: volta / avança sem forçar scroll até o topo. */
export function EditorStepFooter({
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  nextLabel = 'Próximo passo'
}: EditorStepFooterProps) {
  if (!hasPrev && !hasNext) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
      {hasPrev ? (
        <Button type="button" variant="outline" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>
      ) : (
        <span />
      )}
      {hasNext ? (
        <Button type="button" onClick={onNext}>
          {nextLabel}
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
