# Fila GSC · solicitar indexação (todas as landings SEO)

Fonte: `https://resolvajato.com.br/sitemap.xml` (~159 URLs).  
Índice por segmento (melhor visão no GSC): `https://resolvajato.com.br/sitemaps/index.xml`.  
Use a propriedade de **domínio** `resolvajato.com.br` (a de prefixo HTTPS é secundária).  
“Solicitar indexação” no GSC tem cota diária. Use os lotes abaixo.

## Já confirmados no Google

- [x] `/` · indexada
- [x] `/gerador-de-contrato` · indexada
- [x] `/gerador-de-recibo` · indexada

## Alerta · segurança (bloqueia indexação)

GSC · Problemas de segurança: **Páginas enganosas** (amostras N/D).  
Safe Browsing (27/jul): site marcado com paginas inseguras (engenharia social).

Em `/gerador-de-curriculo` (rastreio 25/jul):
- Canônica declarada pelo usuário: **nenhuma** (na época do crawl)
- Canônica escolhida pelo Google: `https://www.747live.bet/` (fora da propriedade)
- Teste live 30/jul: canônica correta, **é possível indexar**
- `/biblioteca` live OK e **já indexada**; `/para/mei` **já indexada**

Revisão GSC: formulário aberto; confirmar envio manual se o botão ainda disser SOLICITAR REVISÃO.

## Bing / Clarity

- Clarity no ar: ID `xsknm22mhw` carrega **depois** de Aceitar métricas
- Bing Webmaster: propriedade `resolvajato.com.br/` já verificada (`IsVerified: true`)
- Token `msvalidate.01`: `95E6ADBB3604C5BDD917DDC5ABEB308B` (via API GetUserSites → AuthenticationCode)
- Local: `BING_SITE_VERIFICATION` gravado no `.env`
- Produção: precisa do mesmo valor no `.env` do host + **rebuild** (build arg do Docker)
- Clarity no Bing: site já vinculado; falta só confirmar instalação no Clarity

## Status 30/jul · pós-deploy

- [x] Deploy SEO no ar (robots, sitemaps segmentados, JSON-LD)
- [x] IndexNow completo: **159 URLs** aceitas (HTTP 200)
- [x] Audit live das URLs pendentes do dia 1: 200 + canônica correta + sem spam
- [x] Enviar no GSC (domínio): `sitemap.xml` + `sitemaps/index.xml` (já processados; reenviados 01/ago)
- [x] Solicitar indexação do lote 1 (dia 1 restante + landings novas + autoridade) · 01/ago

## Diagnóstico 01/ago · por que não há cliques

Bloqueios técnicos encontrados (código corrigido na mesma data; **deploy feito**):

1. **`Disallow: /conta` bloqueava `/contato`** (prefix match do Google) — **confirmado no GSC live**: “Bloqueada pelo robots.txt”.
2. **Cloudflare cacheava `robots.txt` por 24h (`s-maxage=86400`)** — Googlebot via regra antiga mesmo após o fix; **Purge Everything** feito no CF.
3. **Cache próprio do Google do robots.txt** (até ~24h) — teste live de `/contato` ainda pode falhar até o Google refrescar; pedir indexação mesmo assim.
4. **Title/canonical streamados depois de `</head>`** — corrigido (metadata agora no head inicial).
5. **Safe Browsing** — GSC “Problemas de segurança”: **nenhum problema detectado** (01/ago).
6. IndexNow **não notifica o Google** — só Bing/parceiros.

## Dia 1 · prioridade comercial · 15 URLs

Arquivo: `gsc-fila-day1.txt`

1. `/` (feito · indexada)
2. `/gerador-de-contrato` (feito · indexada)
3. `/gerador-de-recibo` (feito · indexada)
4. `/gerador-de-curriculo` (feito · pedido 01/ago)
5. `/gerador-de-proposta-comercial` (feito · indexada)
6. `/calculadora-de-rescisao` (feito · indexada)
7. `/para/mei` (feito · indexada)
8. `/biblioteca` (feito · indexada)
9. `/orcamento-com-pix` (feito · indexada)
10. `/gerador-de-qr-code-pix` (feito · pedido 01/ago)
11. `/calculadora-de-ferias` (feito · pedido 01/ago)
12. `/calculadora-de-decimo-terceiro` (feito · pedido 01/ago)
13. `/calculadora-de-preco-freelancer` (feito · pedido 01/ago)
14. `/mei-ou-clt` (feito · pedido 01/ago)
15. `/assistente/documentos` (feito · pedido 01/ago)

### Lote 1 · feito (01/ago)

Arquivo: `gsc-fila-hoje-2026-08-01.txt`  
Pedidos feitos nas URLs que não estavam indexadas (landings novas + autoridade inclusas).

Sitemaps: `sitemap.xml` + `sitemaps/index.xml` · Processado.

### 04/ago · saúde do sitemap (curl)

- `/sitemap.xml` e `/sitemaps/index.xml` + 6 segmentos: **HTTP 200**
- Total: **152** URLs no sitemap completo
- Googlebot/Bingbot: 200 (sem 5xx)
- Ação: reenviar no GSC e confirmar **Sucesso** · guia `HOJE-2026-08-04-GSC.md`

### Colar no GSC agora · lote 2 (20 URLs)

Arquivo: `gsc-fila-lote2-2026-08-01.txt`  
`/para/*` + `/guias/*`. Se a cota acabar, pare e peça o lote 3 amanhã.

**Status 01/ago:** cota excedida no meio do lote 2.  
Pedidas até `guias/aviso-previo-proporcional-como-calcular` (e anteriores do lote).  
**Faltam 9** → arquivo `gsc-fila-amanha-2026-08-02.txt` (primeiro amanhã, antes do dia 3).

```
https://resolvajato.com.br/guias/quanto-cobrar-por-hora-freelancer
https://resolvajato.com.br/guias/custos-fixos-do-freelancer-como-ratear
https://resolvajato.com.br/guias/quando-o-mei-compensa-mais-que-a-clt
https://resolvajato.com.br/para/autonomos
https://resolvajato.com.br/para/empresas
https://resolvajato.com.br/para/rh
https://resolvajato.com.br/para/contadores
https://resolvajato.com.br/para/advogados
https://resolvajato.com.br/para/prestadores
```

Lista completa do lote 2 (referência):

```
https://resolvajato.com.br/para/freelancers
https://resolvajato.com.br/para/estudantes
https://resolvajato.com.br/guias/modelo-de-recibo-mei
https://resolvajato.com.br/guias/contrato-de-prestacao-de-servicos-gratis
https://resolvajato.com.br/guias/como-calcular-rescisao
https://resolvajato.com.br/guias/curriculo-pronto-para-baixar
https://resolvajato.com.br/guias/como-fazer-orcamento-com-pix
https://resolvajato.com.br/guias/proposta-comercial-para-mei
https://resolvajato.com.br/guias/como-precificar-servico-freelancer
https://resolvajato.com.br/guias/mei-ou-clt-como-comparar
https://resolvajato.com.br/guias/aviso-previo-proporcional-como-calcular
https://resolvajato.com.br/guias/quanto-cobrar-por-hora-freelancer
https://resolvajato.com.br/guias/custos-fixos-do-freelancer-como-ratear
https://resolvajato.com.br/guias/quando-o-mei-compensa-mais-que-a-clt
https://resolvajato.com.br/para/autonomos
https://resolvajato.com.br/para/empresas
https://resolvajato.com.br/para/rh
https://resolvajato.com.br/para/contadores
https://resolvajato.com.br/para/advogados
https://resolvajato.com.br/para/prestadores
```

## Dia 2 · segmentos e guias · 20 URLs

Arquivo: `gsc-fila-day2.txt` (mesmo conteúdo do lote 2 acima)

## Dia 3 · demais landings de ferramenta · ~19 URLs

Arquivo: `gsc-fila-day3.txt`

## Dias 4+ · restante do sitemap · ~95 URLs

Arquivo: `gsc-fila-rest.txt` (inclui EN/ES, games, institucionais)

## Como pedir no GSC

1. Abrir propriedade de **domínio**: https://search.google.com/search-console?resource_id=sc-domain%3Aresolvajato.com.br
2. Sitemaps → adicionar:
   - `https://resolvajato.com.br/sitemap.xml`
   - `https://resolvajato.com.br/sitemaps/index.xml`
3. Colar cada URL na barra “Inspecionar qualquer URL”
4. Se **não** estiver indexada: **Solicitar indexação**
5. Se já estiver indexada: pular (não gastar cota)
6. Parar quando o GSC avisar limite diário

## Cobertura automática (todas as ~159)

- Sitemap completo: `/sitemap.xml`
- Índice segmentado: `/sitemaps/index.xml` (core, tools, growth, guides, games, i18n)
- IndexNow no deploy lê o sitemap ao vivo (lote completo)
- Reenvio manual 30/jul: 159 URLs aceitas
