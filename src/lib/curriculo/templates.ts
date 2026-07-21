import type { ResumeTemplateMeta } from './types';

export const RESUME_TEMPLATES: ResumeTemplateMeta[] = [
  {
    id: 'professional',
    name: 'Profissional',
    description: 'Layout clássico e elegante para vagas corporativas.',
    accent: '#0f172a',
    previewClass: 'from-slate-900 to-slate-700'
  },
  {
    id: 'modern',
    name: 'Moderno',
    description: 'Visual contemporâneo com destaque lateral em azul.',
    accent: '#0284c7',
    previewClass: 'from-sky-600 to-sky-800'
  },
  {
    id: 'academic',
    name: 'Universitário',
    description: 'Ideal para estágios, primeiro emprego e programas acadêmicos.',
    accent: '#4f46e5',
    previewClass: 'from-indigo-600 to-indigo-800'
  }
];
