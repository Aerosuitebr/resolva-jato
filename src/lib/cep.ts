export interface CepAddress {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

/**
 * Consulta um CEP na API pública ViaCEP e retorna o endereço.
 * Retorna null quando o CEP é inválido ou não encontrado.
 */
export async function lookupCep(rawCep: string): Promise<CepAddress | null> {
  const cep = rawCep.replace(/\D+/g, '');
  if (cep.length !== 8) return null;

  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) {
    throw new Error('Não foi possível consultar o CEP agora.');
  }

  const data = (await response.json()) as ViaCepResponse;
  if (data.erro) return null;

  return {
    cep: data.cep ?? rawCep,
    street: data.logradouro ?? '',
    neighborhood: data.bairro ?? '',
    city: data.localidade ?? '',
    state: (data.uf ?? '').toUpperCase()
  };
}
