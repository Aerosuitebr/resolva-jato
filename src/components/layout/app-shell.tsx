import type { ReactNode } from 'react';
import { TopEnvBanner } from './top-env-banner';
import { AppFooter } from './app-footer';
import { PremiumHeader } from './premium-header';
import { UsageBanner } from './usage-banner';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <TopEnvBanner />
      <main className="flex min-h-screen flex-col bg-[image:var(--rj-page-bg)] pt-8">
        <PremiumHeader />
        <UsageBanner />
        <div className="mx-auto w-full max-w-[1600px] flex-1 p-3 sm:p-5 lg:px-8 lg:py-7">{children}</div>
        <AppFooter />
      </main>
    </>
  );
}
