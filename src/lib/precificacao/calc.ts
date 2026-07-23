export interface PrecificacaoInput {
  custoDireto: number; // material, insumos, custo do produto
  custosFixosMensais: number;
  vendasMensaisEstimadas: number;
  horasTrabalhadas: number; // horas gastas nesse produto/serviço, por unidade
  valorHora: number; // quanto a pessoa quer ganhar por hora
  taxasCartaoPercentual: number; // %, ex: 4.99
  impostoPercentual: number; // %, ex: 6 (simples)
  margemLucroDesejadaPercentual: number; // %, ex: 20
}

export interface PrecificacaoResult {
  custoFixoRateado: number;
  custoMaoDeObra: number;
  custoTotal: number;
  precoAntesImpostosTaxas: number;
  precoFinal: number;
  lucroLiquidoPorVenda: number;
  margemLiquidaReal: number; // %
  markup: number; // multiplicador sobre custo direto
}

export function calcularPrecificacao(input: PrecificacaoInput): PrecificacaoResult {
  const {
    custoDireto,
    custosFixosMensais,
    vendasMensaisEstimadas,
    horasTrabalhadas,
    valorHora,
    taxasCartaoPercentual,
    impostoPercentual,
    margemLucroDesejadaPercentual
  } = input;

  const custoFixoRateado = vendasMensaisEstimadas > 0 ? custosFixosMensais / vendasMensaisEstimadas : 0;
  const custoMaoDeObra = horasTrabalhadas * valorHora;
  const custoTotal = custoDireto + custoFixoRateado + custoMaoDeObra;

  const percentualDescontos = (taxasCartaoPercentual + impostoPercentual + margemLucroDesejadaPercentual) / 100;
  const divisor = 1 - percentualDescontos;

  const precoFinal = divisor > 0 ? custoTotal / divisor : custoTotal;
  const precoAntesImpostosTaxas = custoTotal / (1 - margemLucroDesejadaPercentual / 100 || 1);

  const custosVariaveisSobrePreco = precoFinal * ((taxasCartaoPercentual + impostoPercentual) / 100);
  const lucroLiquidoPorVenda = precoFinal - custoTotal - custosVariaveisSobrePreco;
  const margemLiquidaReal = precoFinal > 0 ? (lucroLiquidoPorVenda / precoFinal) * 100 : 0;
  const markup = custoDireto > 0 ? precoFinal / custoDireto : 0;

  return {
    custoFixoRateado,
    custoMaoDeObra,
    custoTotal,
    precoAntesImpostosTaxas,
    precoFinal,
    lucroLiquidoPorVenda,
    margemLiquidaReal,
    markup
  };
}
