# NuPay for Business (Resolva Jato)

Opção extra de pagamento Premium via app Nubank, em paralelo ao Mercado Pago.

## Pré-requisitos comerciais

1. Cadastro e contrato [NuPay for Business](https://nupaybusiness.com.br)
2. Painel sandbox: https://sandbox-painel.spinpay.com.br  
   Produção: https://painel.spinpay.com.br
3. Em **Credentials**, copiar **APP KEY** e **APP TOKEN**

## Variáveis de ambiente

```env
NUPAY_MODE=sandbox
NUPAY_APP_KEY=
NUPAY_APP_TOKEN=
```

Em produção no Vultr, acrescente as mesmas chaves em `/opt/resolva-jato/.env.production` (ou rode o setup com as vars no `.env` local).

Webhook público: `https://resolvajato.com.br/api/webhooks/nupay`

## Fluxo

1. Usuário em `/conta` informa CPF e clica **Pagar com NuPay**
2. `POST /api/billing/checkout-nupay` cria sessão (`POST /v1/checkouts/sessions`)
3. Redirect para o app Nubank (`redirectUrl`)
4. Retorno em `/conta?billing=nupay&sessionId=…`
5. `GET /api/billing/confirm-nupay` consulta sessão, cria pagamento e libera Premium
6. Webhook reforça a liberação quando o status muda

## Código

- [`src/lib/nupay.ts`](../src/lib/nupay.ts)
- [`src/app/api/billing/checkout-nupay/route.ts`](../src/app/api/billing/checkout-nupay/route.ts)
- [`src/app/api/billing/confirm-nupay/route.ts`](../src/app/api/billing/confirm-nupay/route.ts)
- [`src/app/api/webhooks/nupay/route.ts`](../src/app/api/webhooks/nupay/route.ts)

Sem `NUPAY_APP_KEY` / `NUPAY_APP_TOKEN`, o botão NuPay retorna 503 e o Mercado Pago continua disponível.
