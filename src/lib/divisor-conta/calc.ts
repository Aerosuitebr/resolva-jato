export interface Pessoa {
  nome: string;
  consumoExtra: number; // valor consumido individualmente além do rateio comum
}

export interface DivisorInput {
  valorTotal: number;
  pessoas: Pessoa[];
  taxaServicoPercentual: number; // ex: 10
  dividirIgualmente: boolean; // se true, ignora consumoExtra e divide tudo igual
}

export interface DivisorResultado {
  nome: string;
  parteComum: number;
  consumoExtra: number;
  taxaServico: number;
  total: number;
}

export interface DivisorResult {
  porPessoa: DivisorResultado[];
  totalComTaxa: number;
  taxaServicoValor: number;
}

export function calcularDivisao(input: DivisorInput): DivisorResult {
  const { valorTotal, pessoas, taxaServicoPercentual, dividirIgualmente } = input;
  const totalExtras = pessoas.reduce((acc, p) => acc + (dividirIgualmente ? 0 : p.consumoExtra), 0);
  const valorComum = Math.max(valorTotal - totalExtras, 0);
  const parteComumPorPessoa = pessoas.length > 0 ? valorComum / pessoas.length : 0;
  const taxaServicoValor = valorTotal * (taxaServicoPercentual / 100);
  const taxaPorPessoa = pessoas.length > 0 ? taxaServicoValor / pessoas.length : 0;

  const porPessoa: DivisorResultado[] = pessoas.map((p) => {
    const parteComum = parteComumPorPessoa;
    const consumoExtra = dividirIgualmente ? 0 : p.consumoExtra;
    const total = parteComum + consumoExtra + taxaPorPessoa;
    return { nome: p.nome, parteComum, consumoExtra, taxaServico: taxaPorPessoa, total };
  });

  const totalComTaxa = valorTotal + taxaServicoValor;

  return { porPessoa, totalComTaxa, taxaServicoValor };
}
