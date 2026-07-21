# Cloudflare Tunnel — Resolva Jato (conta Aero Suite)

## Conta correta

| Item | Valor |
|------|--------|
| Conta | `Sistema@aerosuite.com.br's Account` |
| Account ID | `44a7c31ca337648abef38dea0c599e79` |
| Tunnel | **`resolvajato`** (novo) |
| Tunnel ID | `3f99aa58-2811-4cd2-9b0b-a0819ee70242` |
| CNAME | `3f99aa58-2811-4cd2-9b0b-a0819ee70242.cfargotunnel.com` |
| Origem | `http://127.0.0.1:3000` |
| Config | `%USERPROFILE%\.cloudflared\config-resolvajato.yml` |

> Não usa o tunnel antigo `6d599ea8-…` (outra conta / homolog local Aero Suite).

## DNS

- `resolvajato.com.br` → CNAME tunnel (proxied)
- `www.resolvajato.com.br` → CNAME tunnel (proxied)

## Nameservers no Registro.br

```
brynne.ns.cloudflare.com
tom.ns.cloudflare.com
```

## Subir o conector

```powershell
cloudflared --config $env:USERPROFILE\.cloudflared\config-resolvajato.yml tunnel run
```

(O serviço Windows `Cloudflared` continua com o tunnel antigo do Aero Suite; o Resolva Jato roda em processo separado.)

## App

```powershell
cd D:\Desenvolvimento\hub-recursos-gratis
npm run dev
```

Teste após propagação DNS: https://resolvajato.com.br
