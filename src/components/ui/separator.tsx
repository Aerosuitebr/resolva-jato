import { cn } from '@/lib/utils';

export interface SeparatorProps {
  className?: string;
}

export function Separator({ className }: SeparatorProps) {
  return <div className={cn('h-px w-full bg-slate-200', className)} />;
}
