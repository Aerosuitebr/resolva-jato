export type TipoRescisao =
  | 'sem-justa-causa'
  | 'pedido-demissao'
  | 'justa-causa'
  | 'acordo-mutuo'
  | 'termino-contrato';

export interface RescisaoInput {
  salario: number;
  admissao: string; // yyyy-mm-dd
  desligamento: string; // yyyy-mm-dd
  tipo: TipoRescisao;
  feriasVencidas: boolean;
  avisoIndenizado: boolean;
  saldoFgts: number; // saldo já depositado, usado só p/ estimar multa de 40%
}

export interface RescisaoResult {
  mesesTrabalhadosAno: number;
  diasTrabalhadosMes: number;
  saldoSalario: number;
  avisoPrevio: number;
  avisoPrevioDias: number;
  decimoTerceiroProporcional: number;
  feriasProporcionais: number;
  tercoFeriasProporcionais: number;
  feriasVencidasValor: number;
  tercoFeriasVencidas: number;
  multaFgts: number;
  totalBruto: number;
  temDireitoSeguroDesemprego: boolean;
  temDireitoSaqueFgts: boolean;
  resumoLinhas: { label: string; value: number; info?: string }[];
}

function diffDias(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** Calcula aviso prévio proporcional (Lei 12.506/2011): 30 dias + 3 por ano completo, máx 90. */
function calcularAvisoPrevioDias(anosCompletos: number) {
  return Math.min(30 + anosCompletos * 3, 90);
}

export function calcularRescisao(input: RescisaoInput): RescisaoResult {
  const admissao = new Date(`${input.admissao}T00:00:00`);
  const desligamento = new Date(`${input.desligamento}T00:00:00`);
  const salario = input.salario;

  const diasTotais = Math.max(diffDias(admissao, desligamento), 0);
  const anosCompletos = Math.floor(diasTotais / 365);

  const avisoPrevioDias =
    input.tipo === 'sem-justa-causa' && input.avisoIndenizado
      ? calcularAvisoPrevioDias(anosCompletos)
      : 0;

  // Projeta a data de saída considerando aviso prévio indenizado (projeta tempo de serviço)
  const dataProjetada = new Date(desligamento);
  dataProjetada.setDate(dataProjetada.getDate() + avisoPrevioDias);

  const mesInicioAno = new Date(dataProjetada.getFullYear(), 0, 1);
  const mesesTrabalhadosAno =
    (dataProjetada.getFullYear() - admissao.getFullYear()) === 0
      ? dataProjetada.getMonth() + (dataProjetada.getDate() >= 15 ? 1 : 0)
      : dataProjetada.getMonth() + (dataProjetada.getDate() >= 15 ? 1 : 0);

  const diaCorte = dataProjetada.getDate();
  const mesesAvos = Math.min(dataProjetada.getMonth() + (diaCorte >= 15 ? 1 : 0), 12);

  const diasTrabalhadosMes = dataProjetada.getDate();
  const saldoSalario = (salario / 30) * Math.min(diasTrabalhadosMes, 30);

  const avisoPrevio = input.avisoIndenizado ? (salario / 30) * avisoPrevioDias : 0;

  const semJustaCausa = input.tipo === 'sem-justa-causa';
  const acordo = input.tipo === 'acordo-mutuo';
  const justaCausa = input.tipo === 'justa-causa';
  const terminoContrato = input.tipo === 'termino-contrato';

  // 13º proporcional: todos exceto justa causa
  const decimoTerceiroProporcional = justaCausa ? 0 : (salario / 12) * mesesAvos * (acordo ? 1 : 1);

  // Férias proporcionais + 1/3: todos exceto justa causa
  const feriasProporcionais = justaCausa ? 0 : (salario / 12) * mesesAvos;
  const tercoFeriasProporcionais = feriasProporcionais / 3;

  const feriasVencidasValor = input.feriasVencidas ? salario : 0;
  const tercoFeriasVencidas = feriasVencidasValor / 3;

  // Multa FGTS 40% só em dispensa sem justa causa; acordo mútuo = 20%
  const percentualMulta = semJustaCausa ? 0.4 : acordo ? 0.2 : 0;
  const multaFgts = input.saldoFgts * percentualMulta;

  const acordoFator = acordo ? 0.5 : 1; // acordo mútuo (art. 484-A): metade do aviso e da multa

  const totalItens = {
    saldoSalario,
    avisoPrevio: avisoPrevio * (acordo ? acordoFator : 1),
    decimoTerceiroProporcional,
    feriasProporcionais,
    tercoFeriasProporcionais,
    feriasVencidasValor,
    tercoFeriasVencidas,
    multaFgts
  };

  const totalBruto = Object.values(totalItens).reduce((acc, v) => acc + v, 0);

  const resumoLinhas: { label: string; value: number; info?: string }[] = [
    { label: 'Saldo de salário', value: totalItens.saldoSalario, info: `${diasTrabalhadosMes} dia(s) trabalhado(s) no mês` },
    { label: '13º salário proporcional', value: totalItens.decimoTerceiroProporcional, info: `${mesesAvos}/12 avos` },
    { label: 'Férias proporcionais', value: totalItens.feriasProporcionais, info: `${mesesAvos}/12 avos` },
    { label: '1/3 sobre férias proporcionais', value: totalItens.tercoFeriasProporcionais }
  ];

  if (input.feriasVencidas) {
    resumoLinhas.push({ label: 'Férias vencidas', value: totalItens.feriasVencidasValor });
    resumoLinhas.push({ label: '1/3 sobre férias vencidas', value: totalItens.tercoFeriasVencidas });
  }

  if (totalItens.avisoPrevio > 0) {
    resumoLinhas.push({
      label: acordo ? 'Aviso prévio indenizado (50%, acordo mútuo)' : 'Aviso prévio indenizado',
      value: totalItens.avisoPrevio,
      info: `${avisoPrevioDias} dia(s)`
    });
  }

  if (totalItens.multaFgts > 0) {
    resumoLinhas.push({
      label: acordo ? 'Multa FGTS (20%, acordo mútuo)' : 'Multa FGTS (40%)',
      value: totalItens.multaFgts,
      info: 'Calculada sobre o saldo de FGTS informado'
    });
  }

  return {
    mesesTrabalhadosAno: mesesAvos,
    diasTrabalhadosMes,
    saldoSalario: totalItens.saldoSalario,
    avisoPrevio: totalItens.avisoPrevio,
    avisoPrevioDias,
    decimoTerceiroProporcional: totalItens.decimoTerceiroProporcional,
    feriasProporcionais: totalItens.feriasProporcionais,
    tercoFeriasProporcionais: totalItens.tercoFeriasProporcionais,
    feriasVencidasValor: totalItens.feriasVencidasValor,
    tercoFeriasVencidas: totalItens.tercoFeriasVencidas,
    multaFgts: totalItens.multaFgts,
    totalBruto,
    temDireitoSeguroDesemprego: semJustaCausa && anosCompletos >= 0,
    temDireitoSaqueFgts: semJustaCausa || acordo || terminoContrato,
    resumoLinhas
  };
}

export const TIPO_RESCISAO_LABEL: Record<TipoRescisao, string> = {
  'sem-justa-causa': 'Dispensa sem justa causa',
  'pedido-demissao': 'Pedido de demissão',
  'justa-causa': 'Dispensa por justa causa',
  'acordo-mutuo': 'Acordo entre as partes (art. 484-A)',
  'termino-contrato': 'Término de contrato / experiência'
};
