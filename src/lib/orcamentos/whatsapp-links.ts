import { formatCurrency } from '@/lib/formatters';
import { withViralMessageBrand } from '@/lib/viral-loop';

function digitsPhone(value: string) {
  const digits = value.replace(/\D+/g, '');
  if (digits.length >= 10 && !digits.startsWith('55')) return `55${digits}`;
  return digits;
}

export function buildProfissionalWhatsAppNotifyText(input: {
  profissionalNome: string;
  clienteNome: string;
  total: number;
  status: 'approved' | 'declined';
  feedbackCliente?: string | null;
  publicUrl: string;
  /** Inclui marca Resolva Jato (plano grátis do profissional). */
  branded?: boolean;
}) {
  const base =
    input.status === 'approved'
      ? `Olá ${input.profissionalNome}! Sou ${input.clienteNome}. Aprovei o orçamento de ${formatCurrency(input.total)}.\n\nLink: ${input.publicUrl}\n\nPodemos seguir?`
      : `Olá ${input.profissionalNome}! Sou ${input.clienteNome}. Pedi ajuste no orçamento de ${formatCurrency(input.total)}.\n\nMotivo: ${input.feedbackCliente || '-'}\n\nLink: ${input.publicUrl}`;
  return withViralMessageBrand(base, input.branded !== false, 'orcamento_notify');
}

export function buildProfissionalWhatsAppNotifyUrl(input: {
  profissionalNome: string;
  profissionalWhatsapp: string;
  clienteNome: string;
  total: number;
  status: 'approved' | 'declined';
  feedbackCliente?: string | null;
  publicUrl: string;
  branded?: boolean;
}) {
  const phone = digitsPhone(input.profissionalWhatsapp);
  const text = buildProfissionalWhatsAppNotifyText(input);
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function buildClienteWhatsAppSendUrl(params: {
  clienteWhatsapp: string;
  clienteNome: string;
  profissionalNome: string;
  url: string;
  total: number;
  branded?: boolean;
}) {
  const phone = digitsPhone(params.clienteWhatsapp);
  const text = buildClienteOrcamentoWhatsAppText({
    clienteNome: params.clienteNome,
    profissionalNome: params.profissionalNome,
    total: params.total,
    url: params.url,
    branded: params.branded
  });
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function buildClienteOrcamentoWhatsAppText(params: {
  clienteNome: string;
  profissionalNome: string;
  total: number;
  url: string;
  branded?: boolean;
}) {
  const base =
    `Olá ${params.clienteNome}! Sou ${params.profissionalNome}.\n\n` +
    `Segue seu orçamento de ${formatCurrency(params.total)} para analisar e aprovar:\n` +
    `${params.url}\n\n` +
    `É só abrir o link, sem criar conta.`;
  return withViralMessageBrand(base, params.branded !== false, 'orcamento_whatsapp');
}
