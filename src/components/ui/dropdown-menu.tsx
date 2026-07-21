import type { ReactNode } from 'react';

export interface DropdownMenuProps {
  children: ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  return <>{children}</>;
}
