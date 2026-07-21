import { headers } from 'next/headers';

export function getClientIp(): string {
  const h = headers();
  const forwarded = h.get('cf-connecting-ip') || h.get('x-forwarded-for') || h.get('x-real-ip');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return 'unknown';
}

export function getClientUserAgent(): string | null {
  return headers().get('user-agent');
}
