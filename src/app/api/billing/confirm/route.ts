import { NextResponse } from 'next/server';
import { readSessionFromCookies } from '@/lib/auth/session-cookie';
import { grantPremiumMonthServer } from '@/lib/billing-server';
import { isDatabaseConfigured } from '@/lib/db';
import {
  getMercadoPagoPayment,
  getMerchantOrder,
  isMercadoPagoConfigured,
  type MercadoPagoPayment
} from '@/lib/mercadopago';
import { PLANS } from '@/lib/plans';
import { writeAuditLog } from '@/lib/security/audit';
import { getClientIp } from '@/lib/security/request-meta';

function isValidId(value: string | null) {
  return Boolean(value && value !== 'null' && value !== 'undefined');
}

function amountMatches(amount: number | undefined) {
  if (typeof amount !== 'number') return true;
  return Math.abs(amount - PLANS.premium.price) < 0.05;
}

async function approveAndGrant(payment: MercadoPagoPayment, expectedEmail: string, userId: string) {
  const paidEmail = (payment.external_reference || '').trim().toLowerCase();
  if (expectedEmail && paidEmail && paidEmail !== expectedEmail) {
    return NextResponse.json(
      { approved: false, error: 'Pagamento não corresponde a esta conta.' },
      { status: 403 }
    );
  }

  const approved = payment.status === 'approved' && amountMatches(payment.transaction_amount);
  if (!approved) {
    return NextResponse.json({
      approved: false,
      status: payment.status,
      statusDetail: payment.status_detail,
      paymentId: payment.id,
      email: paidEmail || expectedEmail,
      paymentMethod: payment.payment_method_id,
      amount: payment.transaction_amount
    });
  }

  const sub = await grantPremiumMonthServer(userId, String(payment.id));
  await writeAuditLog({
    event: 'premium_granted',
    userId,
    email: expectedEmail,
    ip: getClientIp(),
    meta: {
      expiresAt: sub.expiresAt.toISOString(),
      providerRef: String(payment.id),
      source: 'mercadopago_confirm'
    }
  });

  return NextResponse.json({
    approved: true,
    status: payment.status,
    statusDetail: payment.status_detail,
    paymentId: payment.id,
    email: paidEmail || expectedEmail,
    paymentMethod: payment.payment_method_id,
    amount: payment.transaction_amount,
    expiresAt: sub.expiresAt.toISOString()
  });
}

export async function GET(request: Request) {
  try {
    if (!isMercadoPagoConfigured()) {
      return NextResponse.json({ error: 'Mercado Pago não configurado.' }, { status: 503 });
    }
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Banco de dados não configurado.' }, { status: 503 });
    }

    const session = readSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const expectedEmail = (searchParams.get('email') || session.email || '').trim().toLowerCase();
    if (expectedEmail && session.email.toLowerCase() !== expectedEmail) {
      return NextResponse.json({ error: 'E-mail não corresponde à sessão.' }, { status: 403 });
    }

    const paymentId =
      [searchParams.get('payment_id'), searchParams.get('collection_id')].find(isValidId) || '';
    const merchantOrderId = searchParams.get('merchant_order_id');

    if (paymentId) {
      const payment = await getMercadoPagoPayment(paymentId);
      return approveAndGrant(payment, expectedEmail, session.sub);
    }

    if (isValidId(merchantOrderId)) {
      const order = await getMerchantOrder(merchantOrderId!);
      const approvedEntry =
        order.payments?.find((p) => p.status === 'approved') || order.payments?.[0];
      if (!approvedEntry?.id) {
        return NextResponse.json({
          approved: false,
          status: 'pending',
          statusDetail: 'merchant_order_sem_pagamento'
        });
      }
      const payment = await getMercadoPagoPayment(String(approvedEntry.id));
      return approveAndGrant(payment, expectedEmail, session.sub);
    }

    return NextResponse.json({ error: 'payment_id ausente.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao confirmar pagamento.' },
      { status: 500 }
    );
  }
}
