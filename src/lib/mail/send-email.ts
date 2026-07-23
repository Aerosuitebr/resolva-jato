import nodemailer from 'nodemailer';

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult = { sent: boolean; error?: string; provider?: 'resend' | 'smtp' };

function env(name: string) {
  return process.env[name]?.trim() || '';
}

function defaultFrom() {
  return (
    env('SMTP_FROM') ||
    env('RESEND_FROM') ||
    (env('SMTP_USER') ? `Resolva Jato <${env('SMTP_USER')}>` : 'Resolva Jato <onboarding@resend.dev>')
  );
}

function smtpConfigured() {
  return Boolean(env('SMTP_HOST') && env('SMTP_USER') && env('SMTP_PASS'));
}

async function sendViaResend(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = env('RESEND_API_KEY');
  if (!apiKey) return { sent: false, error: 'RESEND_API_KEY não configurada.' };

  const to = Array.isArray(input.to) ? input.to : [input.to];
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: defaultFrom(),
        to,
        subject: input.subject,
        html: input.html,
        ...(input.text ? { text: input.text } : {})
      })
    });
    if (!response.ok) {
      const text = await response.text();
      return { sent: false, error: text.slice(0, 240) || `Resend HTTP ${response.status}`, provider: 'resend' };
    }
    return { sent: true, provider: 'resend' };
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : 'Falha ao enviar via Resend.',
      provider: 'resend'
    };
  }
}

async function sendViaSmtp(input: SendEmailInput): Promise<SendEmailResult> {
  if (!smtpConfigured()) {
    return { sent: false, error: 'SMTP não configurado (SMTP_HOST/USER/PASS).' };
  }

  const port = Number(env('SMTP_PORT') || '587');
  const secure = env('SMTP_SSL') === 'true' || port === 465;
  const requireTls = env('SMTP_START_TLS').toUpperCase() === 'REQUIRED' || (!secure && port === 587);

  try {
    const transporter = nodemailer.createTransport({
      host: env('SMTP_HOST'),
      port,
      secure,
      requireTLS: requireTls,
      auth: {
        user: env('SMTP_USER'),
        pass: env('SMTP_PASS')
      }
    });

    await transporter.sendMail({
      from: defaultFrom(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text
    });

    return { sent: true, provider: 'smtp' };
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : 'Falha ao enviar via SMTP.',
      provider: 'smtp'
    };
  }
}

/**
 * Preferência: Resend (se houver API key). Senão SMTP (mesmo do Aerosuite / Gmail).
 * Em desenvolvimento, sem nenhum provedor, loga o conteúdo e considera ok.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (env('RESEND_API_KEY')) {
    const resend = await sendViaResend(input);
    if (resend.sent) return resend;
    // Se Resend falhar e houver SMTP, tenta fallback
    if (smtpConfigured()) {
      const smtp = await sendViaSmtp(input);
      if (smtp.sent) return smtp;
      return {
        sent: false,
        error: `Resend: ${resend.error || 'falhou'}; SMTP: ${smtp.error || 'falhou'}`
      };
    }
    return resend;
  }

  if (smtpConfigured()) {
    return sendViaSmtp(input);
  }

  if (process.env.NODE_ENV !== 'production') {
    console.info('[mail] nenhum provedor — e-mail simulado', {
      to: input.to,
      subject: input.subject
    });
    return { sent: true };
  }

  return { sent: false, error: 'Nenhum provedor de e-mail configurado (RESEND_API_KEY ou SMTP_*).' };
}

export function isMailConfigured() {
  return Boolean(env('RESEND_API_KEY') || smtpConfigured());
}
