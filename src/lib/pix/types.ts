export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

export interface PixPayloadInput {
  key: string;
  keyType: PixKeyType;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  description?: string;
  txid?: string;
}
