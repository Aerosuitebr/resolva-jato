import type { ContractPartyLabels, ContractTemplateId } from './types';

export interface ContractTemplateMeta {
  id: ContractTemplateId;
  name: string;
  audience: string;
  description: string;
  previewClass: string;
  labels: ContractPartyLabels;
}

export const CONTRACT_TEMPLATES: ContractTemplateMeta[] = [
  {
    id: 'prestacao-servicos',
    name: 'Prestação de serviços',
    audience: 'Freelancer, PJ e autônomos',
    description: 'Escopo, prazo, valor e obrigações das partes.',
    previewClass: 'from-sky-700 to-slate-800',
    labels: {
      partyA: 'Contratante',
      partyB: 'Contratado(a)',
      objectLabel: 'Objeto dos serviços',
      valueLabel: 'Valor dos honorários'
    }
  },
  {
    id: 'aluguel-residencial',
    name: 'Aluguel residencial',
    audience: 'Casa, apartamento e kitnet',
    description: 'Prazo, aluguel e deveres de locador e locatário.',
    previewClass: 'from-emerald-800 to-teal-700',
    labels: {
      partyA: 'Locador(a)',
      partyB: 'Locatário(a)',
      objectLabel: 'Imóvel locado',
      valueLabel: 'Valor do aluguel'
    }
  },
  {
    id: 'locacao-comercial',
    name: 'Locação comercial',
    audience: 'Loja, sala e ponto',
    description: 'Uso comercial, aluguel e regras do ponto.',
    previewClass: 'from-indigo-900 to-slate-800',
    labels: {
      partyA: 'Locador(a)',
      partyB: 'Locatário(a)',
      objectLabel: 'Imóvel / ponto comercial',
      valueLabel: 'Valor do aluguel'
    }
  },
  {
    id: 'trabalho',
    name: 'Contrato de trabalho',
    audience: 'Experiência e prestação contínua',
    description: 'Função, jornada, remuneração e vínculo.',
    previewClass: 'from-slate-900 to-blue-950',
    labels: {
      partyA: 'Empregador(a)',
      partyB: 'Empregado(a)',
      objectLabel: 'Função / cargo',
      valueLabel: 'Remuneração'
    }
  },
  {
    id: 'compra-venda',
    name: 'Compra e venda',
    audience: 'Bens móveis e veículos',
    description: 'Bem, preço e forma de pagamento.',
    previewClass: 'from-amber-800 to-stone-800',
    labels: {
      partyA: 'Vendedor(a)',
      partyB: 'Comprador(a)',
      objectLabel: 'Bem objeto da venda',
      valueLabel: 'Preço de venda'
    }
  },
  {
    id: 'comodato',
    name: 'Comodato',
    audience: 'Empréstimo gratuito',
    description: 'Cessão gratuita, conservação e devolução.',
    previewClass: 'from-rose-900 to-slate-800',
    labels: {
      partyA: 'Comodante',
      partyB: 'Comodatário(a)',
      objectLabel: 'Bem cedido em comodato',
      valueLabel: 'Valor estimado (referência)'
    }
  }
];

export function getContractTemplate(id: ContractTemplateId) {
  return CONTRACT_TEMPLATES.find((item) => item.id === id) ?? CONTRACT_TEMPLATES[0];
}

export function getContractTitle(id: ContractTemplateId) {
  const map: Record<ContractTemplateId, string> = {
    'prestacao-servicos': 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS',
    'aluguel-residencial': 'CONTRATO DE LOCAÇÃO RESIDENCIAL',
    'locacao-comercial': 'CONTRATO DE LOCAÇÃO COMERCIAL',
    trabalho: 'CONTRATO DE TRABALHO',
    'compra-venda': 'CONTRATO DE COMPRA E VENDA',
    comodato: 'CONTRATO DE COMODATO'
  };
  return map[id];
}
