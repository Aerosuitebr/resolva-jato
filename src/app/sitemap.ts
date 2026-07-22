import type { MetadataRoute } from 'next';
import { listSeoLandings } from '@/lib/seo/landing-content';
import { getViralBaseUrl } from '@/lib/viral-loop';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getViralBaseUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/busca`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/planos`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/cadastro`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 }
  ];

  const seoRoutes = listSeoLandings().map((page) => ({
    url: `${base}${page.path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: page.id === 'orcamento-com-pix' ? 0.95 : 0.8
  }));

  return [...staticRoutes, ...seoRoutes];
}
