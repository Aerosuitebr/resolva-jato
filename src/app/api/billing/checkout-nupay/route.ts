import { NextResponse } from 'next/server';
import { readSessionFromCookies } from '@/lib/auth/session-cookie';
import { isValidCpf, onlyDigits } from '@/lib/cpf';
import { createNuPayPremiumSession, isNuPayConfigured } from '@/lib/nupay';

export async function POST(request: Request) {
  try {
    if (!isNuPayConfigured()) {
      return NextResponse.json(
        {
          error:
            'NuPay ainda não configurado. Defina NUPAY_APP_KEY e NUPAY_APP_TOKEN no servidor (painel NuPay for Business).'
        },
        { status: 503 }
      );
    }

    const session = readSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Faça login para assinar com NuPay.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as { cpf?: string };
    const cpf = onlyDigits(body.cpf || '');
    if (!isValidCpf(cpf)) {
      return NextResponse.json({ error: 'Informe um CPF válido para pagar com NuPay.' }, { status: 400 });
    }

    const result = await createNuPayPremiumSession({
      userId: session.sub,
      email: session.email,
      name: session.name,
      cpf
    });

    return NextResponse.json({
      preferenceId: result.session.id,
      sessionId: result.session.id,
      reference: result.reference,
      checkoutUrl: result.checkoutUrl,
      mode: result.mode
    });
  } catch (error) {
    const status = (error as { status?: number }).status;
    const message = error instanceof Error ? error.message : 'Falha ao criar checkout NuPay.';
    if (status === 412) {
      return NextResponse.json(
        {
          error:
            'Este CPF não está elegível para NuPay (conta Nubank). Use cartão ou Pix no Mercado Pago.'
        },
        { status: 412 }
      );
    }
    return NextResponse.json({ error: message }, { status: status && status < 500 ? status : 500 });
  }
}
