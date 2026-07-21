import { NextResponse } from 'next/server';
import { createPremiumCheckoutPreference, isMercadoPagoConfigured } from '@/lib/mercadopago';

export async function POST(request: Request) {
  try {
    if (!isMercadoPagoConfigured()) {
      return NextResponse.json(
        { error: 'Mercado Pago ainda não configurado no servidor.' },
        { status: 503 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      name?: string;
    };

    const email = (body.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Informe o e-mail da conta logada.' }, { status: 400 });
    }

    const result = await createPremiumCheckoutPreference({
      payerEmail: email,
      payerName: body.name?.trim()
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao criar checkout.' },
      { status: 500 }
    );
  }
}
