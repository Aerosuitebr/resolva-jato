import { NextResponse } from 'next/server';
import {
  getMercadoPagoPayment,
  getMerchantOrder,
  isMercadoPagoConfigured,
  type MercadoPagoPayment
} from '@/lib/mercadopago';
import { PLANS } from '@/lib/plans';

function isValidId(value: string | null) {
  return Boolean(value && value !== 'null' && value !== 'undefined');
}

function amountMatches(amount: number | undefined) {
  if (typeof amount !== 'number') return true;
  return Math.abs(amount - PLANS.premium.price) < 0.05;
}

function toResult(payment: MercadoPagoPayment, expectedEmail: string) {
  const paidEmail = (payment.external_reference || '').trim().toLowerCase();
  if (expectedEmail && paidEmail && paidEmail !== expectedEmail) {
    return NextResponse.json(
      { approved: false, error: 'Pagamento não corresponde a esta conta.' },
      { status: 403 }
    );
  }

  const approved = payment.status === 'approved' && amountMatches(payment.transaction_amount);
  return NextResponse.json({
    approved,
    status: payment.status,
    statusDetail: payment.status_detail,
    paymentId: payment.id,
    email: paidEmail || expectedEmail,
    paymentMethod: payment.payment_method_id,
    amount: payment.transaction_amount
  });
}

export async function GET(request: Request) {
  try {
    if (!isMercadoPagoConfigured()) {
      return NextResponse.json({ error: 'Mercado Pago não configurado.' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const expectedEmail = (searchParams.get('email') || '').trim().toLowerCase();
    const paymentId = [searchParams.get('payment_id'), searchParams.get('collection_id')].find(isValidId) || '';
    const merchantOrderId = searchParams.get('merchant_order_id');

    if (paymentId) {
      const payment = await getMercadoPagoPayment(paymentId);
      return toResult(payment, expectedEmail);
    }

    if (isValidId(merchantOrderId)) {
      const order = await getMerchantOrder(merchantOrderId!);
      const approvedEntry = order.payments?.find((p) => p.status === 'approved') || order.payments?.[0];
      if (!approvedEntry?.id) {
        return NextResponse.json({
          approved: false,
          status: 'pending',
          statusDetail: 'merchant_order_sem_pagamento'
        });
      }
      const payment = await getMercadoPagoPayment(String(approvedEntry.id));
      return toResult(payment, expectedEmail);
    }

    return NextResponse.json({ error: 'payment_id ausente.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao confirmar pagamento.' },
      { status: 500 }
    );
  }
}
