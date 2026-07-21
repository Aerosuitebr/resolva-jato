import { getPrisma } from '@/lib/db';
import type { BlacklistType } from '@prisma/client';

export async function isBlacklisted(checks: Array<{ type: BlacklistType; value: string }>) {
  const prisma = getPrisma();
  const now = new Date();
  for (const check of checks) {
    if (!check.value) continue;
    const entry = await prisma.blacklistEntry.findUnique({
      where: { type_value: { type: check.type, value: check.value.toLowerCase() } }
    });
    if (!entry) continue;
    if (entry.expiresAt && entry.expiresAt.getTime() < now.getTime()) continue;
    return { blocked: true as const, entry };
  }
  return { blocked: false as const };
}

export async function addToBlacklist(input: {
  type: BlacklistType;
  value: string;
  reason?: string;
  expiresAt?: Date | null;
}) {
  const prisma = getPrisma();
  return prisma.blacklistEntry.upsert({
    where: {
      type_value: { type: input.type, value: input.value.toLowerCase() }
    },
    create: {
      type: input.type,
      value: input.value.toLowerCase(),
      reason: input.reason,
      expiresAt: input.expiresAt ?? null
    },
    update: {
      reason: input.reason,
      expiresAt: input.expiresAt ?? null
    }
  });
}
