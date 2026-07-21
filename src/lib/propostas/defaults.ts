import { emptyAddress } from '@/lib/address';
import { formatCurrencyInput } from '@/lib/formatters';
import { createDefaultSignature } from '@/lib/signatures/types';
import type { ProposalData, ProposalItem, ProposalTemplateId } from './types';

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function nextNumber() {
  const year = new Date().getFullYear();
  const sequence = String(Math.floor(Math.random() * 900) + 100);
  return `PROP-${year}-${sequence}`;
}

export function createProposalItem(): ProposalItem {
  return {
    id: createId('item'),
    name: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    unitPriceInput: ''
  };
}

export function createEmptyProposal(templateId: ProposalTemplateId = 'corporativa'): ProposalData {
  return {
    id: createId('prop'),
    title: 'Nova proposta comercial',
    number: nextNumber(),
    issueDate: todayIso(),
    validityDays: 15,
    status: 'rascunho',
    company: {
      name: '',
      document: '',
      email: '',
      phone: '',
      logoDataUrl: '',
      address: { ...emptyAddress }
    },
    client: {
      name: '',
      document: '',
      contact: '',
      email: '',
      phone: '',
      address: { ...emptyAddress }
    },
    items: [createProposalItem()],
    discountPercent: 0,
    shipping: 0,
    shippingInput: '',
    paymentTerms: '50% na aprovação e 50% na entrega',
    deliveryTerms: 'Prazo a combinar após a aprovação',
    introduction: 'Apresentamos a seguir nossa proposta comercial, elaborada de acordo com as necessidades informadas.',
    notes: 'Esta proposta está sujeita à disponibilidade e à confirmação das condições apresentadas.',
    templateId,
    inkSaver: false,
    signature: createDefaultSignature(),
    updatedAt: new Date().toISOString()
  };
}

export const SAMPLE_PROPOSAL: ProposalData = {
  ...createEmptyProposal(),
  title: 'Proposta de identidade visual',
  company: {
    name: 'Ana Lima Design',
    document: '12.345.678/0001-90',
    email: 'contato@analimadesign.com.br',
    phone: '(11) 99999-1010',
    logoDataUrl: '',
    address: {
      cep: '01310-100',
      street: 'Av. Paulista',
      number: '1000',
      complement: 'Conjunto 52',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP'
    }
  },
  client: {
    name: 'Mercado Central Ltda',
    document: '98.765.432/0001-10',
    contact: 'Marina Souza',
    email: 'marina@mercadocentral.com.br',
    phone: '(11) 3333-4444',
    address: {
      cep: '01001-000',
      street: 'Praça da Sé',
      number: '100',
      complement: '',
      neighborhood: 'Sé',
      city: 'São Paulo',
      state: 'SP'
    }
  },
  items: [
    {
      id: createId('item'),
      name: 'Criação de identidade visual',
      description: 'Logotipo, paleta de cores, tipografia e manual resumido da marca.',
      quantity: 1,
      unitPrice: 2500,
      unitPriceInput: formatCurrencyInput('250000')
    },
    {
      id: createId('item'),
      name: 'Kit para redes sociais',
      description: 'Dez templates editáveis para publicações e stories.',
      quantity: 1,
      unitPrice: 800,
      unitPriceInput: formatCurrencyInput('80000')
    }
  ],
  discountPercent: 5,
  paymentTerms: '50% na aprovação e 50% na entrega final',
  deliveryTerms: 'Até 20 dias úteis após o recebimento do briefing',
  templateId: 'criativa',
  signature: createDefaultSignature('Ana Lima')
};

