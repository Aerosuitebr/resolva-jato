import { createHash } from 'crypto';
import { getEvolutionConfig, toWhatsAppNumber } from '@/lib/whatsapp/send';

export function evolutionInstanceForOwner(ownerEmail: string) {
  const hash = createHash('sha256').update(ownerEmail.trim().toLowerCase()).digest('hex').slice(0, 16);
  return `rj${hash}`;
}

function headers(apiKey: string) {
  return {
    apikey: apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };
}

function extractQr(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as Record<string, unknown>;
  const nested = (data.qrcode || data.qr) as Record<string, unknown> | undefined;
  const candidates = [data.base64, nested?.base64, data.code, nested?.code];
  for (const value of candidates) {
    if (typeof value === 'string' && value.length > 20) return value;
  }
  return null;
}

function extractState(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as Record<string, unknown>;
  const instance = data.instance as Record<string, unknown> | undefined;
  const state = instance?.state || data.state;
  return typeof state === 'string' ? state : null;
}

async function evoFetch(path: string, init?: RequestInit) {
  const { baseUrl, apiKey, enabled } = getEvolutionConfig();
  if (!enabled || !baseUrl || !apiKey) {
    throw new Error('Evolution não configurada. Rode npm run whatsapp:up');
  }
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { ...headers(apiKey), ...(init?.headers || {}) },
    cache: 'no-store'
  });
  const text = await response.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { ok: response.ok, status: response.status, json, text };
}

export async function listEvolutionInstances() {
  const result = await evoFetch('/instance/fetchInstances');
  if (!result.ok) return [];
  return Array.isArray(result.json) ? result.json : [];
}

export async function ensureOwnerInstance(ownerEmail: string) {
  const instance = evolutionInstanceForOwner(ownerEmail);
  const list = await listEvolutionInstances();
  const exists = list.some((row) => {
    const item = row as { name?: string; instanceName?: string; instance?: { instanceName?: string } };
    const name = item?.name || item?.instanceName || item?.instance?.instanceName;
    return name === instance;
  });

  if (!exists) {
    const created = await evoFetch('/instance/create', {
      method: 'POST',
      body: JSON.stringify({
        instanceName: instance,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS'
      })
    });
    if (!created.ok && !created.text.toLowerCase().includes('already')) {
      throw new Error(created.text.slice(0, 240) || `Falha ao criar instância (${created.status})`);
    }
  }

  return instance;
}

export async function getOwnerSessionStatus(ownerEmail: string) {
  const { baseUrl, enabled } = getEvolutionConfig();
  if (!enabled || !baseUrl) {
    return {
      configured: false,
      instance: null as string | null,
      state: null as string | null,
      qr: null as string | null,
      error: 'Evolution não configurada'
    };
  }

  const instance = await ensureOwnerInstance(ownerEmail);
  const stateRes = await evoFetch(`/instance/connectionState/${encodeURIComponent(instance)}`);
  let state = stateRes.ok ? extractState(stateRes.json) : null;
  let qr: string | null = null;

  if (state !== 'open') {
    const connectRes = await evoFetch(`/instance/connect/${encodeURIComponent(instance)}`);
    if (connectRes.ok) {
      qr = extractQr(connectRes.json);
      const connectState = extractState(connectRes.json);
      if (connectState) state = connectState;
    }
  }

  return {
    configured: true,
    instance,
    state,
    qr,
    error: null as string | null
  };
}

export async function sendWithOwnerSession(params: {
  ownerEmail: string;
  toPhone: string;
  text: string;
  disconnectAfter?: boolean;
}) {
  const status = await getOwnerSessionStatus(params.ownerEmail);
  if (!status.configured || !status.instance) {
    return { sent: false, disconnected: false, error: status.error || 'Evolution indisponível', state: status.state, qr: status.qr };
  }
  if (status.state !== 'open') {
    return {
      sent: false,
      disconnected: false,
      error: 'WhatsApp ainda não conectado. Escaneie o QR com o seu aparelho.',
      state: status.state,
      qr: status.qr
    };
  }

  const to = toWhatsAppNumber(params.toPhone);
  if (!to) {
    return { sent: false, disconnected: false, error: 'Número de destino inválido.', state: status.state, qr: null };
  }

  const sendRes = await evoFetch(`/message/sendText/${encodeURIComponent(status.instance)}`, {
    method: 'POST',
    body: JSON.stringify({ number: to, text: params.text })
  });

  if (!sendRes.ok) {
    return {
      sent: false,
      disconnected: false,
      error: sendRes.text.slice(0, 240) || `Envio HTTP ${sendRes.status}`,
      state: status.state,
      qr: null
    };
  }

  let disconnected = false;
  if (params.disconnectAfter !== false) {
    disconnected = await disconnectOwnerSession(params.ownerEmail);
  }

  return { sent: true, disconnected, error: null as string | null, state: 'open', qr: null };
}

export async function disconnectOwnerSession(ownerEmail: string) {
  const instance = evolutionInstanceForOwner(ownerEmail);
  try {
    await evoFetch(`/instance/logout/${encodeURIComponent(instance)}`, { method: 'DELETE' });
  } catch {
    // continua para deletar
  }
  try {
    const del = await evoFetch(`/instance/delete/${encodeURIComponent(instance)}`, { method: 'DELETE' });
    return del.ok || del.text.toLowerCase().includes('not found');
  } catch {
    return false;
  }
}
