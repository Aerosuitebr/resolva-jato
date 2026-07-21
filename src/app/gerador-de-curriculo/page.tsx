import type { Metadata } from 'next';
import { ResumePreview } from '@/components/curriculo/resume-preview';
import { ToolLandingPage } from '@/components/marketing/tool-landing/tool-landing-page';
import { SAMPLE_RESUME } from '@/lib/curriculo/defaults';
import { curriculoSeoContent } from '@/lib/seo-pages/curriculo';
import { CurriculoLivePreview } from './curriculo-live-preview';

const SITE_URL = 'https://resolvajato.com.br';

export const metadata: Metadata = {
  title: curriculoSeoContent.seo.metaTitle,
  description: curriculoSeoContent.seo.metaDescription,
  keywords: curriculoSeoContent.seo.keywords,
  alternates: {
    canonical: `${SITE_URL}/${curriculoSeoContent.slug}`
  },
  openGraph: {
    title: curriculoSeoContent.seo.metaTitle,
    description: curriculoSeoContent.seo.metaDescription,
    url: `${SITE_URL}/${curriculoSeoContent.slug}`,
    siteName: 'Resolva Jato',
    locale: 'pt_BR',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: curriculoSeoContent.seo.metaTitle,
    description: curriculoSeoContent.seo.metaDescription
  }
};

const examples = [
  {
    title: 'Modelo Profissional',
    description: 'Layout clássico e elegante, ideal para vagas corporativas e cargos de gestão.',
    href: curriculoSeoContent.ctaHref,
    thumbnail: (
      <ResumePreview data={{ ...SAMPLE_RESUME, templateId: 'professional' as const }} />
    )
  },
  {
    title: 'Modelo Moderno',
    description: 'Visual contemporâneo com destaque lateral em azul, indicado para marketing, tech e criativos.',
    href: curriculoSeoContent.ctaHref,
    thumbnail: <ResumePreview data={{ ...SAMPLE_RESUME, templateId: 'modern' as const }} />
  },
  {
    title: 'Modelo Universitário',
    description: 'Perfeito para estágios, primeiro emprego e programas acadêmicos.',
    href: curriculoSeoContent.ctaHref,
    thumbnail: <ResumePreview data={{ ...SAMPLE_RESUME, templateId: 'academic' as const }} />
  }
];

export default function GeradorDeCurriculoPage() {
  return (
    <ToolLandingPage
      content={curriculoSeoContent}
      heroMockup={
        <div className="origin-top scale-[0.9] rounded-xl bg-white shadow-xl">
          <ResumePreview data={SAMPLE_RESUME} />
        </div>
      }
      toolPreview={<CurriculoLivePreview />}
      examples={examples}
    />
  );
}
