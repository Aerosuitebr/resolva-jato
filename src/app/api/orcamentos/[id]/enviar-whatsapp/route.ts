import { NextResponse } from 'next/server';
import { shouldBrandOutboundMessagesByEmail } from '@/lib/billing-server';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { buildClienteOrcamentoWhatsAppText } from '@/lib/orcamentos/whatsapp-links';
import { sendWithOwnerSession } from '@/lib/whatsapp/ephemeral-session';

type RouteContext = { params: { id: string } };

function appBaseUrl(request: Request) {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  if (envUrl) return envUrl;
  const origin = request.headers.get('origin');
  if (origin) return origin;
  const host = request.headers.get('host');
  if (host) {
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    return `${proto}://${host}`;
  }
  return 'http://localhost:3000';
}

/**
 * Envia o link ao cliente usando a sessão efêmera do profissional.
 * Requer WhatsApp já conectado (QR). Desconecta após o envio.
 * Marca Resolva Jato é aplicada no servidor conforme o plano.
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
    }

    const body = await request.json().catch(() => ({}));
    const ownerEmail =
      typeof body.ownerEmail === 'string' ? body.ownerEmail.trim().toLowerCase() : '';
    if (!ownerEmail) {
      return NextResponse.json({ error: 'Informe ownerEmail.' }, { status: 400 });
    }

    const prisma = getPrisma();
    const row = await prisma.orcamento.findUnique({ where: { id: context.params.id } });
    if (!row) {
      return NextResponse.json({ error: 'Orçamento não encontrado.' }, { status: 404 });
    }
    if (row.ownerEmail?.toLowerCase() !== ownerEmail) {
      return NextResponse.json({ error: 'Sem permissão para enviar este orçamento.' }, { status: 403 });
    }

    const branded = await shouldBrandOutboundMessagesByEmail(ownerEmail);
    const url = `${appBaseUrl(request)}/orcamento/${row.id}`;
    const text = buildClienteOrcamentoWhatsAppText({
      clienteNome: row.clienteNome,
      profissionalNome: row.profissionalNome,
      total: row.total,
      url,
      branded
    });

    const result = await sendWithOwnerSession({
      ownerEmail,
      toPhone: row.clienteContato,
      text,
      disconnectAfter: true
    });

    if (!result.sent) {
      return NextResponse.json(
        {
          error: result.error || 'Falha ao enviar WhatsApp.',
          state: result.state,
          qr: result.qr,
          mode: 'ephemeral'
        },
        { status: result.state === 'open' ? 502 : 409 }
      );
    }

    return NextResponse.json({
      ok: true,
      url,
      branded,
      disconnected: result.disconnected,
      mode: 'ephemeral',
      message: 'Enviado pelo seu WhatsApp e desconectado em seguida.'
    });
  } catch (error) {
    console.error('[POST /api/orcamentos/:id/enviar-whatsapp]', error);
    return NextResponse.json({ error: 'Não foi possível enviar o WhatsApp.' }, { status: 500 });
  }
}
