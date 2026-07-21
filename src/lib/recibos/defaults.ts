import { emptyAddress } from '@/lib/address';
import { createDefaultSignature } from '@/lib/signatures/types';
import type { ReceiptData, ReceiptParty, ReceiptTemplateId } from './types';

function createId() {
  return `rec_${Math.random().toString(36).slice(2, 10)}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function nextNumber() {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `${year}-${seq}`;
}

const emptyParty = (): ReceiptParty => ({ name: '', document: '', email: '', phone: '' });

export function createEmptyReceipt(templateId: ReceiptTemplateId = 'profissional'): ReceiptData {
  return {
    id: createId(),
    title: 'Novo recibo',
    number: nextNumber(),
    amount: 0,
    amountInput: '',
    reference: '',
    paymentMethod: 'Pix',
    city: '',
    date: todayIso(),
    receiver: emptyParty(),
    address: { ...emptyAddress },
    payer: emptyParty(),
    notes: '',
    templateId,
    fontId: 'arial',
    inkSaver: false,
    signature: createDefaultSignature(),
    updatedAt: new Date().toISOString()
  };
}

export const SAMPLE_RECEIPT: ReceiptData = {
  id: createId(),
  title: 'Recibo de exemplo',
  number: nextNumber(),
  amount: 1500,
  amountInput: 'R$ 1.500,00',
  reference: 'Serviços de design gráfico e identidade visual',
  paymentMethod: 'Pix',
  city: 'São Paulo',
  date: todayIso(),
  receiver: {
    name: 'Ana Lima Design',
    document: '123.456.789-09',
    email: 'ana@analimadesign.com.br',
    phone: '(11) 99999-1010'
  },
  address: {
    cep: '01310-100',
    street: 'Av. Paulista',
    number: '1000',
    complement: 'Conjunto 52',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP'
  },
  payer: {
    name: 'Mercado Central Ltda',
    document: '12.345.678/0001-90',
    email: 'financeiro@mercadocentral.com.br',
    phone: '(11) 3333-4444'
  },
  notes: 'Pagamento referente à primeira parcela do contrato.',
  templateId: 'profissional',
  fontId: 'arial',
  inkSaver: false,
  signature: createDefaultSignature('Ana Lima Design'),
  updatedAt: new Date().toISOString()
};

export const PAYMENT_METHODS = ['Pix', 'Dinheiro', 'Transferência bancária', 'Cartão de crédito', 'Cartão de débito', 'Boleto', 'Cheque'];
