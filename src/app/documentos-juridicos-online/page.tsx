import type { Metadata } from 'next';
import { JuridicoPreview } from '@/components/juridicos/juridico-preview';
import { ToolLandingPage } from '@/components/marketing/tool-landing/tool-landing-page';
import { buildDefaultClauses } from '@/lib/juridicos/clauses';
import { SAMPLE_LEGAL_DOCUMENT } from '@/lib/juridicos/defaults';
import { juridicosSeoContent } from '@/lib/seo-pages/juridicos';
import { JuridicoLivePreview } from './juridico-live-preview';

const SITE_URL = 'https://resolvajato.com.br';

export const metadata: Metadata = {
  title: juridicosSeoContent.seo.metaTitle,
  description: juridicosSeoContent.seo.metaDescription,
  keywords: juridicosSeoContent.seo.keywords,
  alternates: {
    canonical: `${SITE_URL}/${juridicosSeoContent.slug}`
  },
  openGraph: {
    title: juridicosSeoContent.seo.metaTitle,
    description: juridicosSeoContent.seo.metaDescription,
    url: `${SITE_URL}/${juridicosSeoContent.slug}`,
    siteName: 'Resolva Jato',
    locale: 'pt_BR',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: juridicosSeoContent.seo.metaTitle,
    description: juridicosSeoContent.seo.metaDescription
  }
};

function withTemplate(templateId: typeof SAMPLE_LEGAL_DOCUMENT.templateId) {
  const base = { ...SAMPLE_LEGAL_DOCUMENT, templateId };
  return { ...base, clauses: buildDefaultClauses(base) };
}

const examples = [
  {
    title: 'Procuração ad judicia',
    description: 'Outorga poderes ao advogado para atuar em juízo em nome do cliente.',
    href: juridicosSeoContent.ctaHref,
    thumbnail: <JuridicoPreview data={withTemplate('procuracao')} />
  },
  {
    title: 'Contrato de honorários',
    description: 'Formaliza o mandato e a forma de remuneração — fixo, êxito ou misto.',
    href: juridicosSeoContent.ctaHref,
    thumbnail: <JuridicoPreview data={withTemplate('honorarios')} />
  },
  {
    title: 'Notificação extrajudicial',
    description: 'Comunica formalmente a outra parte antes de uma medida judicial.',
    href: juridicosSeoContent.ctaHref,
    thumbnail: <JuridicoPreview data={withTemplate('notificacao')} />
  }
];

export default function DocumentosJuridicosPage() {
  return (
    <ToolLandingPage
      content={juridicosSeoContent}
      heroMockup={
        <div className="origin-top scale-[0.9] rounded-xl bg-white shadow-xl">
          <JuridicoPreview data={SAMPLE_LEGAL_DOCUMENT} />
        </div>
      }
      toolPreview={<JuridicoLivePreview />}
      examples={examples}
    />
  );
}
