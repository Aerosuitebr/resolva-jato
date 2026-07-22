import { getViralBaseUrl } from '@/lib/viral-loop';

export const REFERRAL_BATCH_SIZE = 3;
export const REFERRAL_STORAGE_KEY = 'rj_referral_code';

export function normalizeReferralCode(raw: string | null | undefined) {
  const code = (raw || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return code.length >= 4 && code.length <= 16 ? code : '';
}

export function buildReferralSignupUrl(code: string) {
  const base = getViralBaseUrl();
  const params = new URLSearchParams({
    ref: code,
    utm_source: 'referral',
    utm_medium: 'invite',
    utm_campaign: 'premium_3friends'
  });
  return `${base}/cadastro?${params.toString()}`;
}

export function buildReferralWhatsAppUrl(code: string) {
  const link = buildReferralSignupUrl(code);
  const text =
    `Estou usando o Resolva Jato pra orçamento + Pix no WhatsApp.\n` +
    `Cria sua conta por este link (grátis pra testar):\n${link}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
