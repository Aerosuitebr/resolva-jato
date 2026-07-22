import { getPrisma } from '@/lib/db';
import { generateSecureToken, hashToken } from '@/lib/auth/password-hash';

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24h

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export async function createEmailVerificationToken(userId: string) {
  const prisma = getPrisma();
  const raw = generateSecureToken(32);
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.emailVerificationToken.create({
    data: { userId, tokenHash, expiresAt }
  });

  return { raw, expiresAt, verifyUrl: `${appUrl()}/api/auth/verify-email?token=${raw}` };
}

export async function sendVerificationEmail(input: {
  to: string;
  name: string;
  verifyUrl: string;
}): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim() || 'Resolva Jato <onboarding@resend.dev>';

  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[auth] RESEND_API_KEY ausente — link de verificação:', input.verifyUrl);
      return { sent: true };
    }
    return { sent: false, error: 'RESEND_API_KEY não configurada.' };
  }

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;max-width:560px">
      <h2 style="margin:0 0 12px">Confirme seu e-mail</h2>
      <p>Olá${input.name ? ` ${input.name}` : ''},</p>
      <p>Para ativar sua conta no Resolva Jato e liberar as ferramentas, confirme seu e-mail:</p>
      <p style="margin:24px 0">
        <a href="${input.verifyUrl}"
           style="display:inline-block;background:#0284c7;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700">
          Confirmar e-mail
        </a>
      </p>
      <p style="color:#64748b;font-size:13px">O link expira em 24 horas. Se você não criou esta conta, ignore este e-mail.</p>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px">Resolva Jato</p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: 'Confirme seu e-mail — Resolva Jato',
        html
      })
    });
    if (!response.ok) {
      const text = await response.text();
      return { sent: false, error: text || `Resend HTTP ${response.status}` };
    }
    return { sent: true };
  } catch (error) {
    return { sent: false, error: error instanceof Error ? error.message : 'Falha ao enviar e-mail.' };
  }
}

export async function consumeVerificationToken(rawToken: string) {
  const prisma = getPrisma();
  const tokenHash = hashToken(rawToken);
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return { ok: false as const, error: 'Link inválido ou expirado.' };
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: now }
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: now }
    }),
    prisma.toolUsage.upsert({
      where: { userId: record.userId },
      create: {
        userId: record.userId,
        availableUses: 5,
        totalConsumed: 0,
        periodDays: 30
      },
      update: {}
    })
  ]);

  return { ok: true as const, user: record.user };
}
