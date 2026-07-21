export type LegalTemplateId =
  | 'procuracao'
  | 'honorarios'
  | 'substabelecimento'
  | 'hipossuficiencia'
  | 'notificacao'
  | 'peticao-inicial'
  | 'contestacao'
  | 'recurso-inominado'
  | 'acordo-extrajudicial'
  | 'declaracao-residencia'
  | 'fichamento-jurisprudencia'
  | 'estudo-caso'
  | 'parecer-academico'
  | 'relatorio-audiencia'
  | 'roteiro-peca';

export interface LegalParty {
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

export interface LegalClause {
  id: string;
  title: string;
  body: string;
}

export interface LegalDocumentData {
  id: string;
  title: string;
  templateId: LegalTemplateId;
  /** Fonte tipográfica do PDF (Times, Garamond). */
  fontId?: string;
  inkSaver: boolean;
  partyA: LegalParty;
  partyB: LegalParty;
  /** Número da OAB do advogado (quando aplicável). */
  oabNumber: string;
  /** Poderes outorgados / texto de poderes. */
  powers: string;
  /** Substabelecimento com reserva de poderes. */
  reservePowers: boolean;
  caseNumber: string;
  court: string;
  objectDescription: string;
  valueLabel: string;
  paymentTerms: string;
  /** Prazo para cumprimento (notificação). */
  deadline: string;
  /** Fatos / narrativa. */
  facts: string;
  /** Pedido / pretensão. */
  request: string;
  city: string;
  state: string;
  signedAt: string;
  witness1: string;
  witness2: string;
  extraNotes: string;
  clauses: LegalClause[];
  updatedAt: string;
}

export interface LegalPartyLabels {
  partyA: string;
  partyB: string;
  showPartyB: boolean;
  objectLabel: string;
  valueLabel: string;
}
