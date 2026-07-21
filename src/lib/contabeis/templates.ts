import type { ContabilPartyLabels, ContabilTemplateId } from './types';

export interface ContabilTemplateMeta {
  id: ContabilTemplateId;
  name: string;
  audience: string;
  description: string;
  previewClass: string;
  labels: ContabilPartyLabels;
}

export const CONTABIL_TEMPLATES: ContabilTemplateMeta[] = [
  {
    id: 'servicos-contabeis',
    name: 'Contrato de serviços contábeis',
    audience: 'Escritório de contabilidade',
    description: 'Formalize honorários, escopo mensal e responsabilidades com o cliente.',
    previewClass: 'from-cyan-900 to-slate-800',
    labels: {
      partyA: 'Cliente / empresa',
      partyB: 'Contador / escritório',
      showPartyB: true,
      objectLabel: 'Escopo dos serviços',
      valueLabel: 'Honorários mensais'
    }
  },
  {
    id: 'procuracao-profissional',
    name: 'Procuração (contador / despachante)',
    audience: 'Contador, despachante e preposto',
    description: 'Outorgue poderes para atos junto a órgãos, DETRAN, Receita e cartórios.',
    previewClass: 'from-slate-900 to-cyan-800',
    labels: {
      partyA: 'Outorgante',
      partyB: 'Outorgado (profissional)',
      showPartyB: true,
      objectLabel: 'Atos e órgãos autorizados',
      valueLabel: 'Valor (se houver)'
    }
  },
  {
    id: 'entrega-documentos',
    name: 'Termo de entrega de documentos',
    audience: 'Protocolo e guarda',
    description: 'Registre o que foi entregue, por quem e em qual competência.',
    previewClass: 'from-sky-900 to-slate-800',
    labels: {
      partyA: 'Quem entrega',
      partyB: 'Quem recebe',
      showPartyB: true,
      objectLabel: 'Documentos entregues',
      valueLabel: 'Quantidade / volumes'
    }
  },
  {
    id: 'autorizacao-ecac',
    name: 'Autorização e-CAC / gov.br',
    audience: 'Acesso digital à Receita',
    description: 'Autorize o profissional a representar o contribuinte em sistemas digitais.',
    previewClass: 'from-blue-950 to-cyan-900',
    labels: {
      partyA: 'Contribuinte / responsável',
      partyB: 'Profissional autorizado',
      showPartyB: true,
      objectLabel: 'Sistemas e poderes digitais',
      valueLabel: 'Prazo da autorização'
    }
  },
  {
    id: 'declaracao-residencia',
    name: 'Declaração de residência',
    audience: 'Despachante e cartório',
    description: 'Declare o endereço de residência para processos e órgãos públicos.',
    previewClass: 'from-teal-900 to-slate-800',
    labels: {
      partyA: 'Declarante',
      partyB: '—',
      showPartyB: false,
      objectLabel: 'Endereço declarado',
      valueLabel: 'Desde quando reside'
    }
  },
  {
    id: 'carta-responsabilidade',
    name: 'Carta de responsabilidade',
    audience: 'Administração da empresa',
    description: 'A administração assume responsabilidade pelas informações contábeis fornecidas.',
    previewClass: 'from-indigo-950 to-slate-900',
    labels: {
      partyA: 'Responsável pela empresa',
      partyB: 'Contador / escritório',
      showPartyB: true,
      objectLabel: 'Exercício / demonstrações',
      valueLabel: 'Período coberto'
    }
  }
];

export function getContabilTemplate(id: ContabilTemplateId) {
  return CONTABIL_TEMPLATES.find((item) => item.id === id) ?? CONTABIL_TEMPLATES[0];
}

export function getContabilDocumentTitle(id: ContabilTemplateId) {
  const map: Record<ContabilTemplateId, string> = {
    'servicos-contabeis': 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS CONTÁBEIS',
    'procuracao-profissional': 'PROCURAÇÃO',
    'entrega-documentos': 'TERMO DE ENTREGA E RECEBIMENTO DE DOCUMENTOS',
    'autorizacao-ecac': 'AUTORIZAÇÃO DE ACESSO A SISTEMAS DIGITAIS (e-CAC / GOV.BR)',
    'declaracao-residencia': 'DECLARAÇÃO DE RESIDÊNCIA',
    'carta-responsabilidade': 'CARTA DE RESPONSABILIDADE DA ADMINISTRAÇÃO'
  };
  return map[id];
}
