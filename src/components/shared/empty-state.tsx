import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { Watermark } from '@/components/brand/watermark';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon: Icon = Inbox, action }: EmptyStateProps) {
  return (
    <div className="relative grid min-h-64 place-items-center overflow-hidden rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
      <Watermark className="absolute right-8 top-4 h-40 w-72" />
      <div className="relative z-10 flex max-w-md flex-col items-center gap-3">
        <Icon className="h-12 w-12 text-slate-300" />
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {description ? <p className="text-sm leading-6 text-slate-500">{description}</p> : null}
        {action}
      </div>
    </div>
  );
}
