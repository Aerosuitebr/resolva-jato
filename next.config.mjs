/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API routes + /orcamento/[id] precisam de server runtime (Supabase/Prisma).
  // Export estático impede rotas dinâmicas e route handlers.
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // pdfjs-dist referencia "canvas"/"encoding" (uso Node-only) que não existem neste app.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      encoding: false,
    };
    return config;
  },
};

export default nextConfig;
