'use client';

import type { ReactNode } from 'react';
import { AuthRequiredProvider } from '@/components/auth/auth-required-provider';
import { MpSecurityScript } from '@/components/billing/mp-security-script';
import { ToastProvider } from '@/components/ui/toast';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <MpSecurityScript view="checkout" />
      <AuthRequiredProvider>{children}</AuthRequiredProvider>
    </ToastProvider>
  );
}
