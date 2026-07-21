import { NextResponse } from 'next/server';
import {
  getMercadoPagoPayment,
  getMerchantOrder,
  isMercadoPagoConfigured
} from '@/lib/mercadopago';

/**
 * Notificações do Mercado Pago (IPN / Webhooks).
 * Por enquanto registra e valida o pagamento; a liberação do Premium
 * no browser acontece via /api/billing/confirm no retorno do checkout.
 */
export async function POST(request: Request) {
  try {
    if (!isMercadoPagoConfigured()) {
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

    if (topic.includes('merchant_order') && id) {
      const order = await getMerchantOrder(id);
      const approved = order.payments?.some((p) => p.status === 'approved');
      console.info('[mp-webhook] merchant_order', id, approved ? 'approved' : 'pending');
    } else if ((topic.includes('payment') || topic === 'payment') && id) {
      const payment = await getMercadoPagoPayment(id);
      console.info(
        '[mp-webhook] payment',
        payment.id,
        payment.status,
        payment.external_reference
      );
    } else {
      console.info('[mp-webhook] ignored', { topic, id });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[mp-webhook]', error);
    // MP reenvia se não for 2xx; devolvemos 200 para evitar storm em erros transitórios de parse
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: 'mercadopago-webhook' });
}
