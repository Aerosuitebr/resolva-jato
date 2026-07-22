import type { Metadata, Viewport } from 'next';
import { AppProviders } from '@/components/providers/app-providers';
import { getViralBaseUrl } from '@/lib/viral-loop';
import './globals.css';

const siteUrl = getViralBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Resolva Jato — Orçamento com Pix no WhatsApp',
    template: '%s | Resolva Jato'
  },
  description:
    'Mande o orçamento, o cliente aprova no celular e você cobra com Pix no WhatsApp. Também currículo, contrato e proposta — comece grátis.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Resolva Jato'
  },
  icons: {
    icon: '/favicon.svg'
  },
  openGraph: {
    title: 'Resolva Jato — Orçamento com Pix no WhatsApp',
    description: 'Cliente aprova no celular. Você recebe no Pix. Sem app, sem cartão.',
    locale: 'pt_BR',
    type: 'website',
    url: siteUrl,
    siteName: 'Resolva Jato'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resolva Jato — Orçamento com Pix no WhatsApp',
    description: 'Cliente aprova no celular. Você recebe no Pix.'
  },
  alternates: {
    canonical: '/'
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
