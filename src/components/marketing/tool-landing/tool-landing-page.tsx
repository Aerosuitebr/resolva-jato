import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { TestimonialsSection } from '@/components/marketing/testimonials-section';
import { TrustSeals } from '@/components/marketing/trust-seals';
import type { SeoPageContent } from '@/lib/seo-pages/types';
import { ToolLandingArticle } from './article-section';
import { ToolLandingBenefits } from './benefits-grid';
import type { ToolLandingExampleItem } from './examples-grid';
import { ToolLandingExamples } from './examples-grid';
import { ToolLandingFaq } from './faq-section';
import { ToolLandingHero } from './hero';
import { ToolLandingHowItWorks } from './how-it-works';
import { ToolLandingJsonLd } from './json-ld';
import { ToolLandingRelated } from './related-tools';
import { ToolLandingShare } from './share-buttons';
import { ToolLandingEmbed } from './tool-embed';

interface ToolLandingPageProps {
  content: SeoPageContent;
  /** Mockup estático/leve exibido no hero. */
  heroMockup: ReactNode;
  /** Área "Ferramenta" — preview interativo real, específico de cada ferramenta. */
  toolPreview: ReactNode;
  /** Miniaturas reais dos modelos (ex: ResumePreview em escala). */
  examples: ToolLandingExampleItem[];
}

export function ToolLandingPage({ content, heroMockup, toolPreview, examples }: ToolLandingPageProps) {
  return (
    <>
      <ToolLandingJsonLd content={content} />
      <SiteHeader />
      <main>
        <ToolLandingHero content={content} preview={heroMockup} />

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <TrustSeals />
        </section>

        <ToolLandingBenefits toolName={content.toolName} benefits={content.benefits} />
        <ToolLandingHowItWorks steps={content.steps} />
        <ToolLandingEmbed toolName={content.toolName} tool={toolPreview} />
        <ToolLandingExamples examples={examples} />
        <TestimonialsSection />
        <ToolLandingFaq faq={content.faq} />
        <ToolLandingArticle title={content.article.title} html={content.article.html} />

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <ToolLandingShare toolName={content.toolName} />
        </section>

        <ToolLandingRelated tools={content.relatedTools} />
      </main>
      <SiteFooter />
    </>
  );
}
