import { buildDefaultClauses } from './clauses';
import type { ContabilDocumentData, ContabilParty, ContabilTemplateId } from './types';

function createId() {
  return `ctb_${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyParty(): ContabilParty {
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

export function createEmptyContabilDocument(
  templateId: ContabilTemplateId = 'servicos-contabeis'
): ContabilDocumentData {
  const base: ContabilDocumentData = {
    id: createId(),
    title: 'Novo documento contábil',
    templateId,
    fontId: 'times',
    inkSaver: false,
    partyA: createEmptyParty(),
    partyB: createEmptyParty(),
    professionalRegistry: '',
    objectDescription: '',
    valueLabel: '',
    paymentTerms: '',
    periodLabel: '',
    companyDocument: '',
    companyName: '',
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

export const SAMPLE_CONTABIL_DOCUMENT: ContabilDocumentData = (() => {
  const sample: ContabilDocumentData = {
    ...createEmptyContabilDocument('servicos-contabeis'),
    title: 'Serviços contábeis · exemplo',
    partyA: {
      name: 'Comércio Norte LTDA',
      document: '12.345.678/0001-90',
      nationality: 'brasileira',
      maritalStatus: 'pessoa jurídica',
      profession: 'comércio varejista',
      cep: '74000-010',
      street: 'Rua 15',
      number: '200',
      complement: '',
      neighborhood: 'Centro',
      city: 'Goiânia',
      state: 'GO',
      email: 'financeiro@comercionorte.com.br',
      phone: '(62) 3222-1000'
    },
    partyB: {
      name: 'Escritório Silva Contabilidade',
      document: '98.765.432/0001-10',
      nationality: 'brasileira',
      maritalStatus: 'pessoa jurídica',
      profession: 'serviços contábeis',
      cep: '74230-010',
      street: 'Av. T-4',
      number: '900',
      complement: 'Sala 501',
      neighborhood: 'Bueno',
      city: 'Goiânia',
      state: 'GO',
      email: 'contato@silvacontabil.com.br',
      phone: '(62) 3099-5500'
    },
    professionalRegistry: 'CRC/GO 012345/O-6',
    objectDescription:
      'escrituração contábil, apuração de impostos, obrigações acessórias (SPED, DCTF, EFD) e suporte fiscal mensal',
    valueLabel: 'R$ 890,00 (oitocentos e noventa reais) mensais',
    paymentTerms: 'até o dia 10 de cada mês, via PIX',
    companyName: 'Comércio Norte LTDA',
    companyDocument: '12.345.678/0001-90',
    city: 'Goiânia',
    state: 'GO',
    signedAt: '17/07/2026',
    witness1: 'Patrícia Lima Souza',
    witness2: 'Roberto Alves Nunes',
    extraNotes: 'Modelo orientativo. Ajuste o escopo conforme o porte e o regime tributário do cliente.'
  };
  return { ...sample, clauses: buildDefaultClauses(sample) };
})();
