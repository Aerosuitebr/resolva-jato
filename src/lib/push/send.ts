import webpush from 'web-push';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { getVapidPrivateKey, getVapidPublicKey, getVapidSubject, isPushConfigured } from '@/lib/push/vapid';

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  playSound?: boolean;
}

export interface SendPushResult {
  sent: number;
  failed: number;
  configured: boolean;
}

function configureWebPush() {
  if (!isPushConfigured()) return false;
  webpush.setVapidDetails(getVapidSubject(), getVapidPublicKey(), getVapidPrivateKey());
  return true;
}

export async function sendPushToOwner(ownerEmail: string, payload: PushPayload): Promise<SendPushResult> {
  const email = ownerEmail.trim().toLowerCase();
  if (!email || !isDatabaseConfigured() || !configureWebPush()) {
    return { sent: 0, failed: 0, configured: isPushConfigured() };
  }

  const prisma = getPrisma();
  const subscriptions = await prisma.pushSubscription.findMany({ where: { ownerEmail: email } });
  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0, configured: true };
  }

  let sent = 0;
  let failed = 0;
  const staleEndpoints: string[] = [];

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
          },
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            url: payload.url || '/ferramentas/orcamentos',
            tag: payload.tag || 'resolva-jato',
            playSound: payload.playSound !== false,
            vibrate: [200, 100, 200, 100, 400],
            requireInteraction: true
          })
        );
        sent += 1;
      } catch (error) {
        failed += 1;
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error
            ? Number((error as { statusCode?: number }).statusCode)
            : 0;
        if (statusCode === 404 || statusCode === 410) {
          staleEndpoints.push(sub.endpoint);
        }
        console.error('[push] send failed', statusCode || error);
      }
    })
  );

  if (staleEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: staleEndpoints } }
    });
  }

  return { sent, failed, configured: true };
}
