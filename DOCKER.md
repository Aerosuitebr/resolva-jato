# Produção Docker — Resolva Jato

Stack: **Next.js + PostgreSQL + Caddy (HTTPS) + Evolution/WhatsApp**.

## Pré-requisitos

- Docker Engine + Docker Compose v2
- DNS de `resolvajato.com.br` (ou o valor de `DOMAIN`) apontando para o IP do VPS
- Portas **80** e **443** livres no host

## Subir

```bash
cp .env.production.example .env
# Edite .env: POSTGRES_PASSWORD, EVOLUTION_API_KEY, Mercado Pago produção, etc.

docker compose up -d --build
# ou: npm run docker:up
```

Aguarde o healthcheck do `app`. Certificado TLS é emitido automaticamente pelo Caddy.

## WhatsApp (Evolution)

1. Evolution fica só em `127.0.0.1:18083` no host (não na internet).
2. No servidor:

```bash
# .env com EVOLUTION_API_URL=http://127.0.0.1:18083 para o script no host
npm run whatsapp:setup
```

3. Escaneie o QR em **Minha conta** (ou via API de status).

O container `app` fala com a Evolution em `http://rj-evolution-api:8080` (rede Docker).

## Comandos úteis

| Comando | Ação |
|---------|------|
| `npm run docker:up` | Build + sobe em background |
| `npm run docker:down` | Para a stack |
| `npm run docker:logs` | Logs do app |
| `docker compose logs -f caddy` | Logs TLS / proxy |
| `docker compose ps` | Status dos serviços |

## Auth antifraude

No `.env` / `.env.production` do VPS:

```bash
# Sessão
openssl rand -hex 32   # cole em AUTH_SECRET=

# Turnstile (Cloudflare Dashboard → Turnstile → Add site)
TURNSTILE_SECRET_KEY=...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
```

O `prisma db push` no entrypoint cria as tabelas de User, usage, audit, blacklist, etc.

Contas antigas só em localStorage **não** migram — o usuário precisa cadastrar de novo e confirmar e-mail.

Deploy incremental após editar o `.env.production` no servidor (sem `-SkipEnv` na primeira vez com as novas vars):

```powershell
powershell -File scripts\deploy\setup-vultr-resolvajato.ps1
```

## Mercado Pago

Webhook de produção:

`https://resolvajato.com.br/api/webhooks/mercadopago`

Use credenciais de **produção** no `.env`.

## Dev local (WhatsApp só)

O arquivo `docker-compose.whatsapp.yml` continua válido para desenvolvimento:

```bash
npm run whatsapp:up
```

## Vultr (mesmo VPS do Aerosuite)

No Vultr **não** usamos Caddy (80/443). O padrão é o do Aerosuite: app só em localhost + Cloudflare Tunnel.

```powershell
cd D:\Desenvolvimento\hub-recursos-gratis
powershell -File scripts\deploy\setup-vultr-resolvajato.ps1
```

- Código: `/opt/resolva-jato`
- App: `127.0.0.1:3000`
- Tunnel: serviço `cloudflared-resolvajato` (não mexe no tunnel do Aerosuite)
- Overlay: `docker-compose.vultr.yml`
- Doc no Aerosuite: `D:\Desenvolvimento\aerosuite\scripts\deploy\RESOLVA-JATO-VULTR.md`

Deploy incremental (sem reenviar .env / tunnel):

```powershell
powershell -File scripts\deploy\setup-vultr-resolvajato.ps1 -SkipEnv -SkipTunnel
```
