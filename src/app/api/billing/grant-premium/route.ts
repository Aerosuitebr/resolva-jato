import { NextResponse } from 'next/server';
import { readSessionFromCookies } from '@/lib/auth/session-cookie';
import { isDatabaseConfigured } from '@/lib/db';
import { grantPremiumMonthServer } from '@/lib/billing-server';
import { writeAuditLog } from '@/lib/security/audit';
import { getClientIp } from '@/lib/security/request-meta';

export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Banco de dados não configurado.' }, { status: 503 });
    }

    const session = readSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as { providerRef?: string };
    const sub = await grantPremiumMonthServer(session.sub, body.providerRef || null);

    await writeAuditLog({
      event: 'premium_granted',
      userId: session.sub,
      email: session.email,
      ip: getClientIp(),
      meta: { expiresAt: sub.expiresAt.toISOString(), providerRef: body.providerRef }
    });

    return NextResponse.json({
      ok: true,
      expiresAt: sub.expiresAt.toISOString()
    });
  } catch (error) {
    console.error('[billing/grant-premium]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao liberar Premium.' },
      { status: 500 }
    );
  }
}
