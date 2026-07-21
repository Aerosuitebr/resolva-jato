import type { MetadataRoute } from 'next';

const SITE_URL = 'https://resolvajato.com.br';

/** Slugs das páginas públicas de SEO por ferramenta (fora de /ferramentas, que exige login). */
const seoToolSlugs: string[] = ['gerador-de-curriculo'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/cadastro`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 }
  ];

  const toolRoutes: MetadataRoute.Sitemap = seoToolSlugs.map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9
  }));

  return [...staticRoutes, ...toolRoutes];
}
