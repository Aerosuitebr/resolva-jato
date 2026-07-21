import { cookies } from 'next/headers';
import { getPrisma } from '@/lib/db';
import { generateSecureToken } from '@/lib/auth/password-hash';

export const DEVICE_COOKIE = 'rj_device';
const DEVICE_MAX_AGE_SEC = 60 * 60 * 24 * 365; // 1 year

export function deviceCookieOptions(maxAgeSec = DEVICE_MAX_AGE_SEC) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSec
  };
}

export async function ensureDeviceCookie(meta?: {
  userAgent?: string | null;
  language?: string | null;
  timezone?: string | null;
}): Promise<string> {
  const jar = cookies();
  const existing = jar.get(DEVICE_COOKIE)?.value;
  const prisma = getPrisma();

  if (existing) {
    await prisma.deviceCookie.upsert({
      where: { uuid: existing },
      create: {
        uuid: existing,
        userAgent: meta?.userAgent || null,
        language: meta?.language || null,
        timezone: meta?.timezone || null
      },
      update: {
        lastSeenAt: new Date(),
        ...(meta?.userAgent ? { userAgent: meta.userAgent } : {}),
        ...(meta?.language ? { language: meta.language } : {}),
        ...(meta?.timezone ? { timezone: meta.timezone } : {})
      }
    });
    jar.set(DEVICE_COOKIE, existing, deviceCookieOptions());
    return existing;
  }

  const uuid = generateSecureToken(16);
  await prisma.deviceCookie.create({
    data: {
      uuid,
      userAgent: meta?.userAgent || null,
      language: meta?.language || null,
      timezone: meta?.timezone || null
    }
  });
  jar.set(DEVICE_COOKIE, uuid, deviceCookieOptions());
  return uuid;
}

export async function linkDeviceToUser(deviceUuid: string, userId: string) {
  const prisma = getPrisma();
  const device = await prisma.deviceCookie.findUnique({ where: { uuid: deviceUuid } });
  if (!device) return;

  await prisma.deviceCookieLink.upsert({
    where: {
      deviceCookieId_userId: {
        deviceCookieId: device.id,
        userId
      }
    },
    create: { deviceCookieId: device.id, userId },
    update: {}
  });
}

export async function countUsersForDevice(deviceUuid: string): Promise<number> {
  const prisma = getPrisma();
  const device = await prisma.deviceCookie.findUnique({
    where: { uuid: deviceUuid },
    include: { _count: { select: { links: true } } }
  });
  return device?._count.links ?? 0;
}
