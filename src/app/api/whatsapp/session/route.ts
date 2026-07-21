import { NextResponse } from 'next/server';
import { isValidEmail } from '@/lib/orcamentos/types';
import {
  disconnectOwnerSession,
  getOwnerSessionStatus,
  sendWithOwnerSession
} from '@/lib/whatsapp/ephemeral-session';
import { getEvolutionConfig, isWhatsAppApiConfigured } from '@/lib/whatsapp/send';

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

/** Status da sessão efêmera do profissional (QR + conexão). */
export async function GET(request: Request) {
  const ownerEmail = new URL(request.url).searchParams.get('ownerEmail')?.trim().toLowerCase() || '';
  if (!ownerEmail || !isValidEmail(ownerEmail)) {
    return NextResponse.json({ error: 'Informe ownerEmail válido.' }, { status: 400 });
  }

  const evolution = getEvolutionConfig();
  if (!isWhatsAppApiConfigured() || !evolution.enabled) {
    return NextResponse.json({
      configured: false,
      hint: 'Suba a Evolution com npm run whatsapp:up'
    });
  }

  try {
    const status = await getOwnerSessionStatus(ownerEmail);
    return NextResponse.json({
      mode: 'ephemeral',
      ...status,
      message:
        status.state === 'open'
          ? 'WhatsApp conectado. Pode enviar e em seguida será desconectado.'
          : 'Escaneie o QR com o WhatsApp que vai ENVIAR a mensagem. Depois do envio, desconectamos.'
    });
  } catch (error) {
    return NextResponse.json(
      { configured: false, error: error instanceof Error ? error.message : 'Falha ao obter sessão' },
      { status: 502 }
    );
  }
}

/** Inicia/atualiza sessão (garante instância + QR). */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ownerEmail = asString(body.ownerEmail).toLowerCase();
    if (!ownerEmail || !isValidEmail(ownerEmail)) {
      return NextResponse.json({ error: 'Informe ownerEmail válido.' }, { status: 400 });
    }

    const status = await getOwnerSessionStatus(ownerEmail);
    return NextResponse.json({
      ok: true,
      mode: 'ephemeral',
      ...status,
      message:
        status.state === 'open'
          ? 'Já conectado. Ao enviar, desconectamos em seguida.'
          : 'Escaneie o QR com o seu WhatsApp agora.'
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao iniciar sessão' },
      { status: 502 }
    );
  }
}

/** Envia mensagem com a sessão do profissional e desconecta. */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const ownerEmail = asString(body.ownerEmail).toLowerCase();
    const to = asString(body.to);
    const text = asString(body.text);
    const disconnectAfter = body.disconnectAfter !== false;

    if (!ownerEmail || !isValidEmail(ownerEmail)) {
      return NextResponse.json({ error: 'Informe ownerEmail válido.' }, { status: 400 });
    }
    if (!to || !text) {
      return NextResponse.json({ error: 'Informe destino e texto.' }, { status: 400 });
    }

    const result = await sendWithOwnerSession({
      ownerEmail,
      toPhone: to,
      text,
      disconnectAfter
    });

    if (!result.sent) {
      return NextResponse.json(
        {
          error: result.error || 'Não foi possível enviar.',
          state: result.state,
          qr: result.qr
        },
        { status: result.state === 'open' ? 502 : 409 }
      );
    }

    return NextResponse.json({
      ok: true,
      sent: true,
      disconnected: result.disconnected,
      message: result.disconnected
        ? 'Mensagem enviada e WhatsApp desconectado deste aparelho no servidor.'
        : 'Mensagem enviada.'
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha no envio' },
      { status: 502 }
    );
  }
}

/** Força desconexão/remoção da sessão do profissional. */
export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const ownerEmail =
      asString(body.ownerEmail).toLowerCase() ||
      new URL(request.url).searchParams.get('ownerEmail')?.trim().toLowerCase() ||
      '';
    if (!ownerEmail || !isValidEmail(ownerEmail)) {
      return NextResponse.json({ error: 'Informe ownerEmail válido.' }, { status: 400 });
    }
    const ok = await disconnectOwnerSession(ownerEmail);
    return NextResponse.json({ ok, disconnected: ok });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao desconectar' },
      { status: 502 }
    );
  }
}
