import { NextResponse } from 'next/server';
import { activatePremiumFromMercadoPagoPayment } from '@/lib/billing-server';
import { isDatabaseConfigured } from '@/lib/db';
import {
  getMercadoPagoPayment,
  getMerchantOrder,
  isMercadoPagoConfigured
} from '@/lib/mercadopago';

/**
 * Webhook Mercado Pago (Pix, cartão e demais meios).
 * Ao receber payment/merchant_order aprovado, libera Premium no servidor.
 */
export async function POST(request: Request) {
  try {
    if (!isMercadoPagoConfigured() || !isDatabaseConfigured()) {
      return NextResponse.json({ ok: false }, { status: 503 });
    }

    const contentType = request.headers.get('content-type') || '';
    let topic = '';
    let id = '';

    if (contentType.includes('application/json')) {
      const body = (await request.json().catch(() => ({}))) as {
        type?: string;
        topic?: string;
        action?: string;
        data?: { id?: string };
        resource?: string;
      };
      topic = body.type || body.topic || body.action || '';
      id = String(body.data?.id || '');
      if (!id && body.resource) {
        const parts = body.resource.split('/');
        id = parts[parts.length - 1] || '';
      }
    } else {
      const { searchParams } = new URL(request.url);
      topic = searchParams.get('topic') || searchParams.get('type') || '';
      id = searchParams.get('id') || searchParams.get('data.id') || '';
    }

    const paymentIds: string[] = [];

    if (topic.includes('merchant_order') && id) {
      const order = await getMerchantOrder(id);
      for (const entry of order.payments || []) {
        if (entry?.id) paymentIds.push(String(entry.id));
      }
    } else if ((topic.includes('payment') || topic === 'payment') && id) {
      paymentIds.push(id);
    } else {
      console.info('[mp-webhook] ignored', { topic, id });
      return NextResponse.json({ ok: true, ignored: true });
    }

    const results = [];
    for (const paymentId of paymentIds) {
      const payment = await getMercadoPagoPayment(paymentId);
      const activation = await activatePremiumFromMercadoPagoPayment(payment);
      console.info('[mp-webhook] payment', {
        id: payment.id,
        status: payment.status,
        method: payment.payment_method_id,
        email: payment.external_reference,
        activated: activation.activated,
        reason: activation.activated ? undefined : activation.reason
      });
      results.push({
        paymentId: payment.id,
        status: payment.status,
        activated: activation.activated
      });
    }

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    console.error('[mp-webhook]', error);
    // MP reenvia se não for 2xx; 200 evita storm em erros transitórios
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: 'mercadopago-webhook' });
}
