# SEO Landing Pages — Replication Task

Pilot done & approved: Currículo (`/gerador-de-curriculo`).
Now replicating pattern to remaining tools. All copy: grátis-primeiro, sem preço/plano em destaque.
Agenda: enfatizar qualidade/capricho do design da ferramenta (não é sobre plano pago), mantendo tom grátis.

## Pattern per tool
1. `src/lib/seo-pages/<tool>.ts` — SeoPageContent (h1, subtitle, benefits, steps, examples, faq, article, relatedTools, seo)
2. `src/app/<slug>/page.tsx` — metadata + ToolLandingPage + heroMockup + examples (using real Preview component)
3. `src/app/<slug>/<tool>-live-preview.tsx` — client interactive mini-preview + CTA

## Tools & slugs
- [ ] contratos -> /gerador-de-contrato
- [ ] juridicos -> /documentos-juridicos-online
- [ ] contabeis -> /documentos-contabeis-online
- [ ] recibos -> /gerador-de-recibo
- [ ] orcamentos -> /gerador-de-orcamento
- [ ] pix -> /cobranca-pix-qr-code
- [ ] propostas -> /gerador-de-proposta-comercial
- [ ] lattes -> /curriculo-lattes-online
- [ ] trabalhos -> /capa-de-trabalho-abnt
- [ ] agenda -> /agenda-online

## Notes
- Reuse real preview components (ContratoPreview, JuridicoPreview, etc.) with SAMPLE_ data.
- relatedTools cross-link between new pages + curriculo/lattes/trabalhos.
- After all done: tsc --noEmit, curl each route 200, commit + push to feat/seo-landing-curriculo (or new branch?), update sitemap.ts if it lists pages manually.
