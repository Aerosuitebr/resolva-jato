import type { ProposalTemplateId } from './types';

export interface ProposalTemplateMeta {
  id: ProposalTemplateId;
  name: string;
  description: string;
  /** Inspirado em propostas reais de mercado */
  inspiration: string;
  previewClass: string;
  recommended?: boolean;
}

export const PROPOSAL_TEMPLATES: ProposalTemplateMeta[] = [
  {
    id: 'corporativa',
    name: 'Corporativa',
    description: 'Tabela clássica, cliente em destaque e totais no padrão B2B.',
    inspiration: 'Modelo PandaDoc / Proposify para serviços gerais',
    previewClass: 'from-sky-600 to-cyan-500',
    recommended: true
  },
  {
    id: 'executiva',
    name: 'Executiva',
    description: 'Capa escura, resumo executivo e linha do tempo de etapas do projeto.',
    inspiration: 'Propostas de consultoria e SaaS enterprise (SOW)',
    previewClass: 'from-slate-800 to-slate-600',
    recommended: true
  },
  {
    id: 'criativa',
    name: 'Criativa',
    description: 'Barra lateral, valor em destaque e itens em cards de escopo.',
    inspiration: 'Agências e freelancers (Bonsai / AND.CO)',
    previewClass: 'from-violet-600 to-fuchsia-500'
  }
];

export function getProposalTemplate(id: ProposalTemplateId) {
  return PROPOSAL_TEMPLATES.find((item) => item.id === id) ?? PROPOSAL_TEMPLATES[0];
}
