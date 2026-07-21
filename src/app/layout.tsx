import type { Metadata, Viewport } from 'next';
import { AppProviders } from '@/components/providers/app-providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Resolva Jato',
  description: 'Recursos gratuitos, ferramentas profissionais e plano Premium por R$ 4,99/mês',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Resolva Jato'
  },
  icons: {
    icon: '/favicon.svg'
  }
};

export const viewport: Viewport = {
  themeColor: '#0c4a6e'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
