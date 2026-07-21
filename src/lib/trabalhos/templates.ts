import type { TrabalhoData, TrabalhoTemplateId } from './types';

export interface TrabalhoTemplateMeta {
  id: TrabalhoTemplateId;
  name: string;
  audience: string;
  description: string;
  previewClass: string;
}

export const TRABALHO_TEMPLATES: TrabalhoTemplateMeta[] = [
  {
    id: 'escolar',
    name: 'Escolar',
    audience: 'Ensino fundamental e médio',
    description: 'Capa limpa para trabalhos de escola: série, disciplina e professor.',
    previewClass: 'from-sky-600 to-cyan-500'
  },
  {
    id: 'universitaria',
    name: 'Universitária ABNT',
    audience: 'Faculdade e TCC',
    description: 'Capa clássica ABNT com instituição, autor, título, cidade e ano.',
    previewClass: 'from-slate-800 to-slate-600'
  },
  {
    id: 'folha-rosto',
    name: 'Folha de rosto',
    audience: 'Universidade',
    description: 'Folha de rosto com natureza do trabalho e orientador, no padrão acadêmico.',
    previewClass: 'from-emerald-700 to-teal-600'
  }
];

export function getTrabalhoTemplate(id: TrabalhoTemplateId) {
  return TRABALHO_TEMPLATES.find((item) => item.id === id) ?? TRABALHO_TEMPLATES[0];
}
