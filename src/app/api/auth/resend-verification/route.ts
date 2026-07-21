import { NextResponse } from 'next/server';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import {
  createEmailVerificationToken,
  sendVerificationEmail
} from '@/lib/auth/email-verification';
import { verifyTurnstileToken } from '@/lib/security/turnstile';
import { consumeRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';
import { writeAuditLog } from '@/lib/security/audit';
import { getClientIp, getClientUserAgent } from '@/lib/security/request-meta';

export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Banco de dados não configurado.' }, { status: 503 });
    }

    const body = (await request.json()) as { email?: string; turnstileToken?: string };
    const email = (body.email || '').trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: 'Informe o e-mail.' }, { status: 400 });
    }

    const ip = getClientIp();
    const userAgent = getClientUserAgent();
    const turnstile = await verifyTurnstileToken(body.turnstileToken, ip);
    if (!turnstile.ok) {
      return NextResponse.json({ error: turnstile.error }, { status: 400 });
    }

    const rate = await consumeRateLimit({
      key: `resend:ip:${ip}`,
      ...RATE_LIMITS.resendVerification
    });
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Limite de reenvios atingido. Aguarde ${rate.retryAfterSec}s.` },
        { status: 429 }
      );
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { email } });

    // Resposta genérica para não enumerar contas
    if (!user || user.emailVerifiedAt) {
      return NextResponse.json({
        ok: true,
        message: 'Se a conta existir e ainda não estiver confirmada, enviamos um novo e-mail.'
      });
    }

    const { verifyUrl } = await createEmailVerificationToken(user.id);
    const mail = await sendVerificationEmail({ to: email, name: user.name, verifyUrl });

    await writeAuditLog({
      event: 'resend_verification',
      userId: user.id,
      email,
      ip,
      userAgent,
      meta: { emailSent: mail.sent }
    });

    return NextResponse.json({
      ok: true,
      emailSent: mail.sent,
      emailError: mail.error,
      message: 'Se a conta existir e ainda não estiver confirmada, enviamos um novo e-mail.'
    });
  } catch (error) {
    console.error('[resend-verification]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao reenviar.' },
      { status: 500 }
    );
  }
}
