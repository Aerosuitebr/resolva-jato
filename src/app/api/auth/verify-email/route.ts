import { NextResponse } from 'next/server';
import { consumeVerificationToken } from '@/lib/auth/email-verification';
import {
  createSessionToken,
  setSessionCookie
} from '@/lib/auth/session-cookie';
import { writeAuditLog } from '@/lib/security/audit';
import { getClientIp, getClientUserAgent } from '@/lib/security/request-meta';
import { isDatabaseConfigured } from '@/lib/db';

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export async function GET(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.redirect(`${appUrl()}/verificar-email?error=db`);
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || '';
    if (!token) {
      return NextResponse.redirect(`${appUrl()}/verificar-email?error=missing`);
    }

    const result = await consumeVerificationToken(token);
    if (!result.ok) {
      return NextResponse.redirect(
        `${appUrl()}/verificar-email?error=${encodeURIComponent(result.error)}`
      );
    }

    const user = result.user;
    const sessionToken = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      emailVerified: true
    });
    setSessionCookie(sessionToken);

    await writeAuditLog({
      event: 'email_verified',
      userId: user.id,
      email: user.email,
      ip: getClientIp(),
      userAgent: getClientUserAgent()
    });

    return NextResponse.redirect(`${appUrl()}/verificar-email?ok=1`);
  } catch (error) {
    console.error('[verify-email]', error);
    return NextResponse.redirect(`${appUrl()}/verificar-email?error=server`);
  }
}
