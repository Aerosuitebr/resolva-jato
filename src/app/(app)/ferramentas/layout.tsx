import type { ReactNode } from 'react';
import { RequireAuth } from '@/components/auth/require-auth';
import { ToolsHomeButton } from '@/components/layout/tools-home-button';

export default function FerramentasLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <ToolsHomeButton />
      {children}
    </RequireAuth>
  );
}
