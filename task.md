# Novas ferramentas — Resolva Jato (branch master)

Notificação Extrajudicial: JÁ EXISTE dentro de "Documentos Jurídicos" (templateId `notificacao`). Não precisa criar nova.

## A construir
1. [ ] Calculadora de Rescisão Trabalhista — /ferramentas/rescisao — categoria juridico
2. [ ] Simulador MEI vs CLT — /ferramentas/mei-vs-clt — categoria contabeis
3. [ ] Calculadora de Precificação — /ferramentas/precificacao — categoria negocios
4. [ ] Corretor de Redação ENEM (heurístico, sem IA externa) — /ferramentas/redacao-enem — categoria carreira
5. [ ] Gerador de Cronograma de Estudos — /ferramentas/cronograma-estudos — categoria carreira
6. [ ] Divisor de Conta em Grupo — /ferramentas/divisor-conta — categoria organizacao

## Padrão a seguir (visto em pix-app.tsx)
- page.tsx só importa e renderiza o componente
- Componente 'use client' em src/components/<dominio>/<slug>-app.tsx
- Usa AuthGate, PageHero (opcional, pix não usa, mas outras usam), ToolsBackButton, ToolsWatermark, Button, FormField, Input, Select, useToast, cn
- Adicionar entrada em src/lib/tools-catalog.ts (toolsCatalog array) com icon do lucide-react
- Sem PDF/billing nessas novas (calculadoras client-side, foco em compartilhamento)
- Cada resultado deve ter botão "Copiar resultado" / compartilhar WhatsApp pra viralização

## Depois
- bun run build (ou next build) pra validar
- commit + push na branch master
- avisar usuário que precisa disparar o deploy (workflow_dispatch) — ele disse "guarde para os próximos" então perguntar se dispara agora
