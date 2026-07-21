import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DEVICE_COOKIE = 'rj_device';

function randomDeviceId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  if (!request.cookies.get(DEVICE_COOKIE)?.value) {
    response.cookies.set(DEVICE_COOKIE, randomDeviceId(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365
    });
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|videos/|images/).*)']
};
