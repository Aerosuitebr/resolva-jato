/**
 * Testa envio SMTP (mesmo padrão Aerosuite).
 * Uso: node --env-file=.env scripts/smoke-email.mjs [destino]
 */
import nodemailer from 'nodemailer';

const to = process.argv[2] || process.env.SMOKE_EMAIL_TO || 'wellemlyra@aerosuite.com.br';
const host = process.env.SMTP_HOST || process.env.QUARKUS_MAILER_HOST;
const port = Number(process.env.SMTP_PORT || process.env.QUARKUS_MAILER_PORT || 587);
const user = process.env.SMTP_USER || process.env.QUARKUS_MAILER_USERNAME;
const pass = process.env.SMTP_PASSWORD || process.env.QUARKUS_MAILER_PASSWORD;
const fromRaw = process.env.SMTP_FROM || process.env.QUARKUS_MAILER_FROM || user;
const from = fromRaw.includes('<') ? fromRaw : `Resolva Jato <${fromRaw}>`;
const secure = String(process.env.SMTP_SSL || process.env.QUARKUS_MAILER_SSL || 'false').toLowerCase() === 'true';

if (!host || !user || !pass) {
  console.error('FAIL: SMTP incompleto (SMTP_HOST/USER/PASSWORD)');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
  requireTLS: true,
  tls: { minVersion: 'TLSv1.2' }
});

const stamp = new Date().toISOString();
try {
  const info = await transporter.sendMail({
    from,
    to,
    subject: `[Resolva Jato] Teste SMTP ${stamp}`,
    text: `Teste de envio SMTP do Resolva Jato em ${stamp}.\nSe você recebeu, o e-mail está funcionando.`,
    html: `<p>Teste de envio SMTP do <strong>Resolva Jato</strong> em <code>${stamp}</code>.</p><p>Se você recebeu, o e-mail está funcionando.</p>`
  });
  console.log(
    JSON.stringify(
      {
        ok: true,
        provider: 'smtp',
        host,
        port,
        from,
        to,
        messageId: info.messageId,
        response: info.response
      },
      null,
      2
    )
  );
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        provider: 'smtp',
        host,
        port,
        from,
        to,
        error: error instanceof Error ? error.message : String(error)
      },
      null,
      2
    )
  );
  process.exit(1);
}
