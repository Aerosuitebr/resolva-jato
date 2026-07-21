import { NextResponse } from 'next/server';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password-hash';
import {
  createSessionToken,
  setSessionCookie
} from '@/lib/auth/session-cookie';
import { consumeRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';
import { ensureDeviceCookie, linkDeviceToUser } from '@/lib/security/device-cookie';
import { writeAuditLog } from '@/lib/security/audit';
import { getClientIp, getClientUserAgent } from '@/lib/security/request-meta';
import {
  getServerPlanId,
  getServerUsageProgress,
  getPlanForId
} from '@/lib/billing-server';

export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Banco de dados não configurado.' }, { status: 503 });
    }

    const body = (await request.json()) as { email?: string; password?: string };
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (!email || !password) {
      return NextResponse.json({ error: 'Informe e-mail e senha.' }, { status: 400 });
    }

    const ip = getClientIp();
    const userAgent = getClientUserAgent();

    const rate = await consumeRateLimit({
      key: `login:ip:${ip}`,
      ...RATE_LIMITS.login
    });
    if (!rate.allowed) {
      await writeAuditLog({ event: 'rate_block_login', email, ip, userAgent });
      return NextResponse.json(
        { error: `Muitas tentativas. Aguarde ${rate.retryAfterSec}s.` },
        { status: 429 }
      );
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      await writeAuditLog({ event: 'login_fail', email, ip, userAgent });
      return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    const deviceId = await ensureDeviceCookie({ userAgent });
    await linkDeviceToUser(deviceId, user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ip }
    });

    const emailVerified = Boolean(user.emailVerifiedAt);
    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      emailVerified
    });
    setSessionCookie(token);

    const planId = await getServerPlanId(user.id);
    const usage = await getServerUsageProgress(user.id);

    await writeAuditLog({
      event: 'login',
      userId: user.id,
      email,
      ip,
      userAgent,
      deviceId,
      meta: { emailVerified }
    });

    return NextResponse.json({
      ok: true,
      emailVerified,
      session: {
        token: 'cookie',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
          emailVerified
        }
      },
      plan: getPlanForId(planId),
      planId,
      usage
    });
  } catch (error) {
    console.error('[login]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha no login.' },
      { status: 500 }
    );
  }
}
