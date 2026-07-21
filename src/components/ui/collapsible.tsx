import type { ReactNode } from 'react';

export interface CollapsibleProps {
  open: boolean;
  children: ReactNode;
}

export function Collapsible({ children }: CollapsibleProps) {
  return <>{children}</>;
}

export function CollapsibleContent({ open, children }: CollapsibleProps) {
  return open ? <>{children}</> : null;
}
