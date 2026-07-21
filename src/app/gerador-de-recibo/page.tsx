import type { Metadata } from 'next';
import { ReciboPreview } from '@/components/recibos/recibo-preview';
import { ToolLandingPage } from '@/components/marketing/tool-landing/tool-landing-page';
import { SAMPLE_RECEIPT } from '@/lib/recibos/defaults';
import { recibosSeoContent } from '@/lib/seo-pages/recibos';
import { ReciboLivePreview } from './recibo-live-preview';

const SITE_URL = 'https://resolvajato.com.br';

export const metadata: Metadata = {
  title: recibosSeoContent.seo.metaTitle,
  description: recibosSeoContent.seo.metaDescription,
  keywords: recibosSeoContent.seo.keywords,
  alternates: {
    canonical: `${SITE_URL}/${recibosSeoContent.slug}`
  },
  openGraph: {
    title: recibosSeoContent.seo.metaTitle,
    description: recibosSeoContent.seo.metaDescription,
    url: `${SITE_URL}/${recibosSeoContent.slug}`,
    siteName: 'Resolva Jato',
    locale: 'pt_BR',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: recibosSeoContent.seo.metaTitle,
    description: recibosSeoContent.seo.metaDescription
  }
};

const examples = [
  {
    title: 'Modelo Profissional',
    description: 'Layout completo e formal, indicado para prestadores de serviço e autônomos.',
    href: recibosSeoContent.ctaHref,
    thumbnail: <ReciboPreview data={{ ...SAMPLE_RECEIPT, templateId: 'profissional' as const }} />
  },
  {
    title: 'Modelo Moderno',
    description: 'Visual mais leve e colorido, para negócios com identidade mais informal.',
    href: recibosSeoContent.ctaHref,
    thumbnail: <ReciboPreview data={{ ...SAMPLE_RECEIPT, templateId: 'moderno' as const }} />
  },
  {
    title: 'Modelo Compacto',
    description: 'Direto ao ponto, ideal para recibos rápidos do dia a dia.',
    href: recibosSeoContent.ctaHref,
    thumbnail: <ReciboPreview data={{ ...SAMPLE_RECEIPT, templateId: 'compacto' as const }} />
  }
];

export default function GeradorDeReciboPage() {
  return (
    <ToolLandingPage
      content={recibosSeoContent}
      heroMockup={
        <div className="origin-top scale-[0.9] rounded-xl bg-white shadow-xl">
          <ReciboPreview data={SAMPLE_RECEIPT} />
        </div>
      }
      toolPreview={<ReciboLivePreview />}
      examples={examples}
    />
  );
}
