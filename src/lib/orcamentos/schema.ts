import type { OrcamentoItem, OrcamentoPayload, OrcamentoStatus } from './types';
import { calcOrcamentoTotal, isValidEmail } from './types';

export interface ValidationResult {
  ok: boolean;
  error?: string;
  data?: OrcamentoPayload & { total: number };
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseItens(value: unknown): OrcamentoItem[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const itens: OrcamentoItem[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') return null;
    const row = raw as Record<string, unknown>;
    const nome = asString(row.nome);
    const quantidade = Number(row.quantidade);
    const valorUnitario = Number(row.valorUnitario);
    if (!nome || !Number.isFinite(quantidade) || quantidade <= 0) return null;
    if (!Number.isFinite(valorUnitario) || valorUnitario < 0) return null;
    itens.push({
      id: asString(row.id) || crypto.randomUUID(),
      nome,
      quantidade,
      valorUnitario
    });
  }
  return itens;
}

export function validateOrcamentoPayload(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Payload inválido.' };
  }
  const data = body as Record<string, unknown>;
  const profissionalNome = asString(data.profissionalNome);
  const profissionalWhatsapp = asString(data.profissionalWhatsapp).replace(/\D+/g, '');
  const clienteNome = asString(data.clienteNome);
  const clienteContato = asString(data.clienteContato);
  const clienteEmail = asString(data.clienteEmail).toLowerCase();
  const validade = asString(data.validade);
  const observacoes = asString(data.observacoes);
  const ownerEmail = asString(data.ownerEmail).toLowerCase() || null;
  const itens = parseItens(data.itens);

  const clienteWhatsapp = clienteContato.replace(/\D+/g, '');

  if (!profissionalNome) return { ok: false, error: 'Informe o nome do profissional ou empresa.' };
  if (profissionalWhatsapp.length < 10) {
    return { ok: false, error: 'Informe o seu WhatsApp com DDD. É nele que você recebe o aviso.' };
  }
  if (!ownerEmail || !isValidEmail(ownerEmail)) {
    return { ok: false, error: 'Informe seu e-mail para receber o alerta quando o cliente responder.' };
  }
  if (!clienteNome) return { ok: false, error: 'Informe o nome do cliente.' };
  if (clienteWhatsapp.length < 10) {
    return { ok: false, error: 'Informe o WhatsApp do cliente com DDD. É para enviar o link a ele.' };
  }
  if (clienteEmail && !isValidEmail(clienteEmail)) {
    return { ok: false, error: 'Informe um e-mail do cliente válido, ou deixe o campo em branco.' };
  }
  if (!itens) return { ok: false, error: 'Adicione ao menos um item com quantidade e valor válidos.' };

  return {
    ok: true,
    data: {
      profissionalNome,
      profissionalWhatsapp,
      clienteNome,
      clienteContato: clienteWhatsapp,
      clienteEmail,
      itens,
      validade,
      observacoes,
      ownerEmail,
      total: calcOrcamentoTotal(itens)
    }
  };
}

export function validateStatusPatch(body: unknown): {
  ok: boolean;
  error?: string;
  status?: OrcamentoStatus;
  feedbackCliente?: string | null;
} {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Payload inválido.' };
  const data = body as Record<string, unknown>;
  const status = asString(data.status) as OrcamentoStatus;
  if (status !== 'approved' && status !== 'declined') {
    return { ok: false, error: 'Status inválido. Use approved ou declined.' };
  }
  const feedbackCliente = asString(data.feedbackCliente) || null;
  if (status === 'declined' && !feedbackCliente) {
    return { ok: false, error: 'Descreva o motivo ou o ajuste desejado.' };
  }
  return { ok: true, status, feedbackCliente };
}
