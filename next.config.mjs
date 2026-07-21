/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API routes + /orcamento/[id] precisam de server runtime (Supabase/Prisma).
  // Export estático impede rotas dinâmicas e route handlers.
  images: {
    unoptimized: true
  }
};

export default nextConfig;
