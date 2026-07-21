import { getPrisma } from '@/lib/db';
import { generateSecureToken, hashToken } from '@/lib/auth/password-hash';
import { sendMail } from '@/lib/mail/send-mail';

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24h
const SITE = 'https://resolvajato.com.br';

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

  // Página pública (nunca /api/auth) — reduz falso positivo no Safe Browsing
  return { raw, expiresAt, verifyUrl: `${appUrl()}/verificar-email?token=${raw}` };
}

export async function sendVerificationEmail(input: {
  to: string;
  name: string;
  verifyUrl: string;
}): Promise<{ sent: boolean; error?: string }> {
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.55;color:#0f172a;max-width:560px;margin:0 auto">
      <p style="margin:0 0 8px;font-size:13px;color:#0369a1;font-weight:700">Resolva Jato · ${SITE.replace('https://', '')}</p>
      <h2 style="margin:0 0 12px;font-size:22px">Confirme seu e-mail</h2>
      <p>Olá${input.name ? ` ${input.name}` : ''},</p>
      <p>Recebemos um cadastro na plataforma <strong>Resolva Jato</strong>
        (<a href="${SITE}" style="color:#0369a1">${SITE.replace('https://', '')}</a>).
        Para ativar sua conta e liberar as ferramentas gratuitas, confirme o e-mail:</p>
      <p style="margin:28px 0;text-align:center">
        <a href="${input.verifyUrl}"
           style="display:inline-block;background:#0284c7;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:10px;font-weight:700">
          Confirmar e-mail no Resolva Jato
        </a>
      </p>
      <p style="font-size:13px;color:#475569">Se o botão não funcionar, copie e cole este endereço no navegador:</p>
      <p style="font-size:12px;word-break:break-all;color:#0369a1">${input.verifyUrl}</p>
      <p style="color:#64748b;font-size:13px;margin-top:24px">
        O link expira em 24 horas. Se você não criou esta conta, ignore este e-mail — nenhuma ação será tomada.
      </p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0" />
      <p style="color:#94a3b8;font-size:12px;margin:0">
        Resolva Jato · ferramentas para autônomos e pequenos negócios<br/>
        <a href="${SITE}" style="color:#64748b">${SITE}</a>
        · <a href="${SITE}/privacidade" style="color:#64748b">Privacidade</a>
        · <a href="${SITE}/contato" style="color:#64748b">Contato</a>
      </p>
    </div>
  `;

  const result = await sendMail({
    to: input.to,
    subject: 'Confirme seu e-mail — Resolva Jato (resolvajato.com.br)',
    html,
    text: [
      'Resolva Jato — https://resolvajato.com.br',
      '',
      `Olá${input.name ? ` ${input.name}` : ''},`,
      '',
      'Confirme seu e-mail para ativar a conta no Resolva Jato:',
      input.verifyUrl,
      '',
      'O link expira em 24 horas. Se você não criou esta conta, ignore este e-mail.',
      '',
      'Privacidade: https://resolvajato.com.br/privacidade',
      'Contato: https://resolvajato.com.br/contato'
    ].join('\n')
  });

  if (!result.sent && process.env.NODE_ENV !== 'production') {
    console.info('[auth] falha no envio — link de verificação:', input.verifyUrl, result.error);
  }

  return result;
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
