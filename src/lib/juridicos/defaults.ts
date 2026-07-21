import { buildDefaultClauses } from './clauses';
import type { LegalDocumentData, LegalParty, LegalTemplateId } from './types';

function createId() {
  return `jur_${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyParty(): LegalParty {
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

export function createEmptyLegalDocument(templateId: LegalTemplateId = 'procuracao'): LegalDocumentData {
  const base: LegalDocumentData = {
    id: createId(),
    title: 'Novo documento jurídico',
    templateId,
    fontId: 'times',
    inkSaver: false,
    partyA: createEmptyParty(),
    partyB: createEmptyParty(),
    oabNumber: '',
    powers: '',
    reservePowers: true,
    caseNumber: '',
    court: '',
    objectDescription: '',
    valueLabel: '',
    paymentTerms: '',
    deadline: '',
    facts: '',
    request: '',
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

export const SAMPLE_LEGAL_DOCUMENT: LegalDocumentData = (() => {
  const sample: LegalDocumentData = {
    ...createEmptyLegalDocument('procuracao'),
    title: 'Procuração de exemplo · cível',
    partyA: {
      name: 'Ana Paula Ferreira',
      document: '321.654.987-00',
      nationality: 'brasileira',
      maritalStatus: 'casada',
      profession: 'comerciante',
      cep: '74000-010',
      street: 'Rua das Acácias',
      number: '450',
      complement: '',
      neighborhood: 'Centro',
      city: 'Goiânia',
      state: 'GO',
      email: 'ana.ferreira@email.com',
      phone: '(62) 99999-2211'
    },
    partyB: {
      name: 'Dr. Ricardo Mendes Oliveira',
      document: '111.222.333-44',
      nationality: 'brasileiro',
      maritalStatus: 'solteiro',
      profession: 'advogado',
      cep: '74210-010',
      street: 'Av. T-7',
      number: '850',
      complement: 'Sala 1202',
      neighborhood: 'Bueno',
      city: 'Goiânia',
      state: 'GO',
      email: 'ricardo@mendesadv.com.br',
      phone: '(62) 3222-8899'
    },
    oabNumber: 'OAB/GO 45.678',
    powers:
      'propor ações, contestar, recorrer, desistir, transigir, receber e dar quitação, substabelecer com ou sem reserva, e praticar todos os atos necessários',
    objectDescription: 'Ação de cobrança e demais medidas cíveis relacionadas a créditos comerciais da outorgante',
    caseNumber: '',
    court: 'Comarca de Goiânia/GO',
    city: 'Goiânia',
    state: 'GO',
    signedAt: '17/07/2026',
    witness1: 'Juliana Costa Silva',
    witness2: 'Marcos Vinícius Rocha',
    extraNotes: 'Modelo orientativo. Revise poderes especiais conforme a necessidade do caso.'
  };
  return { ...sample, clauses: buildDefaultClauses(sample) };
})();
