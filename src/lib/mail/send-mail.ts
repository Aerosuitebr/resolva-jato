import nodemailer from 'nodemailer';

export type SendMailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export type SendMailResult = { sent: boolean; error?: string; provider?: 'smtp' | 'resend' };

const DEFAULT_FROM = 'Resolva Jato <contato@resolvajato.com.br>';
const DEFAULT_REPLY_TO = 'contato@resolvajato.com.br';

function env(name: string, fallback = '') {
  return (process.env[name] || fallback).trim();
}

/** Compatível com Aerosuite (QUARKUS_MAILER_*) e nomes SMTP_* do Resolva Jato. */
export function getSmtpConfig() {
  const host = env('SMTP_HOST') || env('QUARKUS_MAILER_HOST');
  const port = Number(env('SMTP_PORT') || env('QUARKUS_MAILER_PORT') || '587');
  const user = env('SMTP_USER') || env('QUARKUS_MAILER_USERNAME');
  const pass = env('SMTP_PASSWORD') || env('QUARKUS_MAILER_PASSWORD');
  // From alinhado ao usuário SMTP autenticado (evita aparência de spoofing/phishing)
  const from =
    env('SMTP_FROM') ||
    env('QUARKUS_MAILER_FROM') ||
    env('RESEND_FROM') ||
    (user ? `Resolva Jato <${user}>` : DEFAULT_FROM);
  const replyTo = env('SMTP_REPLY_TO') || env('MAIL_REPLY_TO') || user || DEFAULT_REPLY_TO;
  const secure =
    (env('SMTP_SSL') || env('QUARKUS_MAILER_SSL') || 'false').toLowerCase() === 'true' || port === 465;
  const startTls = (env('SMTP_START_TLS') || env('QUARKUS_MAILER_START_TLS') || 'REQUIRED').toUpperCase();

  return { host, port, user, pass, from, replyTo, secure, startTls };
}

export function isSmtpConfigured() {
  const { host, user, pass } = getSmtpConfig();
  return Boolean(host && user && pass);
}

function formatFrom(from: string) {
  return from.includes('<') ? from : `Resolva Jato <${from}>`;
}

async function sendViaSmtp(input: SendMailInput): Promise<SendMailResult> {
  const cfg = getSmtpConfig();
  if (!cfg.host || !cfg.user || !cfg.pass) {
    return { sent: false, error: 'SMTP não configurado (host/user/password).' };
  }

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
    requireTLS: cfg.startTls === 'REQUIRED' || cfg.startTls === 'TRUE',
    tls: { minVersion: 'TLSv1.2' }
  });

  try {
    await transporter.sendMail({
      from: formatFrom(cfg.from),
      replyTo: cfg.replyTo,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text
    });
    return { sent: true, provider: 'smtp' };
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : 'Falha SMTP ao enviar e-mail.',
      provider: 'smtp'
    };
  }
}

async function sendViaResend(input: SendMailInput): Promise<SendMailResult> {
  const apiKey = env('RESEND_API_KEY');
  const from =
    env('RESEND_FROM') ||
    env('SMTP_FROM') ||
    'Resolva Jato <contato@resolvajato.com.br>';
  const replyTo = env('SMTP_REPLY_TO') || env('MAIL_REPLY_TO') || DEFAULT_REPLY_TO;
  if (!apiKey) {
    return { sent: false, error: 'RESEND_API_KEY não configurada.' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        reply_to: replyTo,
        to: Array.isArray(input.to) ? input.to : [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text
      })
    });
    if (!response.ok) {
      const text = await response.text();
      return { sent: false, error: text || `Resend HTTP ${response.status}`, provider: 'resend' };
    }
    return { sent: true, provider: 'resend' };
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : 'Falha Resend ao enviar e-mail.',
      provider: 'resend'
    };
  }
}

/**
 * Envia e-mail priorizando SMTP (mesmo padrão do Aerosuite / Gmail).
 * Se SMTP falhar ou não estiver configurado, tenta Resend.
 */
export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  if (isSmtpConfigured()) {
    const smtp = await sendViaSmtp(input);
    if (smtp.sent) return smtp;
    // Fallback Resend se SMTP falhar e houver chave
    if (env('RESEND_API_KEY')) {
      const resend = await sendViaResend(input);
      if (resend.sent) return resend;
      return {
        sent: false,
        error: `SMTP: ${smtp.error || 'falha'}; Resend: ${resend.error || 'falha'}`
      };
    }
    return smtp;
  }

  if (env('RESEND_API_KEY')) {
    return sendViaResend(input);
  }

  if (process.env.NODE_ENV !== 'production') {
    console.info('[mail] SMTP/Resend ausentes — e-mail simulado:', {
      to: input.to,
      subject: input.subject
    });
    return { sent: true, provider: undefined };
  }

  return { sent: false, error: 'Nenhum provedor de e-mail configurado (SMTP ou RESEND_API_KEY).' };
}
