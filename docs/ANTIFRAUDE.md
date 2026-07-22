# Antifraude — Fases 1 e 2

Defense in depth contra múltiplas contas para burlar o plano gratuito.

## Camadas ativas

1. **Confirmação de e-mail** — cadastro cria usuário sem usos; link Resend ativa e libera o pacote gratuito
2. **E-mails descartáveis** — lista local de domínios bloqueados no register
3. **Cloudflare Turnstile** — token validado no servidor
4. **Rate limit por IP** — cadastro 3/24h, login 10/15min, reenvio 5/h (Postgres)
5. **Cookie `rj_device`** — UUID 1 ano; ligado a contas no cadastro/login
6. **Risk score** — IP/device/UA/idioma/timezone/tela; cooldown ou blacklist
7. **Auditoria** — `audit_logs`
8. **Lista negra** — IP, e-mail, domínio, device

## Variáveis

| Var | Obrigatória | Uso |
|-----|-------------|-----|
| `AUTH_SECRET` | sim (prod) | Assina cookie `rj_session` |
| `RESEND_API_KEY` / `RESEND_FROM` | sim (prod) | E-mail de verificação |
| `TURNSTILE_SECRET_KEY` | sim (prod) | Validação captcha |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | sim (prod) | Widget (build-time) |
| `DATABASE_URL` | sim | Users + usage + security |

Em desenvolvimento, sem Turnstile o captcha é ignorado; sem Resend o link de verificação é logado no console do servidor.

## Fluxo

1. Middleware garante cookie de dispositivo
2. `POST /api/auth/register` → Turnstile → disposable → blacklist → rate → risk → user + e-mail
3. Usuário abre link → `GET /api/auth/verify-email` → `emailVerifiedAt` + `ToolUsage` com pacote gratuito
4. Login define cookie httpOnly; `GET /api/auth/me` hidrata o client
5. `POST /api/billing/consume` debita usos no Postgres

## APIs

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/verify-email?token=`
- `POST /api/auth/resend-verification`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/billing/consume`
- `GET /api/billing/confirm` (libera Premium só após pagamento aprovado no Mercado Pago)
- `POST /api/billing/grant-premium` (desativado — retorna 403)
