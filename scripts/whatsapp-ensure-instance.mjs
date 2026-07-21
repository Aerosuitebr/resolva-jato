/**
 * Garante instância Evolution do Resolva Jato (independente do Aerosuite).
 *
 * Uso:
 *   node --env-file=.env scripts/whatsapp-ensure-instance.mjs
 *   npm run whatsapp:setup
 */

const baseUrl = (process.env.EVOLUTION_API_URL || process.env.WHATSAPP_API_URL || 'http://localhost:18083').replace(
  /\/$/,
  ''
);
const apiKey =
  process.env.WHATSAPP_API_TOKEN ||
  process.env.EVOLUTION_API_KEY ||
  process.env.WHATSAPP_API_KEY ||
  'resolva-jato-evolution-api-key-2026';
const instance = process.env.WHATSAPP_INSTANCE || process.env.WHATSAPP_INSTANCE_NAME || 'resolva-jato';

const headers = {
  apikey: apiKey,
  'Content-Type': 'application/json',
  Accept: 'application/json'
};

async function waitForEvolution(maxAttempts = 40) {
  for (let i = 1; i <= maxAttempts; i += 1) {
    try {
      const res = await fetch(`${baseUrl}/`, { method: 'GET' });
      if (res.ok || res.status === 401 || res.status === 404) {
        console.log(`Evolution OK em ${baseUrl}`);
        return;
      }
    } catch {
      // retry
    }
    console.log(`Aguardando Evolution (${i}/${maxAttempts})...`);
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Evolution não respondeu em ${baseUrl}. Rode: npm run whatsapp:up`);
}

async function fetchInstances() {
  const res = await fetch(`${baseUrl}/instance/fetchInstances`, { headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`fetchInstances HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function instanceExists(list) {
  return list.some((row) => {
    const name = row?.name || row?.instanceName || row?.instance?.instanceName;
    return name === instance;
  });
}

async function createInstance() {
  const res = await fetch(`${baseUrl}/instance/create`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      instanceName: instance,
      token: apiKey,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS'
    })
  });
  const body = await res.text();
  if (!res.ok) {
    // já existe
    if (res.status === 403 || body.toLowerCase().includes('already')) {
      console.log(`Instância "${instance}" já existe.`);
      return null;
    }
    throw new Error(`create HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  console.log(`Instância "${instance}" criada.`);
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

async function connectInstance() {
  const res = await fetch(`${baseUrl}/instance/connect/${encodeURIComponent(instance)}`, {
    method: 'GET',
    headers
  });
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`connect HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  try {
    return JSON.parse(body);
  } catch {
    return { raw: body };
  }
}

async function connectionState() {
  const res = await fetch(`${baseUrl}/instance/connectionState/${encodeURIComponent(instance)}`, {
    method: 'GET',
    headers
  });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

async function main() {
  console.log('=== Resolva Jato · WhatsApp independente ===');
  console.log(`URL: ${baseUrl}`);
  console.log(`Instância: ${instance}`);

  await waitForEvolution();

  const list = await fetchInstances();
  if (!instanceExists(list)) {
    await createInstance();
  } else {
    console.log(`Instância "${instance}" encontrada.`);
  }

  const state = await connectionState();
  const status = state?.instance?.state || state?.state || 'unknown';
  console.log(`Status da conexão: ${status}`);

  if (status === 'open') {
    console.log('WhatsApp já conectado. Envios pela API estão prontos.');
    return;
  }

  const connect = await connectInstance();
  const base64 =
    connect?.base64 ||
    connect?.qrcode?.base64 ||
    connect?.qr?.base64 ||
    (typeof connect?.code === 'string' && connect.code.startsWith('data:') ? connect.code : null);

  if (base64) {
    console.log('');
    console.log('Escaneie o QR Code no WhatsApp (Aparelhos conectados).');
    console.log('QR (base64) disponível na resposta da API /instance/connect/' + instance);
    console.log('Dica: abra http://localhost:18083 no manager da Evolution se disponível,');
    console.log('ou use: GET ' + `${baseUrl}/instance/connect/${instance}` + ' com header apikey.');
  } else {
    console.log('Peça o QR com:');
    console.log(`  curl -H "apikey: ***" ${baseUrl}/instance/connect/${instance}`);
  }

  console.log('');
  console.log('Pronto. Com a sessão open, o Resolva Jato envia WhatsApp sozinho.');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
