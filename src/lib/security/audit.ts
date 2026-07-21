import { getPrisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export async function writeAuditLog(input: {
  event: string;
  userId?: string | null;
  email?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  deviceId?: string | null;
  meta?: Prisma.InputJsonValue;
}) {
  try {
    const prisma = getPrisma();
    await prisma.auditLog.create({
      data: {
        event: input.event,
        userId: input.userId || null,
        email: input.email?.toLowerCase() || null,
        ip: input.ip || null,
        userAgent: input.userAgent || null,
        deviceId: input.deviceId || null,
        meta: input.meta
      }
    });
  } catch (error) {
    console.error('[audit]', error);
  }
}
