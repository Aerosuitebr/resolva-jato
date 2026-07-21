import type { AddressValue } from '@/lib/address';
import type { DigitalSignature } from '@/lib/signatures/types';

export type ReceiptTemplateId = 'profissional' | 'moderno' | 'compacto';

export interface ReceiptParty {
  name: string;
  document: string;
  email: string;
  phone: string;
}

export interface ReceiptData {
  id: string;
  title: string;
  number: string;
  amount: number;
  amountInput: string;
  reference: string;
  paymentMethod: string;
  city: string;
  date: string;
  receiver: ReceiptParty;
  address: AddressValue;
  payer: ReceiptParty;
  notes: string;
  templateId: ReceiptTemplateId;
  /** Fonte tipográfica do PDF (Arial, Calibri, Verdana). */
  fontId?: string;
  /** Sem preenchimentos coloridos — só contornos pretos, para poupar tinta na impressão. */
  inkSaver: boolean;
  signature: DigitalSignature;
  updatedAt: string;
}
