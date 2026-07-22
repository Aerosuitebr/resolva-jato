import type { MetadataRoute } from 'next';
import { getViralBaseUrl } from '@/lib/viral-loop';

export default function robots(): MetadataRoute.Robots {
  const base = getViralBaseUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/conta', '/ferramentas/', '/oficina/', '/comercial/']
    },
    sitemap: `${base}/sitemap.xml`
  };
}
