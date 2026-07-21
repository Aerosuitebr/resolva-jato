import type { SeoPageContent } from '@/lib/seo-pages/types';

const SITE_URL = 'https://resolvajato.com.br';
const ORG_LOGO = `${SITE_URL}/favicon.svg`;

export function ToolLandingJsonLd({ content }: { content: SeoPageContent }) {
  const pageUrl = `${SITE_URL}/${content.slug}`;

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: content.seo.metaTitle,
    description: content.seo.metaDescription,
    url: pageUrl,
    inLanguage: 'pt-BR',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Resolva Jato',
      url: SITE_URL
    }
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Ferramentas', item: `${SITE_URL}/ferramentas` },
      { '@type': 'ListItem', position: 3, name: content.seo.breadcrumbLabel, item: pageUrl }
    ]
  };

  const softwareApplication = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `Resolva Jato — ${content.toolName}`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: pageUrl,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL'
    }
  };

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Resolva Jato',
    url: SITE_URL,
    logo: ORG_LOGO
  };

  const faqPage =
    content.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: content.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer
            }
          }))
        }
      : null;

  const blocks = [webPage, breadcrumb, softwareApplication, organization, faqPage].filter(Boolean);

  return (
    <>
      {blocks.map((block, index) => (
        // eslint-disable-next-line react/no-danger
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
