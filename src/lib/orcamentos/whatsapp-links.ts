import { formatCurrency } from '@/lib/formatters';

function digitsPhone(value: string) {
  const digits = value.replace(/\D+/g, '');
  if (digits.length >= 10 && !digits.startsWith('55')) return `55${digits}`;
  return digits;
}

export function buildProfissionalWhatsAppNotifyUrl(input: {
  profissionalNome: string;
  profissionalWhatsapp: string;
  clienteNome: string;
  total: number;
  status: 'approved' | 'declined';
  feedbackCliente?: string | null;
  publicUrl: string;
}) {
  const phone = digitsPhone(input.profissionalWhatsapp);
  const text =
    input.status === 'approved'
      ? `Olá ${input.profissionalNome}! Sou ${input.clienteNome}. Aprovei o orçamento de ${formatCurrency(input.total)}.\n\nLink: ${input.publicUrl}\n\nPodemos seguir?`
      : `Olá ${input.profissionalNome}! Sou ${input.clienteNome}. Pedi ajuste no orçamento de ${formatCurrency(input.total)}.\n\nMotivo: ${input.feedbackCliente || '-'}\n\nLink: ${input.publicUrl}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function buildClienteWhatsAppSendUrl(params: {
  clienteWhatsapp: string;
  clienteNome: string;
  profissionalNome: string;
  url: string;
  total: number;
}) {
  const phone = digitsPhone(params.clienteWhatsapp);
  const text = buildClienteOrcamentoWhatsAppText({
    clienteNome: params.clienteNome,
    profissionalNome: params.profissionalNome,
    total: params.total,
    url: params.url
  });
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function buildClienteOrcamentoWhatsAppText(params: {
  clienteNome: string;
  profissionalNome: string;
  total: number;
  url: string;
}) {
  return `Olá ${params.clienteNome}! Sou ${params.profissionalNome}.\n\nSegue seu orçamento de ${formatCurrency(params.total)} para analisar e aprovar:\n${params.url}\n\nÉ só abrir o link, sem criar conta.`;
}
