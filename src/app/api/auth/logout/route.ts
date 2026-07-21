import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth/session-cookie';
import { writeAuditLog } from '@/lib/security/audit';
import { getClientIp } from '@/lib/security/request-meta';
import { readSessionFromCookies } from '@/lib/auth/session-cookie';

export async function POST() {
  const session = readSessionFromCookies();
  clearSessionCookie();
  if (session) {
    await writeAuditLog({
      event: 'logout',
      userId: session.sub,
      email: session.email,
      ip: getClientIp()
    });
  }
  return NextResponse.json({ ok: true });
}
