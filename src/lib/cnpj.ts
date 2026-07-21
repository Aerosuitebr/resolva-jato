export interface CnpjCompany {
  cnpj: string;
  name: string;
  tradeName: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface BrasilApiCnpjResponse {
  cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string;
  email?: string | null;
  ddd_telefone_1?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  municipio?: string | null;
  uf?: string | null;
  message?: string;
}

/**
 * Consulta CNPJ na BrasilAPI (base pública derivada da Receita Federal).
 * CPF não possui endpoint público equivalente por restrição de privacidade/LGPD.
 */
export async function lookupCnpj(rawCnpj: string): Promise<CnpjCompany | null> {
  const cnpj = rawCnpj.replace(/\D+/g, '');
  if (cnpj.length !== 14) return null;

  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
    headers: { Accept: 'application/json' }
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error('Não foi possível consultar o CNPJ agora.');
  }

  const data = (await response.json()) as BrasilApiCnpjResponse;
  if (!data.razao_social && !data.nome_fantasia) return null;

  const ddd = (data.ddd_telefone_1 || '').replace(/\D+/g, '');
  const phone = ddd.length >= 10 ? ddd : '';

  return {
    cnpj: data.cnpj ?? rawCnpj,
    name: data.razao_social || data.nome_fantasia || '',
    tradeName: data.nome_fantasia || '',
    email: data.email || '',
    phone,
    cep: (data.cep || '').replace(/\D+/g, ''),
    street: data.logradouro || '',
    number: data.numero || '',
    complement: data.complemento || '',
    neighborhood: data.bairro || '',
    city: data.municipio || '',
    state: (data.uf || '').toUpperCase()
  };
}
