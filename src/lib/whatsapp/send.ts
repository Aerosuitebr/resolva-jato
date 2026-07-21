export type WhatsAppProvider = 'evolution' | 'meta' | 'twilio' | 'zapi';

export interface SendWhatsAppResult {
  sent: boolean;
  configured: boolean;
  provider: WhatsAppProvider | null;
  error?: string;
  messageId?: string;
}

function env(name: string) {
  return process.env[name]?.trim() || '';
}

function firstEnv(...names: string[]) {
  for (const name of names) {
    const value = env(name);
    if (value && value.toLowerCase() !== 'none') return value;
  }
  return '';
}

function onlyDigits(value: string) {
  return value.replace(/\D+/g, '');
}

/** Normaliza para E.164 sem +: 5511999999999 (mesmo padrão do Aerosuite). */
export function toWhatsAppNumber(phone: string) {
  let digits = onlyDigits(phone);
  if (!digits) return '';
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  if (digits.length >= 10 && digits.length <= 11) return `55${digits}`;
  return digits;
}

/**
 * Config Evolution alinhada ao Aerosuite:
 * - Host (Next local): EVOLUTION_API_URL=http://localhost:18082
 * - Docker interno: WHATSAPP_API_URL=http://evolution-api:8080
 * - Chave: WHATSAPP_API_TOKEN / EVOLUTION_API_KEY
 * - Instância: WHATSAPP_INSTANCE (padrão: default)
 */
export function getEvolutionConfig() {
  // Preferência: stack próprio do Resolva Jato (não depende do Aerosuite).
  const baseUrl = firstEnv('EVOLUTION_API_URL', 'WHATSAPP_API_URL').replace(/\/$/, '');

  const apiKey = firstEnv('WHATSAPP_API_TOKEN', 'EVOLUTION_API_KEY', 'WHATSAPP_API_KEY');

  const instance = firstEnv('WHATSAPP_INSTANCE', 'WHATSAPP_INSTANCE_NAME') || 'resolva-jato';

  const enabledFlag = firstEnv('WHATSAPP_API_ENABLED');
  const explicitlyDisabled = enabledFlag === 'false' || enabledFlag === '0';

  return {
    baseUrl,
    apiKey,
    instance,
    enabled: !explicitlyDisabled && Boolean(baseUrl && apiKey)
  };
}

export function getWhatsAppProvider(): WhatsAppProvider | null {
  const explicit = env('WHATSAPP_PROVIDER').toLowerCase() as WhatsAppProvider | '';
  if (explicit === 'evolution' || explicit === 'meta' || explicit === 'twilio' || explicit === 'zapi') {
    if (explicit === 'evolution') return getEvolutionConfig().enabled ? 'evolution' : null;
    return explicit;
  }

  if (getEvolutionConfig().enabled) return 'evolution';
  if (env('WHATSAPP_TOKEN') && env('WHATSAPP_PHONE_NUMBER_ID')) return 'meta';
  if (env('TWILIO_ACCOUNT_SID') && env('TWILIO_AUTH_TOKEN') && env('TWILIO_WHATSAPP_FROM')) return 'twilio';
  if (env('WHATSAPP_INSTANCE_ID') && env('WHATSAPP_INSTANCE_TOKEN')) return 'zapi';
  return null;
}

export function isWhatsAppApiConfigured() {
  return getWhatsAppProvider() !== null;
}

async function sendViaEvolution(to: string, text: string): Promise<SendWhatsAppResult> {
  const { baseUrl, apiKey, instance, enabled } = getEvolutionConfig();
  if (!enabled || !baseUrl || !apiKey) {
    return {
      sent: false,
      configured: false,
      provider: 'evolution',
      error: 'Evolution API incompleta (URL/token do Aerosuite).'
    };
  }

  const response = await fetch(`${baseUrl}/message/sendText/${encodeURIComponent(instance)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      apikey: apiKey
    },
    body: JSON.stringify({ number: to, text })
  });

  if (!response.ok) {
    const detail = await response.text();
    return {
      sent: false,
      configured: true,
      provider: 'evolution',
      error: detail.slice(0, 240) || `Evolution HTTP ${response.status}`
    };
  }

  const data = (await response.json().catch(() => ({}))) as { key?: { id?: string }; messageId?: string };
  return {
    sent: true,
    configured: true,
    provider: 'evolution',
    messageId: data.key?.id || data.messageId
  };
}

async function sendViaMeta(to: string, text: string): Promise<SendWhatsAppResult> {
  const token = env('WHATSAPP_TOKEN');
  const phoneNumberId = env('WHATSAPP_PHONE_NUMBER_ID');
  const version = env('WHATSAPP_API_VERSION') || 'v21.0';
  if (!token || !phoneNumberId) {
    return { sent: false, configured: false, provider: 'meta', error: 'Meta Cloud API incompleta.' };
  }

  const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { preview_url: true, body: text }
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    return {
      sent: false,
      configured: true,
      provider: 'meta',
      error: detail.slice(0, 240) || `Meta HTTP ${response.status}`
    };
  }

  const data = (await response.json()) as { messages?: Array<{ id?: string }> };
  return {
    sent: true,
    configured: true,
    provider: 'meta',
    messageId: data.messages?.[0]?.id
  };
}

async function sendViaTwilio(to: string, text: string): Promise<SendWhatsAppResult> {
  const accountSid = env('TWILIO_ACCOUNT_SID');
  const authToken = env('TWILIO_AUTH_TOKEN');
  const from = env('TWILIO_WHATSAPP_FROM');
  if (!accountSid || !authToken || !from) {
    return { sent: false, configured: false, provider: 'twilio', error: 'Twilio WhatsApp incompleto.' };
  }

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const params = new URLSearchParams({
    To: `whatsapp:+${to}`,
    From: from.startsWith('whatsapp:') ? from : `whatsapp:${from}`,
    Body: text.slice(0, 1500)
  });

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
      provider: 'twilio',
      error: detail.slice(0, 240) || `Twilio WhatsApp HTTP ${response.status}`
    };
  }

  const data = (await response.json()) as { sid?: string };
  return { sent: true, configured: true, provider: 'twilio', messageId: data.sid };
}

async function sendViaZapi(to: string, text: string): Promise<SendWhatsAppResult> {
  const instanceId = env('WHATSAPP_INSTANCE_ID');
  const token = env('WHATSAPP_INSTANCE_TOKEN');
  const clientToken = env('WHATSAPP_CLIENT_TOKEN');
  if (!instanceId || !token) {
    return { sent: false, configured: false, provider: 'zapi', error: 'Z-API incompleta.' };
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (clientToken) headers['Client-Token'] = clientToken;

  const response = await fetch(
    `https://api.z-api.io/instances/${encodeURIComponent(instanceId)}/token/${encodeURIComponent(token)}/send-text`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ phone: to, message: text })
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    return {
      sent: false,
      configured: true,
      provider: 'zapi',
      error: detail.slice(0, 240) || `Z-API HTTP ${response.status}`
    };
  }

  const data = (await response.json().catch(() => ({}))) as { messageId?: string; zaapId?: string };
  return {
    sent: true,
    configured: true,
    provider: 'zapi',
    messageId: data.messageId || data.zaapId
  };
}

/** Envia texto via API de WhatsApp (Evolution/Aerosuite, Meta, Twilio ou Z-API). */
export async function sendWhatsAppText(toPhone: string, text: string): Promise<SendWhatsAppResult> {
  const provider = getWhatsAppProvider();
  const to = toWhatsAppNumber(toPhone);

  if (!provider) {
    return { sent: false, configured: false, provider: null, error: 'WhatsApp API não configurada.' };
  }
  if (!to || to.length < 12) {
    return { sent: false, configured: true, provider, error: 'Número de WhatsApp inválido.' };
  }
  if (!text.trim()) {
    return { sent: false, configured: true, provider, error: 'Mensagem vazia.' };
  }

  try {
    if (provider === 'evolution') return await sendViaEvolution(to, text);
    if (provider === 'meta') return await sendViaMeta(to, text);
    if (provider === 'twilio') return await sendViaTwilio(to, text);
    return await sendViaZapi(to, text);
  } catch (error) {
    return {
      sent: false,
      configured: true,
      provider,
      error: error instanceof Error ? error.message : 'Falha ao enviar WhatsApp.'
    };
  }
}
