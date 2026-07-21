import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SheetProps {
  open: boolean;
  children: ReactNode;
}

export function Sheet({ open, children }: SheetProps) {
  return <div className={cn(open ? 'block' : 'hidden')}>{children}</div>;
}
