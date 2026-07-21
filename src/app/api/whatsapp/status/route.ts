import { NextResponse } from 'next/server';
import {
  getEvolutionConfig,
  getWhatsAppProvider,
  isWhatsAppApiConfigured
} from '@/lib/whatsapp/send';

function evolutionHeaders(apiKey: string) {
  return {
    apikey: apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };
}

/** Status + QR da Evolution própria do Resolva Jato. */
export async function GET() {
  const provider = getWhatsAppProvider();
  const evolution = getEvolutionConfig();

  if (!evolution.enabled || !evolution.baseUrl || !evolution.apiKey) {
    return NextResponse.json({
      configured: false,
      provider,
      evolution,
      hint: 'Suba a Evolution com npm run whatsapp:up e configure o .env'
    });
  }

  try {
    const stateRes = await fetch(
      `${evolution.baseUrl}/instance/connectionState/${encodeURIComponent(evolution.instance)}`,
      { headers: evolutionHeaders(evolution.apiKey), cache: 'no-store' }
    );
    const stateBody = stateRes.ok ? await stateRes.json().catch(() => null) : null;
    const state = stateBody?.instance?.state || stateBody?.state || null;

    let qr: string | null = null;
    if (state !== 'open') {
      const connectRes = await fetch(
        `${evolution.baseUrl}/instance/connect/${encodeURIComponent(evolution.instance)}`,
        { headers: evolutionHeaders(evolution.apiKey), cache: 'no-store' }
      );
      if (connectRes.ok) {
        const connect = await connectRes.json().catch(() => null);
        qr =
          connect?.base64 ||
          connect?.qrcode?.base64 ||
          connect?.qr?.base64 ||
          (typeof connect?.code === 'string' && connect.code.startsWith('data:') ? connect.code : null);
      }
    }

    return NextResponse.json({
      configured: isWhatsAppApiConfigured(),
      provider,
      evolution: {
        enabled: evolution.enabled,
        baseUrl: evolution.baseUrl,
        instance: evolution.instance,
        hasApiKey: Boolean(evolution.apiKey),
        state,
        qr
      }
    });
  } catch (error) {
    return NextResponse.json({
      configured: false,
      provider,
      evolution: {
        enabled: evolution.enabled,
        baseUrl: evolution.baseUrl,
        instance: evolution.instance,
        hasApiKey: Boolean(evolution.apiKey),
        state: null,
        qr: null,
        error: error instanceof Error ? error.message : 'Evolution inacessível'
      },
      hint: 'Rode npm run whatsapp:up'
    });
  }
}

/** Cria a instância Evolution do Resolva Jato se ainda não existir. */
export async function POST() {
  const evolution = getEvolutionConfig();
  if (!evolution.enabled || !evolution.baseUrl || !evolution.apiKey) {
    return NextResponse.json({ error: 'Evolution não configurada no .env' }, { status: 503 });
  }

  try {
    const listRes = await fetch(`${evolution.baseUrl}/instance/fetchInstances`, {
      headers: evolutionHeaders(evolution.apiKey),
      cache: 'no-store'
    });
    const list = listRes.ok ? ((await listRes.json().catch(() => [])) as unknown[]) : [];
    const exists = Array.isArray(list)
      ? list.some((row) => {
          const item = row as { name?: string; instanceName?: string; instance?: { instanceName?: string } };
          const name = item?.name || item?.instanceName || item?.instance?.instanceName;
          return name === evolution.instance;
        })
      : false;

    if (!exists) {
      const createRes = await fetch(`${evolution.baseUrl}/instance/create`, {
        method: 'POST',
        headers: evolutionHeaders(evolution.apiKey),
        body: JSON.stringify({
          instanceName: evolution.instance,
          token: evolution.apiKey,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS'
        })
      });
      if (!createRes.ok) {
        const detail = await createRes.text();
        if (!detail.toLowerCase().includes('already')) {
          return NextResponse.json(
            { error: detail.slice(0, 300) || `create HTTP ${createRes.status}` },
            { status: 502 }
          );
        }
      }
    }

    const connectRes = await fetch(
      `${evolution.baseUrl}/instance/connect/${encodeURIComponent(evolution.instance)}`,
      { headers: evolutionHeaders(evolution.apiKey), cache: 'no-store' }
    );
    const connect = connectRes.ok ? await connectRes.json().catch(() => null) : null;
    const qr =
      connect?.base64 ||
      connect?.qrcode?.base64 ||
      connect?.qr?.base64 ||
      (typeof connect?.code === 'string' && connect.code.startsWith('data:') ? connect.code : null);

    return NextResponse.json({
      ok: true,
      instance: evolution.instance,
      created: !exists,
      qr
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao preparar instância' },
      { status: 502 }
    );
  }
}
