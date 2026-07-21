import { getPrisma } from '@/lib/db';
import { countUsersForDevice } from '@/lib/security/device-cookie';
import { addToBlacklist } from '@/lib/security/blacklist';

export type RiskAction = 'allow' | 'verify' | 'cooldown' | 'block';

export interface RiskSignals {
  ip: string;
  deviceId: string;
  userAgent?: string | null;
  language?: string | null;
  timezone?: string | null;
  screen?: string | null;
}

export interface RiskResult {
  score: number;
  action: RiskAction;
  reasons: string[];
}

function actionForScore(score: number): RiskAction {
  if (score > 80) return 'block';
  if (score >= 61) return 'cooldown';
  if (score >= 31) return 'verify';
  return 'allow';
}

export async function computeRegistrationRisk(signals: RiskSignals): Promise<RiskResult> {
  const prisma = getPrisma();
  const reasons: string[] = [];
  let score = 0;
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const since1h = new Date(Date.now() - 60 * 60 * 1000);

  if (signals.ip) {
    const ipRegs = await prisma.auditLog.count({
      where: { event: 'register', ip: signals.ip, createdAt: { gte: since24h } }
    });
    if (ipRegs >= 1) {
      score += 30;
      reasons.push('same_ip');
    }
  }

  if (signals.deviceId) {
    const linkedUsers = await countUsersForDevice(signals.deviceId);
    if (linkedUsers >= 1) {
      score += 50;
      reasons.push('same_device_cookie');
    }
  }

  if (signals.userAgent) {
    const uaCount = await prisma.auditLog.count({
      where: {
        event: 'register',
        userAgent: signals.userAgent,
        createdAt: { gte: since24h }
      }
    });
    if (uaCount >= 2) {
      score += 10;
      reasons.push('same_user_agent');
    }
  }

  if (signals.language) {
    // sinal fraco — não consulta JSON path (evita queries frágeis)
    score += 0;
  }

  if (signals.timezone) {
    score += 0;
  }

  if (signals.screen) {
    score += 0;
  }

  if (signals.ip) {
    const recentDeviceBurst = await prisma.auditLog.count({
      where: {
        event: 'register',
        ip: signals.ip,
        createdAt: { gte: since1h }
      }
    });
    if (recentDeviceBurst >= 2) {
      score += 30;
      reasons.push('short_interval_same_ip');
    }
  }

  const action = actionForScore(score);

  if (action === 'block' && signals.ip) {
    await addToBlacklist({
      type: 'ip',
      value: signals.ip,
      reason: `risk_score_${score}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
  }

  if (action === 'block' && signals.deviceId) {
    await addToBlacklist({
      type: 'device',
      value: signals.deviceId,
      reason: `risk_score_${score}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
  }

  return { score, action, reasons };
}
