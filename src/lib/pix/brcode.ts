import { withViralMessageBrand } from '@/lib/viral-loop';
import type { PixKeyType, PixPayloadInput } from './types';

/** CRC16-CCITT (poly 0x1021, init 0xFFFF) usado no BR Code Pix. */
export function crc16Ccitt(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function tlv(id: string, value: string) {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function sanitizeMerchant(value: string, max: number) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .slice(0, max)
    .toUpperCase();
}

export function normalizePixKey(key: string, keyType: PixKeyType) {
  const trimmed = key.trim();
  if (keyType === 'cpf' || keyType === 'cnpj' || keyType === 'phone') {
    const digits = trimmed.replace(/\D+/g, '');
    if (keyType === 'phone') {
      return digits.startsWith('55') ? `+${digits}` : `+55${digits}`;
    }
    return digits;
  }
  if (keyType === 'email') return trimmed.toLowerCase();
  return trimmed;
}

/**
 * Gera payload EMV Pix estático (BR Code) conforme manual BCB.
 * Valor opcional; txid opcional (padrão ***).
 */
export function buildPixBrCode(input: PixPayloadInput) {
  const key = normalizePixKey(input.key, input.keyType);
  if (!key) return '';

  const name = sanitizeMerchant(input.merchantName || 'RECEBEDOR', 25) || 'RECEBEDOR';
  const city = sanitizeMerchant(input.merchantCity || 'BRASIL', 15) || 'BRASIL';
  const txid = (input.txid || '***').replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) || '***';
  const description = (input.description || '').trim().slice(0, 72);

  const gui = tlv('00', 'br.gov.bcb.pix');
  const keyField = tlv('01', key);
  const descField = description ? tlv('02', description) : '';
  const merchantAccount = tlv('26', `${gui}${keyField}${descField}`);

  const amount =
    typeof input.amount === 'number' && Number.isFinite(input.amount) && input.amount > 0
      ? tlv('54', input.amount.toFixed(2))
      : '';

  const additional = tlv('62', tlv('05', txid));

  const payloadWithoutCrc =
    tlv('00', '01') +
    tlv('01', '11') +
    merchantAccount +
    tlv('52', '0000') +
    tlv('53', '986') +
    amount +
    tlv('58', 'BR') +
    tlv('59', name) +
    tlv('60', city) +
    additional +
    '6304';

  return payloadWithoutCrc + crc16Ccitt(payloadWithoutCrc);
}

export function buildPixWhatsAppMessage(input: {
  merchantName: string;
  amount?: number;
  brCode: string;
  description?: string;
  branded?: boolean;
}) {
  const lines = [
    `Olá! Segue a cobrança Pix de ${input.merchantName || 'Recebedor'}.`,
    input.amount && input.amount > 0
      ? `Valor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(input.amount)}`
      : null,
    input.description ? `Referência: ${input.description}` : null,
    '',
    'Código Pix Copia e Cola:',
    '```',
    input.brCode,
    '```'
  ].filter((line) => line !== null) as string[];

  return withViralMessageBrand(lines.join('\n'), input.branded !== false, 'pix_whatsapp');
}
