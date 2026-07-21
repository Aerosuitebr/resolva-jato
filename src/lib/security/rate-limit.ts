import { getPrisma } from '@/lib/db';

export async function consumeRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<{ allowed: boolean; remaining: number; retryAfterSec: number }> {
  const prisma = getPrisma();
  const now = new Date();
  const existing = await prisma.rateLimitBucket.findUnique({ where: { key: input.key } });

  if (!existing || now.getTime() - existing.windowStart.getTime() >= input.windowMs) {
    await prisma.rateLimitBucket.upsert({
      where: { key: input.key },
      create: { key: input.key, count: 1, windowStart: now },
      update: { count: 1, windowStart: now }
    });
    return { allowed: true, remaining: input.limit - 1, retryAfterSec: Math.ceil(input.windowMs / 1000) };
  }

  if (existing.count >= input.limit) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((existing.windowStart.getTime() + input.windowMs - now.getTime()) / 1000)
    );
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  await prisma.rateLimitBucket.update({
    where: { key: input.key },
    data: { count: { increment: 1 } }
  });

  return {
    allowed: true,
    remaining: input.limit - existing.count - 1,
    retryAfterSec: Math.ceil(
      (existing.windowStart.getTime() + input.windowMs - now.getTime()) / 1000
    )
  };
}

export const RATE_LIMITS = {
  register: { limit: 3, windowMs: 24 * 60 * 60 * 1000 },
  login: { limit: 10, windowMs: 15 * 60 * 1000 },
  resendVerification: { limit: 5, windowMs: 60 * 60 * 1000 }
} as const;
