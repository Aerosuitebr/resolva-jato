import { emptyAddress, type AddressValue } from '@/lib/address';
import { formatCep } from '@/lib/formatters';

/** Parte genérica usada em contratos, jurídicos e contábeis. */
export interface DocumentPartyValue {
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
  /** Legado: endereço em linha única. */
  address?: string;
}

export const emptyDocumentParty = (): DocumentPartyValue => ({
  name: '',
  document: '',
  nationality: 'brasileiro(a)',
  maritalStatus: '',
  profession: '',
  ...emptyAddress,
  email: '',
  phone: ''
});

export function partyToAddress(party: DocumentPartyValue): AddressValue {
  return {
    cep: party.cep || '',
    street: party.street || '',
    number: party.number || '',
    complement: party.complement || '',
    neighborhood: party.neighborhood || '',
    city: party.city || '',
    state: party.state || ''
  };
}

export function normalizeDocumentParty(value?: Partial<DocumentPartyValue> & { address?: string }): DocumentPartyValue {
  const base = emptyDocumentParty();
  const merged = { ...base, ...value };
  if (!merged.street && value?.address) {
    merged.street = value.address;
  }
  return {
    ...merged,
    cep: merged.cep || '',
    street: merged.street || '',
    number: merged.number || '',
    complement: merged.complement || '',
    neighborhood: merged.neighborhood || '',
    city: merged.city || '',
    state: merged.state || ''
  };
}

/** Monta linha de endereço com CEP primeiro. */
export function formatPartyAddressLine(
  party: Pick<
    DocumentPartyValue,
    'cep' | 'street' | 'number' | 'complement' | 'neighborhood' | 'city' | 'state' | 'address'
  >
): string {
  const parts: string[] = [];
  if (party.cep) parts.push(`CEP ${formatCep(party.cep)}`);
  if (party.street) {
    parts.push(party.number ? `${party.street}, ${party.number}` : party.street);
  } else if (party.address) {
    parts.push(party.address);
  }
  if (party.complement) parts.push(party.complement);
  if (party.neighborhood) parts.push(party.neighborhood);
  const cityState = [party.city, party.state].filter(Boolean).join('/');
  if (cityState) parts.push(cityState);
  return parts.join(', ') || '[endereço completo]';
}
