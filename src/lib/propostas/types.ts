import type { AddressValue } from '@/lib/address';
import type { DigitalSignature } from '@/lib/signatures/types';

export type ProposalStatus = 'rascunho' | 'enviada' | 'aprovada';

/** corporativa = B2B clássica · executiva = consultoria/SOW · criativa = agência/freelancer */
export type ProposalTemplateId = 'corporativa' | 'executiva' | 'criativa';

export interface ProposalCompany {
  name: string;
  document: string;
  email: string;
  phone: string;
  logoDataUrl: string;
  address: AddressValue;
}

export interface ProposalClient {
  name: string;
  document: string;
  contact: string;
  email: string;
  phone: string;
  address: AddressValue;
}

export interface ProposalItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unitPriceInput: string;
}

export interface ProposalData {
  id: string;
  title: string;
  number: string;
  issueDate: string;
  validityDays: number;
  status: ProposalStatus;
  company: ProposalCompany;
  client: ProposalClient;
  items: ProposalItem[];
  discountPercent: number;
  shipping: number;
  shippingInput: string;
  paymentTerms: string;
  deliveryTerms: string;
  introduction: string;
  notes: string;
  templateId: ProposalTemplateId;
  inkSaver: boolean;
  signature: DigitalSignature;
  updatedAt: string;
}

