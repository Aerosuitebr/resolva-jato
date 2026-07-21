export type ContabilTemplateId =
  | 'servicos-contabeis'
  | 'procuracao-profissional'
  | 'entrega-documentos'
  | 'autorizacao-ecac'
  | 'declaracao-residencia'
  | 'carta-responsabilidade';

export interface ContabilParty {
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
  /** @deprecated Prefer street/number/cep. */
  address?: string;
}

export interface ContabilClause {
  id: string;
  title: string;
  body: string;
}

export interface ContabilDocumentData {
  id: string;
  title: string;
  templateId: ContabilTemplateId;
  /** Fonte tipográfica do PDF (Times, Arial, Calibri). */
  fontId?: string;
  inkSaver: boolean;
  partyA: ContabilParty;
  partyB: ContabilParty;
  /** CRC, despachante credenciado, etc. */
  professionalRegistry: string;
  objectDescription: string;
  valueLabel: string;
  paymentTerms: string;
  /** Lista / período / competência. */
  periodLabel: string;
  /** CNPJ / CPF do contribuinte ou empresa. */
  companyDocument: string;
  companyName: string;
  city: string;
  state: string;
  signedAt: string;
  witness1: string;
  witness2: string;
  extraNotes: string;
  clauses: ContabilClause[];
  updatedAt: string;
}

export interface ContabilPartyLabels {
  partyA: string;
  partyB: string;
  showPartyB: boolean;
  objectLabel: string;
  valueLabel: string;
}
