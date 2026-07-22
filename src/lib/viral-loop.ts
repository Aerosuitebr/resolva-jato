/** Loops de viralização — links e textos compartilháveis. */

export const VIRAL_SITE_HOST = 'resolvajato.com.br';

export function getViralBaseUrl() {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  return `https://${VIRAL_SITE_HOST}`;
}

export function viralHomeUrl(utmCampaign: string) {
  const base = getViralBaseUrl();
  const params = new URLSearchParams({
    utm_source: 'share',
    utm_medium: 'loop',
    utm_campaign: utmCampaign
  });
  return `${base}/?${params.toString()}`;
}

export function viralOrcamentoSignupPath() {
  const next = encodeURIComponent('/ferramentas/orcamentos');
  return `/cadastro?next=${next}&utm_source=share&utm_medium=orcamento_publico&utm_campaign=quero_cobrar`;
}

export function viralOrcamentoToolPath() {
  return `/ferramentas/orcamentos?utm_source=share&utm_medium=orcamento_publico&utm_campaign=quero_cobrar`;
}

export function viralOrcamentoSignupUrl() {
  return `${getViralBaseUrl()}${viralOrcamentoSignupPath()}`;
}

export function viralOrcamentoToolUrl() {
  return `${getViralBaseUrl()}${viralOrcamentoToolPath()}`;
}

export function viralPdfFooterLabel() {
  return `Criado no Resolva Jato · ${VIRAL_SITE_HOST}`;
}

export function viralPdfFooterUrl() {
  return viralHomeUrl('pdf_footer');
}

/** Mensagem para o profissional indicar o Resolva Jato a um colega. */
export function buildViralInviteWhatsAppText() {
  return (
    `Estou cobrando com orçamento + Pix no WhatsApp pelo Resolva Jato.\n` +
    `Cliente aprova no celular e paga na hora — grátis pra testar:\n` +
    viralHomeUrl('whatsapp_invite')
  );
}

export function buildViralInviteWhatsAppUrl() {
  return `https://wa.me/?text=${encodeURIComponent(buildViralInviteWhatsAppText())}`;
}

/** Texto sugerido após baixar um PDF (currículo, proposta, etc.). */
export function buildViralPdfShareWhatsAppText(docLabel: string) {
  return (
    `Gerei meu ${docLabel} no Resolva Jato — ficou profissional em minutos.\n` +
    `Faça o seu grátis: ${viralHomeUrl('pdf_whatsapp')}`
  );
}

export function buildViralPdfShareWhatsAppUrl(docLabel: string) {
  return `https://wa.me/?text=${encodeURIComponent(buildViralPdfShareWhatsAppText(docLabel))}`;
}
