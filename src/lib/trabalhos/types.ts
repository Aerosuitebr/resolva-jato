export type TrabalhoTemplateId = 'escolar' | 'universitaria' | 'folha-rosto';

export interface TrabalhoData {
  id: string;
  title: string;
  templateId: TrabalhoTemplateId;
  /** Fonte tipográfica do PDF (Times ou Arial — ABNT). */
  fontId?: string;
  institution: string;
  courseOrGrade: string;
  discipline: string;
  studentName: string;
  workTitle: string;
  subtitle: string;
  teacherOrAdvisor: string;
  workNature: string;
  city: string;
  year: string;
  updatedAt: string;
}
