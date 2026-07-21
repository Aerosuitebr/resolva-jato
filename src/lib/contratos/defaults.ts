import { buildDefaultClauses } from './clauses';
import type { ContractData, ContractParty, ContractTemplateId } from './types';

function createId() {
  return `ctr_${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyParty(): ContractParty {
  return {
    name: '',
    document: '',
    nationality: 'brasileiro(a)',
    maritalStatus: '',
    profession: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    email: '',
    phone: ''
  };
}

export function createEmptyContrato(templateId: ContractTemplateId = 'prestacao-servicos'): ContractData {
  const base: ContractData = {
    id: createId(),
    title: 'Novo contrato',
    templateId,
    fontId: 'times',
    inkSaver: false,
    partyA: createEmptyParty(),
    partyB: createEmptyParty(),
    objectDescription: '',
    valueLabel: '',
    paymentTerms: '',
    startDate: '',
    endDate: '',
    duration: '',
    city: '',
    state: '',
    signedAt: '',
    witness1: '',
    witness2: '',
    extraNotes: '',
    clauses: [],
    updatedAt: new Date().toISOString()
  };
  return { ...base, clauses: buildDefaultClauses(base) };
}

export const SAMPLE_CONTRATO: ContractData = (() => {
  const sample: ContractData = {
    ...createEmptyContrato('prestacao-servicos'),
    title: 'Contrato de exemplo · design',
    partyA: {
      name: 'Studio Norte Comunicação LTDA',
      document: '12.345.678/0001-90',
      nationality: 'brasileira',
      maritalStatus: 'pessoa jurídica',
      profession: 'agência de comunicação',
      cep: '74013-010',
      street: 'Av. Goiás',
      number: '1200',
      complement: 'Sala 402',
      neighborhood: 'Centro',
      city: 'Goiânia',
      state: 'GO',
      email: 'contato@studionorte.com.br',
      phone: '(62) 3333-4400'
    },
    partyB: {
      name: 'Mariana Alves Costa',
      document: '123.456.789-00',
      nationality: 'brasileira',
      maritalStatus: 'solteira',
      profession: 'designer gráfica',
      cep: '74000-000',
      street: 'Rua das Palmeiras',
      number: '85',
      complement: 'Apto 202',
      neighborhood: 'Setor Bueno',
      city: 'Goiânia',
      state: 'GO',
      email: 'mariana.alves@email.com',
      phone: '(62) 98888-1122'
    },
    objectDescription:
      'Criação de identidade visual completa (logotipo, manual de marca e aplicações básicas em cartão e redes sociais) para o lançamento da linha de produtos da Contratante.',
    valueLabel: 'R$ 4.800,00 (quatro mil e oitocentos reais)',
    paymentTerms: '50% na assinatura e 50% na entrega final, via PIX, em até 5 dias úteis após aprovação.',
    startDate: '01/08/2026',
    endDate: '30/09/2026',
    duration: '60 (sessenta) dias',
    city: 'Goiânia',
    state: 'GO',
    signedAt: '01/08/2026',
    witness1: 'Carlos Eduardo Lima',
    witness2: 'Fernanda Ribeiro Santos',
    extraNotes: 'As partes reconhecem que este instrumento é um modelo orientativo e pode ser ajustado conforme a necessidade.'
  };
  return { ...sample, clauses: buildDefaultClauses(sample) };
})();
