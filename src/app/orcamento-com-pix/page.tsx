import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/marketing/seo-landing-page';
import { SEO_LANDINGS } from '@/lib/seo/landing-content';
import { getViralBaseUrl } from '@/lib/viral-loop';

const content = SEO_LANDINGS['orcamento-com-pix'];

export const metadata: Metadata = {
  title: content.title,
  description: content.description,
  alternates: { canonical: content.path },
  openGraph: {
    title: content.title,
    description: content.description,
    url: `${getViralBaseUrl()}${content.path}`,
    type: 'website',
    locale: 'pt_BR'
  }
};

export default function OrcamentoComPixPage() {
  return <SeoLandingPage content={content} />;
}
