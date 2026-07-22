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
  return `Documento gerado pelo Resolva Jato - documentos profissionais totalmente gratuitos. ${VIRAL_SITE_HOST}`;
}

export function viralPdfFooterUrl() {
  return viralHomeUrl('pdf_footer');
}

/** Bloco de marca para WhatsApp / e-mail (plano grátis). */
export function viralMessageBrandBlock(utmCampaign = 'whatsapp_message') {
  return (
    `\n\n—\n` +
    `Enviado pelo Resolva Jato — cobranças e documentos profissionais gratuitos.\n` +
    viralHomeUrl(utmCampaign)
  );
}

const VIRAL_MESSAGE_BRAND_RE =
  /\n\n—\nEnviado pelo Resolva Jato[^\n]*\nhttps?:\/\/[^\n]+$/i;

export function stripViralMessageBrand(text: string) {
  return text.replace(VIRAL_MESSAGE_BRAND_RE, '').trimEnd();
}

/**
 * Garante (ou remove) a referência Resolva Jato no final da mensagem.
 * No plano pago (`branded=false`) a marca é retirada; no grátis é forçada no servidor.
 */
export function withViralMessageBrand(
  text: string,
  branded: boolean,
  utmCampaign = 'whatsapp_message'
) {
  const base = stripViralMessageBrand(text.trimEnd());
  if (!branded) return base;
  return `${base}${viralMessageBrandBlock(utmCampaign)}`;
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
