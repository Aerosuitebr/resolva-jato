import type { LegalPartyLabels, LegalTemplateId } from './types';

export interface LegalTemplateMeta {
  id: LegalTemplateId;
  name: string;
  audience: string;
  description: string;
  previewClass: string;
  labels: LegalPartyLabels;
}

export const LEGAL_TEMPLATES: LegalTemplateMeta[] = [
  {
    id: 'procuracao',
    name: 'Procuração ad judicia',
    audience: 'Escritório e cliente novo',
    description: 'Outorga poderes ao advogado para atuar em juízo e, se quiser, também fora dele.',
    previewClass: 'from-slate-900 to-amber-800',
    labels: {
      partyA: 'Outorgante (cliente)',
      partyB: 'Outorgado (advogado)',
      showPartyB: true,
      objectLabel: 'Objeto / causa',
      valueLabel: 'Valor da causa (opcional)'
    }
  },
  {
    id: 'honorarios',
    name: 'Contrato de honorários',
    audience: 'Fixo, êxito ou misto',
    description: 'Formalize o mandato, o objeto da atuação e a forma de remuneração do escritório.',
    previewClass: 'from-amber-900 to-stone-800',
    labels: {
      partyA: 'Cliente',
      partyB: 'Advogado / escritório',
      showPartyB: true,
      objectLabel: 'Objeto dos serviços advocatícios',
      valueLabel: 'Honorários'
    }
  },
  {
    id: 'substabelecimento',
    name: 'Substabelecimento',
    audience: 'Com ou sem reserva',
    description: 'Transfira poderes a outro advogado, com ou sem reserva dos seus próprios poderes.',
    previewClass: 'from-indigo-950 to-slate-800',
    labels: {
      partyA: 'Substabelecente',
      partyB: 'Substabelecido',
      showPartyB: true,
      objectLabel: 'Processo / atos',
      valueLabel: 'Valor (se houver)'
    }
  },
  {
    id: 'hipossuficiencia',
    name: 'Declaração de hipossuficiência',
    audience: 'Justiça gratuita',
    description: 'Declare a insuficiência de recursos para requerer gratuidade de justiça.',
    previewClass: 'from-emerald-900 to-teal-800',
    labels: {
      partyA: 'Declarante',
      partyB: '—',
      showPartyB: false,
      objectLabel: 'Processo / ação (opcional)',
      valueLabel: 'Renda declarada (opcional)'
    }
  },
  {
    id: 'notificacao',
    name: 'Notificação extrajudicial',
    audience: 'Cobrança, prazo e interpelação',
    description: 'Interpele formalmente a outra parte com fatos, pedido e prazo para cumprimento.',
    previewClass: 'from-rose-950 to-slate-900',
    labels: {
      partyA: 'Notificante',
      partyB: 'Notificado(a)',
      showPartyB: true,
      objectLabel: 'Assunto',
      valueLabel: 'Valor envolvido (opcional)'
    }
  },
  {
    id: 'peticao-inicial',
    name: 'Petição inicial simplificada',
    audience: 'Prática forense e estudos',
    description: 'Organize partes, fatos, fundamentos e pedidos em uma estrutura inicial editável.',
    previewClass: 'from-blue-950 to-slate-800',
    labels: {
      partyA: 'Autor(a)',
      partyB: 'Réu/Ré',
      showPartyB: true,
      objectLabel: 'Ação / objeto da demanda',
      valueLabel: 'Valor da causa'
    }
  },
  {
    id: 'contestacao',
    name: 'Contestação simplificada',
    audience: 'Defesa e prática acadêmica',
    description: 'Estruture a síntese da demanda, a defesa, as provas e os pedidos finais.',
    previewClass: 'from-violet-950 to-slate-800',
    labels: {
      partyA: 'Réu/Ré (contestante)',
      partyB: 'Autor(a)',
      showPartyB: true,
      objectLabel: 'Ação / objeto da defesa',
      valueLabel: 'Valor da causa (opcional)'
    }
  },
  {
    id: 'recurso-inominado',
    name: 'Recurso inominado',
    audience: 'Juizados Especiais',
    description: 'Modelo didático para razões recursais contra sentença no Juizado Especial.',
    previewClass: 'from-cyan-950 to-blue-900',
    labels: {
      partyA: 'Recorrente',
      partyB: 'Recorrido(a)',
      showPartyB: true,
      objectLabel: 'Sentença / matéria recorrida',
      valueLabel: 'Valor da causa (opcional)'
    }
  },
  {
    id: 'acordo-extrajudicial',
    name: 'Acordo extrajudicial',
    audience: 'Composição amigável',
    description: 'Registre obrigações, valores, pagamento, quitação e consequências do descumprimento.',
    previewClass: 'from-lime-900 to-emerald-900',
    labels: {
      partyA: 'Primeira parte',
      partyB: 'Segunda parte',
      showPartyB: true,
      objectLabel: 'Objeto do acordo',
      valueLabel: 'Valor do acordo'
    }
  },
  {
    id: 'declaracao-residencia',
    name: 'Declaração de residência',
    audience: 'Cadastros e processos',
    description: 'Formalize o endereço declarado quando for necessário comprovar residência.',
    previewClass: 'from-orange-900 to-stone-800',
    labels: {
      partyA: 'Declarante',
      partyB: '—',
      showPartyB: false,
      objectLabel: 'Finalidade da declaração',
      valueLabel: '—'
    }
  },
  {
    id: 'fichamento-jurisprudencia',
    name: 'Fichamento de jurisprudência',
    audience: 'Estudantes e pesquisadores',
    description: 'Registre identificação do julgado, fatos, tese, fundamentos e conclusão crítica.',
    previewClass: 'from-sky-900 to-indigo-900',
    labels: {
      partyA: 'Estudante / autor do fichamento',
      partyB: '—',
      showPartyB: false,
      objectLabel: 'Identificação do julgado e tema',
      valueLabel: '—'
    }
  },
  {
    id: 'estudo-caso',
    name: 'Estudo de caso jurídico',
    audience: 'Graduação e OAB',
    description: 'Analise um problema jurídico com fatos, questão central, normas e solução fundamentada.',
    previewClass: 'from-purple-900 to-fuchsia-900',
    labels: {
      partyA: 'Estudante / autor',
      partyB: '—',
      showPartyB: false,
      objectLabel: 'Tema e problema jurídico',
      valueLabel: '—'
    }
  },
  {
    id: 'parecer-academico',
    name: 'Parecer jurídico acadêmico',
    audience: 'Trabalhos e avaliações',
    description: 'Estruture consulta, relatório, fundamentação e conclusão em formato de parecer.',
    previewClass: 'from-teal-900 to-cyan-900',
    labels: {
      partyA: 'Parecerista / estudante',
      partyB: 'Interessado(a) (opcional)',
      showPartyB: true,
      objectLabel: 'Consulta / questão jurídica',
      valueLabel: '—'
    }
  },
  {
    id: 'relatorio-audiencia',
    name: 'Relatório de audiência',
    audience: 'Estágio e prática jurídica',
    description: 'Organize dados do processo, participantes, atos realizados e aprendizado obtido.',
    previewClass: 'from-amber-800 to-orange-900',
    labels: {
      partyA: 'Estudante / observador(a)',
      partyB: '—',
      showPartyB: false,
      objectLabel: 'Tipo e objeto da audiência',
      valueLabel: '—'
    }
  },
  {
    id: 'roteiro-peca',
    name: 'Roteiro de peça processual',
    audience: 'OAB e prática simulada',
    description: 'Monte um roteiro de estudo com cabimento, competência, fundamentos e pedidos.',
    previewClass: 'from-rose-900 to-violet-900',
    labels: {
      partyA: 'Estudante / autor',
      partyB: '—',
      showPartyB: false,
      objectLabel: 'Peça e situação-problema',
      valueLabel: '—'
    }
  }
];

export function getLegalTemplate(id: LegalTemplateId) {
  return LEGAL_TEMPLATES.find((item) => item.id === id) ?? LEGAL_TEMPLATES[0];
}

export function getLegalDocumentTitle(id: LegalTemplateId) {
  const map: Record<LegalTemplateId, string> = {
    procuracao: 'PROCURAÇÃO AD JUDICIA ET EXTRA',
    honorarios: 'CONTRATO DE HONORÁRIOS ADVOCATÍCIOS',
    substabelecimento: 'SUBSTABELECIMENTO DE PODERES',
    hipossuficiencia: 'DECLARAÇÃO DE HIPOSSUFICIÊNCIA FINANCEIRA',
    notificacao: 'NOTIFICAÇÃO EXTRAJUDICIAL',
    'peticao-inicial': 'PETIÇÃO INICIAL',
    contestacao: 'CONTESTAÇÃO',
    'recurso-inominado': 'RECURSO INOMINADO',
    'acordo-extrajudicial': 'INSTRUMENTO PARTICULAR DE ACORDO EXTRAJUDICIAL',
    'declaracao-residencia': 'DECLARAÇÃO DE RESIDÊNCIA',
    'fichamento-jurisprudencia': 'FICHAMENTO DE JURISPRUDÊNCIA',
    'estudo-caso': 'ESTUDO DE CASO JURÍDICO',
    'parecer-academico': 'PARECER JURÍDICO ACADÊMICO',
    'relatorio-audiencia': 'RELATÓRIO DE AUDIÊNCIA',
    'roteiro-peca': 'ROTEIRO DE PEÇA PROCESSUAL'
  };
  return map[id];
}
