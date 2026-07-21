# SEO Tool Landing Pages — task.md

## Objetivo
Implementar spec em /home/user/spec.txt (extraído do PDF do usuário): páginas públicas
de SEO/conversão por ferramenta (ex: /gerador-de-curriculo), separadas de /ferramentas/*
(que exige login). Template reutilizável + conteúdo por ferramenta.

## Decisões (assumidas, sem resposta do usuário por bug no ask_questions)
- Piloto: Currículo primeiro. Depois replicar pra outras.
- Ferramenta embutida na landing = preview leve (nome + cargo) com preview real do
  ResumePreview, CTA principal -> /cadastro?next=/ferramentas/curriculo (não reescrevi
  o RequireAuth/AuthGate).
- Prova social: reaproveitar TestimonialsSection + TrustSeals já existentes na home
  (não inventar números tipo "250k documentos").
- Exemplos/miniaturas: renderizar ResumePreview real em miniatura (scale), não imagens
  fake (não existem screenshots em /public).
- Validar local com dev server antes de replicar pras outras ferramentas.

## Estrutura criada
- src/lib/seo-pages/types.ts — tipos do conteúdo da landing
- src/lib/seo-pages/curriculo.ts — conteúdo copy da página de currículo (TODO)
- src/components/marketing/tool-landing/
  - hero.tsx ✅
  - benefits-grid.tsx ✅
  - how-it-works.tsx ✅
  - examples-grid.tsx ✅ (usa thumbnail ReactNode em vez de imagem)
  - faq-section.tsx ✅ (accordion client)
  - article-section.tsx ✅ (sem plugin typography, estilizado manual)
  - share-buttons.tsx ✅ (whatsapp/linkedin/facebook/email/copiar link)
  - related-tools.tsx (TODO)
  - json-ld.tsx (TODO — FAQ, Breadcrumb, SoftwareApplication, Organization, WebPage)
  - tool-landing-page.tsx (TODO — composição final)
- src/app/gerador-de-curriculo/page.tsx (TODO — rota pública + metadata + JSON-LD)
- src/app/gerador-de-curriculo/curriculo-live-preview.tsx (TODO — client, preview interativo)
- sitemap.ts / robots.ts na raiz de src/app (TODO — não existiam antes)

## Status: piloto Currículo CONCLUÍDO e validado localmente ✅
- Todos os componentes de tool-landing/* criados, incluindo tool-embed.tsx (seção
  "Área da Ferramenta" separada do hero, conforme spec item 5).
- curriculo-live-preview.tsx: form (nome, cargo, modelo) + ResumePreview em tempo real.
- curriculo.ts: copy completo (hero, benefícios, steps, FAQ, artigo ~800 palavras,
  related tools reais do catálogo, SEO meta).
- page.tsx em src/app/gerador-de-curriculo/ com metadata (title/description/keywords/
  OG/canonical) + 3 thumbnails reais (professional/modern/academic).
- sitemap.ts e robots.ts criados na raiz de src/app.
- tsc --noEmit limpo. next dev testado: página 200 OK, H1/meta corretos, JSON-LD com
  5 blocos (WebPage, BreadcrumbList, SoftwareApplication, Organization, FAQPage),
  screenshots de toda a página revisados visualmente (hero, benefícios, como funciona,
  ferramenta interativa, exemplos, testimonials, FAQ, artigo, share, related, footer
  com logo) — tudo ok. Corrigido bug de alinhamento das miniaturas em examples-grid.tsx
  (items-start em vez de items-center).

## Próximos passos
1. Mostrar pro usuário / pedir aprovação do piloto Currículo.
2. Depois de aprovado: replicar template pras outras ferramentas do catálogo
   (contratos, recibos, orcamentos, pix, propostas, curriculo-lattes, trabalhos,
   agenda, juridicos, contabeis) — confirmar lista/prioridade com o usuário.
3. Considerar adicionar metadataBase no layout raiz para simplificar URLs absolutas.

## Notas técnicas do repo
- Next.js 14 app router, Prisma, Tailwind (sem plugin typography).
- /ferramentas/* fica dentro de src/app/(app)/ferramentas, com RequireAuth.
- /cadastro e /login aceitam ?next=/caminho pra redirecionar após auth.
- Design tokens: rj-display (font Sora), cores sky/slate, --rj-hero-* gradient já usado
  na home. Reaproveitar SiteHeader/SiteFooter/TestimonialsSection/TrustSeals.
- tools-catalog.ts tem a lista de ferramentas/hrefs pra "related tools" e pra escalar
  o template depois.
