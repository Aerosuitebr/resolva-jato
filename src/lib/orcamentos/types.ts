export type OrcamentoStatus = 'pending' | 'approved' | 'declined';

export interface OrcamentoItem {
  id: string;
  nome: string;
  quantidade: number;
  valorUnitario: number;
}

export interface OrcamentoPayload {
  profissionalNome: string;
  profissionalWhatsapp: string;
  clienteNome: string;
  clienteContato?: string;
  clienteEmail?: string;
  itens: OrcamentoItem[];
  validade?: string;
  observacoes?: string;
  ownerEmail?: string | null;
}

export interface OrcamentoPublic {
  id: string;
  profissionalNome: string;
  profissionalWhatsapp: string;
  clienteNome: string;
  clienteContato: string;
  clienteEmail: string;
  itens: OrcamentoItem[];
  total: number;
  validade: string;
  observacoes: string;
  status: OrcamentoStatus;
  feedbackCliente: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrcamentoHistoryItem {
  id: string;
  url: string;
  clienteNome: string;
  clienteContato: string;
  clienteEmail: string;
  profissionalNome: string;
  profissionalWhatsapp: string;
  validade: string;
  observacoes: string;
  itens: OrcamentoItem[];
  total: number;
  status: OrcamentoStatus;
  createdAt: string;
  updatedAt: string;
}

export function calcOrcamentoTotal(itens: OrcamentoItem[]) {
  return itens.reduce((sum, item) => sum + item.quantidade * item.valorUnitario, 0);
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
