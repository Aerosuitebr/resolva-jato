import type { Metadata } from 'next';
import { ContabilPreview } from '@/components/contabeis/contabil-preview';
import { ToolLandingPage } from '@/components/marketing/tool-landing/tool-landing-page';
import { buildDefaultClauses } from '@/lib/contabeis/clauses';
import { SAMPLE_CONTABIL_DOCUMENT } from '@/lib/contabeis/defaults';
import { contabeisSeoContent } from '@/lib/seo-pages/contabeis';
import { ContabilLivePreview } from './contabil-live-preview';

const SITE_URL = 'https://resolvajato.com.br';

export const metadata: Metadata = {
  title: contabeisSeoContent.seo.metaTitle,
  description: contabeisSeoContent.seo.metaDescription,
  keywords: contabeisSeoContent.seo.keywords,
  alternates: {
    canonical: `${SITE_URL}/${contabeisSeoContent.slug}`
  },
  openGraph: {
    title: contabeisSeoContent.seo.metaTitle,
    description: contabeisSeoContent.seo.metaDescription,
    url: `${SITE_URL}/${contabeisSeoContent.slug}`,
    siteName: 'Resolva Jato',
    locale: 'pt_BR',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: contabeisSeoContent.seo.metaTitle,
    description: contabeisSeoContent.seo.metaDescription
  }
};

function withTemplate(templateId: typeof SAMPLE_CONTABIL_DOCUMENT.templateId) {
  const base = { ...SAMPLE_CONTABIL_DOCUMENT, templateId };
  return { ...base, clauses: buildDefaultClauses(base) };
}

const examples = [
  {
    title: 'Contrato de serviços contábeis',
    description: 'Formaliza escrituração, apuração de impostos e obrigações acessórias mensais.',
    href: contabeisSeoContent.ctaHref,
    thumbnail: <ContabilPreview data={withTemplate('servicos-contabeis')} />
  },
  {
    title: 'Procuração (contador / despachante)',
    description: 'Outorga poderes ao profissional para representar o cliente em órgãos e portais.',
    href: contabeisSeoContent.ctaHref,
    thumbnail: <ContabilPreview data={withTemplate('procuracao-profissional')} />
  },
  {
    title: 'Autorização e-CAC / gov.br',
    description: 'Autoriza acesso a serviços digitais da Receita Federal em nome do cliente.',
    href: contabeisSeoContent.ctaHref,
    thumbnail: <ContabilPreview data={withTemplate('autorizacao-ecac')} />
  }
];

export default function DocumentosContabeisPage() {
  return (
    <ToolLandingPage
      content={contabeisSeoContent}
      heroMockup={
        <div className="origin-top scale-[0.9] rounded-xl bg-white shadow-xl">
          <ContabilPreview data={SAMPLE_CONTABIL_DOCUMENT} />
        </div>
      }
      toolPreview={<ContabilLivePreview />}
      examples={examples}
    />
  );
}
