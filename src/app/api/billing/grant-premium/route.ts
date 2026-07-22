import { NextResponse } from 'next/server';

/**
 * Endpoint desativado: Premium só pode ser liberado após confirmação
 * de pagamento real em POST/GET /api/billing/confirm.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        'Liberação manual de Premium desativada. Conclua o pagamento no Mercado Pago; a ativação ocorre automaticamente após a confirmação.'
    },
    { status: 403 }
  );
}
