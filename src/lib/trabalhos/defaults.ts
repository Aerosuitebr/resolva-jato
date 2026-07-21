import type { TrabalhoData, TrabalhoTemplateId } from './types';

function createId() {
  return `trab_${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyTrabalho(templateId: TrabalhoTemplateId = 'escolar'): TrabalhoData {
  return {
    id: createId(),
    title: 'Nova capa de trabalho',
    templateId,
    fontId: 'times',
    institution: '',
    courseOrGrade: '',
    discipline: '',
    studentName: '',
    workTitle: '',
    subtitle: '',
    teacherOrAdvisor: '',
    workNature: 'Trabalho apresentado como requisito parcial da disciplina.',
    city: '',
    year: String(new Date().getFullYear()),
    updatedAt: new Date().toISOString()
  };
}

export const SAMPLE_TRABALHO: TrabalhoData = {
  ...createEmptyTrabalho('universitaria'),
  title: 'Capa de exemplo',
  institution: 'Universidade Federal de Goiás',
  courseOrGrade: 'Curso de Administração',
  discipline: 'Gestão de Projetos',
  studentName: 'Ana Clara Mendes',
  workTitle: 'Planejamento estratégico em pequenas empresas',
  subtitle: 'Um estudo de caso no comércio local',
  teacherOrAdvisor: 'Prof. Dr. Marcos Oliveira',
  workNature:
    'Trabalho apresentado à disciplina Gestão de Projetos do Curso de Administração da Universidade Federal de Goiás, como requisito parcial para obtenção de nota.',
  city: 'Goiânia',
  year: String(new Date().getFullYear())
};
