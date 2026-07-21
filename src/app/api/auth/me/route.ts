import { NextResponse } from 'next/server';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { readSessionFromCookies } from '@/lib/auth/session-cookie';
import {
  getServerPlanId,
  getServerUsageProgress,
  getPlanForId
} from '@/lib/billing-server';
import { ensureDeviceCookie } from '@/lib/security/device-cookie';
import { getClientUserAgent } from '@/lib/security/request-meta';

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ authenticated: false });
    }

    // Mantém cookie de dispositivo vivo em visitas autenticadas
    await ensureDeviceCookie({ userAgent: getClientUserAgent() }).catch(() => undefined);

    const session = readSessionFromCookies();
    if (!session) {
      return NextResponse.json({ authenticated: false });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    const emailVerified = Boolean(user.emailVerifiedAt);
    const planId = await getServerPlanId(user.id);
    const usage = await getServerUsageProgress(user.id);

    return NextResponse.json({
      authenticated: true,
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
    console.error('[me]', error);
    return NextResponse.json({ authenticated: false });
  }
}
