import { NextResponse } from 'next/server';
import { assertStrongPassword } from '@/lib/password';
import { hashPassword } from '@/lib/auth/password-hash';
import {
  createEmailVerificationToken,
  sendVerificationEmail
} from '@/lib/auth/email-verification';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { isDisposableEmail, getEmailDomain } from '@/lib/security/disposable-email';
import { verifyTurnstileToken } from '@/lib/security/turnstile';
import { consumeRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';
import { ensureDeviceCookie, linkDeviceToUser } from '@/lib/security/device-cookie';
import { isBlacklisted } from '@/lib/security/blacklist';
import { writeAuditLog } from '@/lib/security/audit';
import { computeRegistrationRisk } from '@/lib/security/risk-score';
import { getClientIp, getClientUserAgent } from '@/lib/security/request-meta';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Banco de dados não configurado.' }, { status: 503 });
    }

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      turnstileToken?: string;
      language?: string;
      timezone?: string;
      screen?: string;
    };

    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();
    const name = (body.name || '').trim() || email.split('@')[0];

    if (!email || !password) {
      return NextResponse.json({ error: 'Informe e-mail e senha.' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 });
    }
    try {
      assertStrongPassword(password);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Senha fraca.' },
        { status: 400 }
      );
    }

    const ip = getClientIp();
    const userAgent = getClientUserAgent();
    const turnstile = await verifyTurnstileToken(body.turnstileToken, ip);
    if (!turnstile.ok) {
      return NextResponse.json({ error: turnstile.error }, { status: 400 });
    }

    if (isDisposableEmail(email)) {
      await writeAuditLog({
        event: 'register_blocked_disposable',
        email,
        ip,
        userAgent,
        meta: { domain: getEmailDomain(email) }
      });
      return NextResponse.json(
        { error: 'Use um e-mail permanente. Endereços temporários não são aceitos.' },
        { status: 400 }
      );
    }

    const deviceId = await ensureDeviceCookie({
      userAgent,
      language: body.language,
      timezone: body.timezone
    });

    const blacklist = await isBlacklisted([
      { type: 'ip', value: ip },
      { type: 'email', value: email },
      { type: 'domain', value: getEmailDomain(email) || '' },
      { type: 'device', value: deviceId }
    ]);
    if (blacklist.blocked) {
      await writeAuditLog({
        event: 'blacklist_hit',
        email,
        ip,
        userAgent,
        deviceId,
        meta: { type: blacklist.entry.type, reason: blacklist.entry.reason }
      });
      return NextResponse.json(
        { error: 'Cadastro temporariamente bloqueado por segurança. Tente mais tarde ou use outro dispositivo.' },
        { status: 403 }
      );
    }

    const rate = await consumeRateLimit({
      key: `register:ip:${ip}`,
      ...RATE_LIMITS.register
    });
    if (!rate.allowed) {
      await writeAuditLog({ event: 'rate_block_register', email, ip, userAgent, deviceId });
      return NextResponse.json(
        {
          error: `Limite de cadastros neste IP atingido. Tente novamente em ${rate.retryAfterSec}s.`
        },
        { status: 429 }
      );
    }

    const risk = await computeRegistrationRisk({
      ip,
      deviceId,
      userAgent,
      language: body.language,
      timezone: body.timezone,
      screen: body.screen
    });

    if (risk.action === 'block') {
      await writeAuditLog({
        event: 'register_blocked_risk',
        email,
        ip,
        userAgent,
        deviceId,
        meta: { score: risk.score, reasons: risk.reasons }
      });
      return NextResponse.json(
        { error: 'Cadastro bloqueado por segurança. Entre em contato se acredita ser um engano.' },
        { status: 403 }
      );
    }

    if (risk.action === 'cooldown') {
      await writeAuditLog({
        event: 'register_cooldown',
        email,
        ip,
        userAgent,
        deviceId,
        meta: { score: risk.score, reasons: risk.reasons }
      });
      return NextResponse.json(
        { error: 'Muitas contas recentes neste dispositivo/rede. Aguarde algumas horas e tente de novo.' },
        { status: 429 }
      );
    }

    const prisma = getPrisma();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe uma conta com este e-mail. Faça login ou recupere o acesso.' },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        riskFlags: risk.reasons.length ? risk.reasons.join(',') : null
      }
    });

    await linkDeviceToUser(deviceId, user.id);

    const { raw, verifyUrl } = await createEmailVerificationToken(user.id);
    const mail = await sendVerificationEmail({ to: email, name, verifyUrl });

    await writeAuditLog({
      event: 'register',
      userId: user.id,
      email,
      ip,
      userAgent,
      deviceId,
      meta: {
        score: risk.score,
        reasons: risk.reasons,
        emailSent: mail.sent,
        language: body.language,
        timezone: body.timezone,
        screen: body.screen,
        // só em dev: ajuda a testar sem Resend
        ...(process.env.NODE_ENV !== 'production' ? { verifyToken: raw } : {})
      }
    });

    return NextResponse.json(
      {
        ok: true,
        requiresEmailVerification: true,
        email,
        emailSent: mail.sent,
        emailError: mail.error,
        message:
          'Conta criada. Confirme o e-mail para liberar as ferramentas profissionais.'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[register]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha no cadastro.' },
      { status: 500 }
    );
  }
}
