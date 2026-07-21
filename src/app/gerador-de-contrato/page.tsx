import type { Metadata } from 'next';
import { ContratoPreview } from '@/components/contratos/contrato-preview';
import { ToolLandingPage } from '@/components/marketing/tool-landing/tool-landing-page';
import { buildDefaultClauses } from '@/lib/contratos/clauses';
import { SAMPLE_CONTRATO } from '@/lib/contratos/defaults';
import { contratosSeoContent } from '@/lib/seo-pages/contratos';
import { ContratoLivePreview } from './contrato-live-preview';

const SITE_URL = 'https://resolvajato.com.br';

export const metadata: Metadata = {
  title: contratosSeoContent.seo.metaTitle,
  description: contratosSeoContent.seo.metaDescription,
  keywords: contratosSeoContent.seo.keywords,
  alternates: {
    canonical: `${SITE_URL}/${contratosSeoContent.slug}`
  },
  openGraph: {
    title: contratosSeoContent.seo.metaTitle,
    description: contratosSeoContent.seo.metaDescription,
    url: `${SITE_URL}/${contratosSeoContent.slug}`,
    siteName: 'Resolva Jato',
    locale: 'pt_BR',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: contratosSeoContent.seo.metaTitle,
    description: contratosSeoContent.seo.metaDescription
  }
};

function withTemplate(templateId: typeof SAMPLE_CONTRATO.templateId) {
  const base = { ...SAMPLE_CONTRATO, templateId };
  return { ...base, clauses: buildDefaultClauses(base) };
}

const examples = [
  {
    title: 'Prestação de serviços',
    description: 'Ideal para freelancers e agências formalizarem um trabalho com cliente.',
    href: contratosSeoContent.ctaHref,
    thumbnail: <ContratoPreview data={withTemplate('prestacao-servicos')} />
  },
  {
    title: 'Aluguel residencial',
    description: 'Contrato completo entre locador e locatário, com cláusulas de prazo e reajuste.',
    href: contratosSeoContent.ctaHref,
    thumbnail: <ContratoPreview data={withTemplate('aluguel-residencial')} />
  },
  {
    title: 'Comodato',
    description: 'Formalize o empréstimo gratuito de um bem, com prazo e condições de devolução.',
    href: contratosSeoContent.ctaHref,
    thumbnail: <ContratoPreview data={withTemplate('comodato')} />
  }
];

export default function GeradorDeContratoPage() {
  return (
    <ToolLandingPage
      content={contratosSeoContent}
      heroMockup={
        <div className="origin-top scale-[0.9] rounded-xl bg-white shadow-xl">
          <ContratoPreview data={SAMPLE_CONTRATO} />
        </div>
      }
      toolPreview={<ContratoLivePreview />}
      examples={examples}
    />
  );
}
