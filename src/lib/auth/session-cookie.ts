import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'rj_session';
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  emailVerified: boolean;
  iat: number;
  exp: number;
}

function getSecret() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret || secret.length < 16) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AUTH_SECRET deve ter pelo menos 16 caracteres em produção.');
    }
    return 'dev-auth-secret-change-me';
  }
  return secret;
}

function b64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString('base64url');
}

function sign(data: string) {
  return createHmac('sha256', getSecret()).update(data).digest('base64url');
}

export function createSessionToken(input: {
  userId: string;
  email: string;
  name: string;
  emailVerified: boolean;
  maxAgeSec?: number;
}): string {
  const now = Math.floor(Date.now() / 1000);
  const maxAge = input.maxAgeSec ?? SESSION_MAX_AGE_SEC;
  const payload: SessionPayload = {
    sub: input.userId,
    email: input.email,
    name: input.name,
    emailVerified: input.emailVerified,
    iat: now,
    exp: now + maxAge
  };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function parseSessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  const expected = sign(body);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload?.sub || !payload.email || typeof payload.exp !== 'number') return null;
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAgeSec = SESSION_MAX_AGE_SEC) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSec
  };
}

export function readSessionFromCookies(): SessionPayload | null {
  return parseSessionToken(cookies().get(SESSION_COOKIE)?.value);
}

export function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE, token, sessionCookieOptions());
}

export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE, '', { ...sessionCookieOptions(0), maxAge: 0 });
}
