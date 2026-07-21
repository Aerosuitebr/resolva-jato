#!/usr/bin/env node
/**
 * Provisiona resolvajato.com.br na conta Cloudflare do Aero Suite
 * e aponta DNS (apex + www) para o tunnel cloudflared existente.
 *
 * Pré-requisitos:
 *   1. Domínio registrado no Registro.br
 *   2. Token API com permissões: Zone:Edit, DNS:Edit
 *      (My Profile → API Tokens → Create Token → Edit zone DNS, ou Custom)
 *
 * Uso (PowerShell):
 *   $env:CLOUDFLARE_API_TOKEN = "seu-token"
 *   node scripts/cloudflare/provision-resolvajato-zone.mjs
 *
 * Conta Aero Suite (AccountTag do tunnel): 4591ec7b63032dc157df648991469050
 * Tunnel ID: 6d599ea8-2354-4c3c-9968-5ded651c92fc
 */

import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '4591ec7b63032dc157df648991469050';
const ZONE_NAME = process.env.ZONE_NAME || 'resolvajato.com.br';
const TUNNEL_ID = process.env.TUNNEL_ID || '6d599ea8-2354-4c3c-9968-5ded651c92fc';
const TUNNEL_CNAME = `${TUNNEL_ID}.cfargotunnel.com`;
const TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, 'provision-resolvajato-result.json');

async function cf(path, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok && json.success !== false, status: res.status, json };
}

function fail(message, detail) {
  const payload = { ok: false, message, detail: detail || null };
  writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.error(message);
  if (detail) console.error(JSON.stringify(detail, null, 2));
  process.exit(1);
}

async function ensureZone() {
  const list = await cf(`/zones?name=${encodeURIComponent(ZONE_NAME)}&account.id=${ACCOUNT_ID}`);
  if (!list.ok) fail('Falha ao listar zones', list.json);
  const existing = list.json.result?.[0];
  if (existing) {
    console.log(`Zone já existe: ${existing.id}`);
    return existing;
  }

  console.log(`Criando zone ${ZONE_NAME} na conta ${ACCOUNT_ID}...`);
  const created = await cf('/zones', {
    method: 'POST',
    body: JSON.stringify({
      name: ZONE_NAME,
      account: { id: ACCOUNT_ID },
      jump_start: false,
      type: 'full'
    })
  });
  if (!created.ok) fail('Falha ao criar zone', created.json);
  return created.json.result;
}

async function upsertCname(zoneId, name, content) {
  const list = await cf(
    `/zones/${zoneId}/dns_records?type=CNAME&name=${encodeURIComponent(name)}`
  );
  if (!list.ok) fail(`Falha ao listar DNS ${name}`, list.json);
  const existing = list.json.result?.[0];
  const body = {
    type: 'CNAME',
    name,
    content,
    ttl: 1,
    proxied: true,
    comment: 'Resolva Jato → Cloudflare Tunnel'
  };

  if (existing) {
    const updated = await cf(`/zones/${zoneId}/dns_records/${existing.id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
    if (!updated.ok) fail(`Falha ao atualizar CNAME ${name}`, updated.json);
    console.log(`CNAME atualizado: ${name} → ${content}`);
    return updated.json.result;
  }

  const created = await cf(`/zones/${zoneId}/dns_records`, {
    method: 'POST',
    body: JSON.stringify(body)
  });
  if (!created.ok) fail(`Falha ao criar CNAME ${name}`, created.json);
  console.log(`CNAME criado: ${name} → ${content}`);
  return created.json.result;
}

async function setSslFlexible(zoneId) {
  const res = await cf(`/zones/${zoneId}/settings/ssl`, {
    method: 'PATCH',
    body: JSON.stringify({ value: 'flexible' })
  });
  if (!res.ok) {
    console.warn('Aviso: não foi possível definir SSL Flexible (pode ajustar no painel).');
    return null;
  }
  console.log('SSL/TLS: Flexible');
  return res.json.result;
}

async function main() {
  if (!TOKEN) {
    fail(
      'Defina CLOUDFLARE_API_TOKEN (Zone:Edit + DNS:Edit na conta Aero Suite).',
      {
        hint: 'https://dash.cloudflare.com/profile/api-tokens',
        accountId: ACCOUNT_ID,
        zone: ZONE_NAME,
        tunnelCname: TUNNEL_CNAME
      }
    );
  }

  const zone = await ensureZone();
  const apex = await upsertCname(zone.id, ZONE_NAME, TUNNEL_CNAME);
  const www = await upsertCname(zone.id, `www.${ZONE_NAME}`, TUNNEL_CNAME);
  await setSslFlexible(zone.id);

  const nameservers = zone.name_servers || zone.original_name_servers || [];
  const result = {
    ok: true,
    accountId: ACCOUNT_ID,
    zoneId: zone.id,
    zoneName: ZONE_NAME,
    tunnelId: TUNNEL_ID,
    tunnelCname: TUNNEL_CNAME,
    dns: { apex: apex?.id, www: www?.id },
    nameservers,
    nextSteps: [
      'No Registro.br → Domínio resolvajato.com.br → DNS → alterar nameservers para os da Cloudflare abaixo.',
      'Aguarde propagação (minutos a algumas horas).',
      'Garanta npm run dev (ou produção) em http://127.0.0.1:3000',
      'Reinicie o serviço Cloudflared no Windows se ainda não tiver as rotas do Resolva Jato.',
      'Teste https://resolvajato.com.br e https://www.resolvajato.com.br'
    ]
  };

  writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log('\n=== Nameservers (cole no Registro.br) ===');
  for (const ns of nameservers) console.log(`  ${ns}`);
  console.log(`\nResultado salvo em ${outPath}`);
}

main().catch((err) => fail(err instanceof Error ? err.message : String(err)));
