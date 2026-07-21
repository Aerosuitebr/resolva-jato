export type ContractTemplateId =
  | 'prestacao-servicos'
  | 'aluguel-residencial'
  | 'locacao-comercial'
  | 'trabalho'
  | 'compra-venda'
  | 'comodato';

export interface ContractParty {
  name: string;
  document: string;
  nationality: string;
  maritalStatus: string;
  profession: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  email: string;
  phone: string;
  /** @deprecated Prefer street/number/cep. Mantido para documentos antigos. */
  address?: string;
}

export interface ContractClause {
  id: string;
  title: string;
  body: string;
}

export interface ContractData {
  id: string;
  title: string;
  templateId: ContractTemplateId;
  /** Fonte tipográfica do PDF (Times, Garamond, Georgia). */
  fontId?: string;
  inkSaver: boolean;
  partyA: ContractParty;
  partyB: ContractParty;
  objectDescription: string;
  valueLabel: string;
  paymentTerms: string;
  startDate: string;
  endDate: string;
  duration: string;
  city: string;
  state: string;
  signedAt: string;
  witness1: string;
  witness2: string;
  extraNotes: string;
  clauses: ContractClause[];
  updatedAt: string;
}

export interface ContractPartyLabels {
  partyA: string;
  partyB: string;
  objectLabel: string;
  valueLabel: string;
}
