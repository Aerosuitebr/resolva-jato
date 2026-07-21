import { NextResponse } from 'next/server';
import { consumeVerificationToken } from '@/lib/auth/email-verification';
import { writeAuditLog } from '@/lib/security/audit';
import { getClientIp, getClientUserAgent } from '@/lib/security/request-meta';
import { isDatabaseConfigured } from '@/lib/db';

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

/**
 * Confirma e-mail sem criar sessão automaticamente.
 * Auto-login via link de e-mail é um padrão típico de phishing e dispara Safe Browsing.
 */
async function verifyToken(token: string) {
  if (!isDatabaseConfigured()) {
    return { ok: false as const, error: 'db', status: 503 };
  }
  if (!token) {
    return { ok: false as const, error: 'missing', status: 400 };
  }

  const result = await consumeVerificationToken(token);
  if (!result.ok) {
    return { ok: false as const, error: result.error, status: 400 };
  }

  const user = result.user;
  await writeAuditLog({
    event: 'email_verified',
    userId: user.id,
    email: user.email,
    ip: getClientIp(),
    userAgent: getClientUserAgent()
  });

  return {
    ok: true as const,
    email: user.email,
    status: 200
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { token?: string };
    const result = await verifyToken(body.token || '');
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
    }
    return NextResponse.json({ ok: true, email: result.email });
  } catch (error) {
    console.error('[verify-email]', error);
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500 });
  }
}

/** Compatível com links antigos no e-mail; não cria sessão. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || '';
    const result = await verifyToken(token);

    if (!result.ok) {
      return NextResponse.redirect(
        `${appUrl()}/verificar-email?error=${encodeURIComponent(result.error)}`
      );
    }

    return NextResponse.redirect(
      `${appUrl()}/login?verified=1&email=${encodeURIComponent(result.email)}`
    );
  } catch (error) {
    console.error('[verify-email]', error);
    return NextResponse.redirect(`${appUrl()}/verificar-email?error=server`);
  }
}
