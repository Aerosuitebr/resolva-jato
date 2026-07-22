import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/marketing/seo-landing-page';
import { SEO_LANDINGS } from '@/lib/seo/landing-content';

const content = SEO_LANDINGS['para-freelancers'];

export const metadata: Metadata = {
  title: content.title,
  description: content.description,
  alternates: { canonical: content.path },
  openGraph: {
    title: content.title,
    description: content.description,
    type: 'website',
    locale: 'pt_BR'
  }
};

export default function ParaFreelancersPage() {
  return <SeoLandingPage content={content} />;
}
