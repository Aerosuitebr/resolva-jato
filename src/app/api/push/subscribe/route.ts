import { NextResponse } from 'next/server';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { isValidEmail } from '@/lib/orcamentos/types';
import { getVapidPublicKey, isPushConfigured } from '@/lib/push/vapid';

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function GET() {
  return NextResponse.json({
    configured: isPushConfigured(),
    publicKey: getVapidPublicKey() || null
  });
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
    }
    if (!isPushConfigured()) {
      return NextResponse.json(
        { error: 'Push não configurado. Defina as chaves VAPID no .env.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const ownerEmail = asString(body.ownerEmail).toLowerCase();
    const endpoint = asString(body.endpoint);
    const p256dh = asString(body.keys?.p256dh ?? body.p256dh);
    const auth = asString(body.keys?.auth ?? body.auth);
    const userAgent = asString(body.userAgent) || null;

    if (!ownerEmail || !isValidEmail(ownerEmail)) {
      return NextResponse.json({ error: 'Informe um e-mail válido do profissional.' }, { status: 400 });
    }
    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: 'Subscription inválida.' }, { status: 400 });
    }

    const prisma = getPrisma();
    const saved = await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { ownerEmail, endpoint, p256dh, auth, userAgent },
      update: { ownerEmail, p256dh, auth, userAgent }
    });

    return NextResponse.json({ ok: true, id: saved.id });
  } catch (error) {
    console.error('[POST /api/push/subscribe]', error);
    return NextResponse.json({ error: 'Não foi possível salvar a inscrição.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
    }

    const body = await request.json().catch(() => ({}));
    const endpoint = asString(body.endpoint);
    const ownerEmail = asString(body.ownerEmail).toLowerCase();

    if (!endpoint && !ownerEmail) {
      return NextResponse.json({ error: 'Informe endpoint ou ownerEmail.' }, { status: 400 });
    }

    const prisma = getPrisma();
    if (endpoint) {
      await prisma.pushSubscription.deleteMany({ where: { endpoint } });
    } else {
      await prisma.pushSubscription.deleteMany({ where: { ownerEmail } });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/push/subscribe]', error);
    return NextResponse.json({ error: 'Não foi possível remover a inscrição.' }, { status: 500 });
  }
}
