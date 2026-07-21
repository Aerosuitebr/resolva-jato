import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Status } from '@/lib/types';

interface StatusBadgeProps {
  status: Status;
}

const statusMap: Record<Status, { label: string; className: string }> = {
  aprovada: { label: 'Aprovada', className: 'bg-[var(--rj-success-bg)] text-[var(--rj-success)]' },
  rascunho: { label: 'Rascunho', className: 'bg-[var(--rj-draft-bg)] text-[var(--rj-draft)]' },
  em_analise: { label: 'Em analise', className: 'bg-[var(--rj-warning-bg)] text-[var(--rj-warning)]' },
  cancelada: { label: 'Cancelada', className: 'bg-[var(--rj-danger-bg)] text-[var(--rj-danger)]' }
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const item = statusMap[status];
  return <Badge className={cn('rounded-full px-2.5 py-1 text-[0.75rem] font-semibold', item.className)}>{item.label}</Badge>;
}
