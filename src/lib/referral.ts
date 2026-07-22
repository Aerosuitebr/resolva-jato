import { generateSecureToken } from '@/lib/auth/password-hash';
import { grantPremiumMonthServer } from '@/lib/billing-server';
import { getPrisma } from '@/lib/db';
import {
  buildReferralSignupUrl,
  buildReferralWhatsAppUrl,
  normalizeReferralCode,
  REFERRAL_BATCH_SIZE
} from '@/lib/referral-shared';
import { writeAuditLog } from '@/lib/security/audit';

export {
  buildReferralSignupUrl,
  buildReferralWhatsAppUrl,
  normalizeReferralCode,
  REFERRAL_BATCH_SIZE,
  REFERRAL_STORAGE_KEY
} from '@/lib/referral-shared';

export async function ensureUserReferralCode(userId: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, referralCode: true }
  });
  if (!user) throw new Error('Usuário não encontrado.');
  if (user.referralCode) return user.referralCode;

  for (let attempt = 0; attempt < 8; attempt++) {
    const code = `RJ${generateSecureToken(4).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)}`;
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code },
        select: { referralCode: true }
      });
      return updated.referralCode!;
    } catch {
      // unique collision — retry
    }
  }
  throw new Error('Não foi possível gerar código de indicação.');
}

export async function resolveReferrerIdByCode(codeRaw: string, excludeUserId?: string) {
  const code = normalizeReferralCode(codeRaw);
  if (!code) return null;
  const prisma = getPrisma();
  const referrer = await prisma.user.findUnique({
    where: { referralCode: code },
    select: { id: true }
  });
  if (!referrer) return null;
  if (excludeUserId && referrer.id === excludeUserId) return null;
  return referrer.id;
}

async function sharesDeviceWithReferrer(referrerId: string, referredId: string) {
  const prisma = getPrisma();
  const [referrerLinks, referredLinks] = await Promise.all([
    prisma.deviceCookieLink.findMany({
      where: { userId: referrerId },
      select: { deviceCookieId: true }
    }),
    prisma.deviceCookieLink.findMany({
      where: { userId: referredId },
      select: { deviceCookieId: true }
    })
  ]);
  const referrerDevices = new Set(referrerLinks.map((l) => l.deviceCookieId));
  return referredLinks.some((l) => referrerDevices.has(l.deviceCookieId));
}

/** Marca amigo como ativo (e-mail ok + 1º uso) e tenta liberar recompensa. */
export async function maybeActivateReferral(referredUserId: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: referredUserId },
    select: {
      id: true,
      email: true,
      emailVerifiedAt: true,
      referredByUserId: true,
      toolUsage: { select: { totalConsumed: true } },
      referralActivationReceived: { select: { id: true } }
    }
  });

  if (!user?.referredByUserId) return { activated: false as const };
  if (!user.emailVerifiedAt) return { activated: false as const };
  if ((user.toolUsage?.totalConsumed || 0) < 1) return { activated: false as const };
  if (user.referralActivationReceived) return { activated: false as const };

  if (await sharesDeviceWithReferrer(user.referredByUserId, user.id)) {
    await writeAuditLog({
      event: 'referral_blocked_same_device',
      userId: user.id,
      email: user.email,
      meta: { referrerId: user.referredByUserId }
    });
    return { activated: false as const, blocked: 'same_device' as const };
  }

  await prisma.referralActivation.create({
    data: {
      referrerId: user.referredByUserId,
      referredId: user.id
    }
  });

  await writeAuditLog({
    event: 'referral_activated',
    userId: user.id,
    email: user.email,
    meta: { referrerId: user.referredByUserId }
  });

  const reward = await maybeGrantReferralRewards(user.referredByUserId);
  return { activated: true as const, reward };
}

export async function maybeGrantReferralRewards(referrerId: string) {
  const prisma = getPrisma();
  const [activations, rewards] = await Promise.all([
    prisma.referralActivation.count({ where: { referrerId } }),
    prisma.referralReward.count({ where: { referrerId } })
  ]);

  const earnedBatches = Math.floor(activations / REFERRAL_BATCH_SIZE);
  if (earnedBatches <= rewards) {
    return {
      granted: false as const,
      activations,
      rewards,
      progress: activations % REFERRAL_BATCH_SIZE
    };
  }

  const rewardId = `referral_${referrerId}_${rewards + 1}_${Date.now()}`;
  const providerRef = `referral:reward:${rewardId}`;
  const sub = await grantPremiumMonthServer(referrerId, providerRef);

  await prisma.referralReward.create({
    data: {
      referrerId,
      expiresAt: sub.expiresAt,
      batchSize: REFERRAL_BATCH_SIZE,
      providerRef
    }
  });

  const referrer = await prisma.user.findUnique({
    where: { id: referrerId },
    select: { email: true }
  });

  await writeAuditLog({
    event: 'referral_premium_granted',
    userId: referrerId,
    email: referrer?.email,
    meta: {
      activations,
      rewardIndex: rewards + 1,
      expiresAt: sub.expiresAt.toISOString(),
      providerRef
    }
  });

  return {
    granted: true as const,
    activations,
    rewards: rewards + 1,
    expiresAt: sub.expiresAt.toISOString()
  };
}

export async function getReferralDashboard(userId: string) {
  const prisma = getPrisma();
  const code = await ensureUserReferralCode(userId);
  const [activations, rewards, pendingReferrals] = await Promise.all([
    prisma.referralActivation.count({ where: { referrerId: userId } }),
    prisma.referralReward.findMany({
      where: { referrerId: userId },
      orderBy: { grantedAt: 'desc' },
      take: 5
    }),
    prisma.user.count({
      where: {
        referredByUserId: userId,
        referralActivationReceived: null
      }
    })
  ]);

  const progressInBatch = activations % REFERRAL_BATCH_SIZE;
  const remainingForReward =
    progressInBatch === 0 ? REFERRAL_BATCH_SIZE : REFERRAL_BATCH_SIZE - progressInBatch;

  return {
    code,
    inviteUrl: buildReferralSignupUrl(code),
    whatsappUrl: buildReferralWhatsAppUrl(code),
    batchSize: REFERRAL_BATCH_SIZE,
    activations,
    pendingReferrals,
    remainingForReward,
    progressInBatch,
    rewardsCount: rewards.length,
    lastRewardExpiresAt: rewards[0]?.expiresAt.toISOString() || null,
    rewards: rewards.map((r) => ({
      id: r.id,
      grantedAt: r.grantedAt.toISOString(),
      expiresAt: r.expiresAt.toISOString()
    }))
  };
}
