import { NextResponse } from 'next/server';
import { readSessionFromCookies } from '@/lib/auth/session-cookie';
import { activatePremiumFromMercadoPagoPayment } from '@/lib/billing-server';
import { isDatabaseConfigured } from '@/lib/db';
import {
  getMercadoPagoPayment,
  getMerchantOrder,
  isMercadoPagoConfigured,
  searchPaymentsByExternalReference,
  type MercadoPagoPayment
} from '@/lib/mercadopago';

function isValidId(value: string | null | undefined) {
  return Boolean(value && value !== 'null' && value !== 'undefined');
}

async function resolvePayment(input: {
  paymentId?: string;
  merchantOrderId?: string;
  email?: string;
}): Promise<MercadoPagoPayment | null> {
  let payment: MercadoPagoPayment | null = null;

  if (isValidId(input.paymentId)) {
    payment = await getMercadoPagoPayment(input.paymentId!);
    if (payment.status === 'approved') return payment;
  }

  if (isValidId(input.merchantOrderId)) {
    const order = await getMerchantOrder(input.merchantOrderId!);
    const approvedEntry = order.payments?.find((p) => p.status === 'approved');
    if (approvedEntry?.id) {
      return getMercadoPagoPayment(String(approvedEntry.id));
    }
    const fallback = order.payments?.[0];
    if (!payment && fallback?.id) {
      payment = await getMercadoPagoPayment(String(fallback.id));
      if (payment.status === 'approved') return payment;
    }
  }

  if (input.email) {
    const results = await searchPaymentsByExternalReference(input.email, 15);
    const approved = results.find((p) => p.status === 'approved');
    if (approved) return approved;
    if (!payment) return results[0] || null;
  }

  return payment;
}

/**
 * Confirma pagamento Mercado Pago (Pix, cartão, saldo, etc.) e libera Premium.
 * Aceita payment_id, merchant_order_id ou busca pelo e-mail da sessão.
 */
export async function GET(request: Request) {
  try {
    if (!isMercadoPagoConfigured()) {
      return NextResponse.json({ error: 'Mercado Pago não configurado.' }, { status: 503 });
    }
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Banco de dados não configurado.' }, { status: 503 });
    }

    const session = readSessionFromCookies();
    const { searchParams } = new URL(request.url);
    const queryEmail = (searchParams.get('email') || '').trim().toLowerCase();
    const sessionEmail = (session?.email || '').trim().toLowerCase();
    const email = sessionEmail || queryEmail;

    if (!email) {
      return NextResponse.json(
        { approved: false, error: 'Faça login para confirmar o pagamento.' },
        { status: 401 }
      );
    }

    if (sessionEmail && queryEmail && sessionEmail !== queryEmail) {
      return NextResponse.json(
        { approved: false, error: 'Pagamento não corresponde a esta conta.' },
        { status: 403 }
      );
    }

    const paymentId =
      [searchParams.get('payment_id'), searchParams.get('collection_id')].find(isValidId) || '';
    const merchantOrderId = searchParams.get('merchant_order_id') || '';

    const payment = await resolvePayment({
      paymentId,
      merchantOrderId,
      email
    });

    if (!payment) {
      return NextResponse.json({
        approved: false,
        status: 'pending',
        statusDetail: 'pagamento_nao_encontrado'
      });
    }

    const paidEmail = (payment.external_reference || '').trim().toLowerCase();
    if (paidEmail && paidEmail !== email) {
      return NextResponse.json(
        { approved: false, error: 'Pagamento não corresponde a esta conta.' },
        { status: 403 }
      );
    }

    const activation = await activatePremiumFromMercadoPagoPayment(payment);

    if (activation.activated) {
      return NextResponse.json({
        approved: true,
        activated: true,
        alreadyActive: Boolean(activation.alreadyActive),
        status: activation.status,
        paymentId: activation.paymentId,
        email: activation.email,
        expiresAt: activation.expiresAt,
        paymentMethod: payment.payment_method_id,
        amount: payment.transaction_amount
      });
    }

    return NextResponse.json({
      approved: false,
      activated: false,
      status: activation.status || payment.status,
      statusDetail: activation.reason || payment.status_detail,
      paymentId: payment.id,
      email,
      paymentMethod: payment.payment_method_id,
      amount: payment.transaction_amount
    });
  } catch (error) {
    console.error('[billing/confirm]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao confirmar pagamento.' },
      { status: 500 }
    );
  }
}
