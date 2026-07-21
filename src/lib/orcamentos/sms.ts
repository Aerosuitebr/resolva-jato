/** SMS via Twilio — chega em qualquer iPhone/Android sem instalar o site. */

export interface SendSmsResult {
  sent: boolean;
  configured: boolean;
  error?: string;
}

function toE164Brazil(phone: string) {
  const digits = phone.replace(/\D+/g, '');
  if (!digits) return '';
  if (digits.startsWith('55') && digits.length >= 12) return `+${digits}`;
  if (digits.length >= 10) return `+55${digits}`;
  return '';
}

export function isSmsConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      process.env.TWILIO_FROM_NUMBER?.trim()
  );
}

export async function sendSmsAlert(toPhone: string, body: string): Promise<SendSmsResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM_NUMBER?.trim();

  if (!accountSid || !authToken || !from) {
    return { sent: false, configured: false, error: 'Twilio não configurado.' };
  }

  const to = toE164Brazil(toPhone);
  if (!to) {
    return { sent: false, configured: true, error: 'Telefone do profissional inválido.' };
  }

  try {
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const params = new URLSearchParams({ To: to, From: from, Body: body.slice(0, 320) });
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      return {
        sent: false,
        configured: true,
        error: detail.slice(0, 200) || `Twilio HTTP ${response.status}`
      };
    }

    return { sent: true, configured: true };
  } catch (error) {
    return {
      sent: false,
      configured: true,
      error: error instanceof Error ? error.message : 'Falha ao enviar SMS.'
    };
  }
}
