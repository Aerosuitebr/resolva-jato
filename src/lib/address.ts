export interface AddressValue {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export const emptyAddress: AddressValue = {
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: ''
};

/** Monta o endereço em uma linha para exibição em documentos (CEP primeiro). */
export function formatAddressLine(address: AddressValue): string {
  const parts: string[] = [];
  if (address.cep) parts.push(`CEP ${address.cep}`);
  if (address.street) {
    parts.push(address.number ? `${address.street}, ${address.number}` : address.street);
  }
  if (address.complement) parts.push(address.complement);
  if (address.neighborhood) parts.push(address.neighborhood);
  const cityState = [address.city, address.state].filter(Boolean).join('/');
  if (cityState) parts.push(cityState);
  return parts.join(', ');
}
