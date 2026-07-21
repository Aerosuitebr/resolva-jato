'use client';

import type { ReactNode } from 'react';
import { AuthRequiredProvider } from '@/components/auth/auth-required-provider';
import { ToastProvider } from '@/components/ui/toast';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthRequiredProvider>{children}</AuthRequiredProvider>
    </ToastProvider>
  );
}
