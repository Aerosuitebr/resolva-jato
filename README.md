# RJ Resolva Jato

Aplicacao Next.js para layout, identidade visual e estrutura de componentes reutilizaveis do RJ Resolva Jato, uma plataforma de gestao para manutencao de jatos executivos.

## Como rodar

```bash
npm install
npm run dev
```

Depois acesse `http://localhost:3000`.

Para abrir a versao estatica validada:

```bash
npm run build
npm start
```

Depois acesse `http://localhost:5173`.

No Windows, tambem pode executar `abrir-rj-resolva-jato.cmd`.

## Estrutura

- `src/app`: rotas do Next App Router, incluindo dashboard, login, propostas e ordens de servico.
- `src/components/layout`: AppShell, sidebar, busca de modulos, usuario, banner e footer.
- `src/components/shared`: componentes reutilizaveis de pagina, filtros, tabela, status, acoes, empty state e KPIs.
- `src/components/ui`: componentes base no padrao shadcn/ui usados pela interface.
- `src/components/brand`: logo, icone e watermark SVG inline.
- `src/lib`: dados mock, tipos, menu e helpers.
- `src/hooks`: estado de collapse da sidebar e rota ativa.

## Componentes principais

- `PageHero`: `title`, `subtitle`, `icon`, `actions`.
- `SearchFilterBar`: `searchValue`, `onSearchChange`, `statusFilter`, `onStatusChange`, `statusOptions`, `metadata`, `placeholder`.
- `DataTable`: `columns`, `data`, `totalRecords`, `page`, `pageSize`.
- `StatusBadge`: `status`.
- `ActionIconButton`: `icon`, `label`, `onClick`, `variant`.
- `KpiCard`: `item`.

## Proximos passos

- Conectar autenticacao real.
- Integrar API/backend.
- Adicionar i18n.
- Expandir modulos de estoque, cadastros e oficina.
- Substituir mocks por dados persistidos.
