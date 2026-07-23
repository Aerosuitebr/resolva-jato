// Faixas simplificadas de INSS 2024/2025 (empregado CLT), uso educativo.
const INSS_FAIXAS = [
  { ate: 1518.0, aliquota: 0.075 },
  { ate: 2793.88, aliquota: 0.09 },
  { ate: 4190.83, aliquota: 0.12 },
  { ate: 8157.41, aliquota: 0.14 }
];

const IRRF_FAIXAS = [
  { ate: 2259.2, aliquota: 0, deducao: 0 },
  { ate: 2826.65, aliquota: 0.075, deducao: 169.44 },
  { ate: 3751.05, aliquota: 0.15, deducao: 381.44 },
  { ate: 4664.68, aliquota: 0.225, deducao: 662.77 },
  { ate: Infinity, aliquota: 0.275, deducao: 896.0 }
];

function calcularInss(salario: number): number {
  let total = 0;
  let faixaAnterior = 0;
  for (const faixa of INSS_FAIXAS) {
    const base = Math.min(salario, faixa.ate) - faixaAnterior;
    if (base > 0) total += base * faixa.aliquota;
    faixaAnterior = faixa.ate;
    if (salario <= faixa.ate) break;
  }
  // teto de contribuição
  const teto = INSS_FAIXAS[INSS_FAIXAS.length - 1].ate * 0.14;
  return Math.min(total, teto);
}

function calcularIrrf(baseCalculo: number): number {
  const faixa = IRRF_FAIXAS.find((f) => baseCalculo <= f.ate) ?? IRRF_FAIXAS[IRRF_FAIXAS.length - 1];
  const valor = baseCalculo * faixa.aliquota - faixa.deducao;
  return Math.max(valor, 0);
}

const SALARIO_MINIMO_2025 = 1518.0;

export interface CltInput {
  salarioBruto: number;
  dependentes: number;
  valeTransporte: number;
  planoSaude: number;
}

export interface CltResult {
  salarioBruto: number;
  inss: number;
  irrf: number;
  descontoVt: number;
  planoSaude: number;
  salarioLiquido: number;
  decimoTerceiroLiquidoAnual: number;
  feriasLiquidoAnual: number;
  fgtsMensal: number;
  fgtsAnual: number;
  liquidoMensalEquivalente: number; // considerando 13º e férias diluídos no ano
}

export function simularClt(input: CltInput): CltResult {
  const { salarioBruto, dependentes, valeTransporte, planoSaude } = input;
  const inss = calcularInss(salarioBruto);
  const deducaoDependentes = dependentes * 189.59;
  const baseIrrf = Math.max(salarioBruto - inss - deducaoDependentes, 0);
  const irrf = calcularIrrf(baseIrrf);
  const descontoVt = Math.min(valeTransporte, salarioBruto * 0.06);
  const salarioLiquido = salarioBruto - inss - irrf - descontoVt - planoSaude;

  const decimoTerceiroLiquidoAnual = salarioBruto - inss - irrf;
  const feriasLiquidoAnual = salarioBruto + salarioBruto / 3 - inss - irrf;
  const fgtsMensal = salarioBruto * 0.08;
  const fgtsAnual = fgtsMensal * 12;

  const liquidoMensalEquivalente =
    salarioLiquido + (decimoTerceiroLiquidoAnual + feriasLiquidoAnual - salarioBruto) / 12;

  return {
    salarioBruto,
    inss,
    irrf,
    descontoVt,
    planoSaude,
    salarioLiquido,
    decimoTerceiroLiquidoAnual,
    feriasLiquidoAnual,
    fgtsMensal,
    fgtsAnual,
    liquidoMensalEquivalente
  };
}

export type FaixaMei = 'comercio-industria' | 'servicos' | 'comercio-e-servicos';

const DAS_MEI: Record<FaixaMei, number> = {
  'comercio-industria': SALARIO_MINIMO_2025 * 0.05 + 1,
  servicos: SALARIO_MINIMO_2025 * 0.05 + 5,
  'comercio-e-servicos': SALARIO_MINIMO_2025 * 0.05 + 6
};

const LIMITE_ANUAL_MEI = 81000;

export interface MeiInput {
  faturamentoMensal: number;
  faixa: FaixaMei;
  custosMensais: number;
}

export interface MeiResult {
  faturamentoMensal: number;
  das: number;
  custosMensais: number;
  lucroLiquido: number;
  faturamentoAnualProjetado: number;
  ultrapassaLimite: boolean;
  margemLimiteAnual: number;
}

export function simularMei(input: MeiInput): MeiResult {
  const das = DAS_MEI[input.faixa];
  const lucroLiquido = input.faturamentoMensal - das - input.custosMensais;
  const faturamentoAnualProjetado = input.faturamentoMensal * 12;
  return {
    faturamentoMensal: input.faturamentoMensal,
    das,
    custosMensais: input.custosMensais,
    lucroLiquido,
    faturamentoAnualProjetado,
    ultrapassaLimite: faturamentoAnualProjetado > LIMITE_ANUAL_MEI,
    margemLimiteAnual: LIMITE_ANUAL_MEI - faturamentoAnualProjetado
  };
}

export const FAIXA_MEI_LABEL: Record<FaixaMei, string> = {
  'comercio-industria': 'Comércio ou indústria',
  servicos: 'Serviços',
  'comercio-e-servicos': 'Comércio e serviços combinados'
};

export { LIMITE_ANUAL_MEI };
