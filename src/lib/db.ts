import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'Configure DATABASE_URL no arquivo .env (veja .env.example). Sem banco, os orçamentos públicos não podem ser salvos.'
    );
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
    });
  }

  return globalForPrisma.prisma;
}

export function isDatabaseConfigured() {
  const url = process.env.DATABASE_URL || '';
  if (!url) return false;
  if (
    url.includes('[PASSWORD]') ||
    url.includes('[PROJECT-REF]') ||
    url.includes('johndoe') ||
    url.includes('randompassword')
  ) {
    return false;
  }
  return true;
}
