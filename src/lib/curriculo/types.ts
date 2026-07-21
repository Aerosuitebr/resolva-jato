export type ResumeTemplateId = 'professional' | 'modern' | 'academic';

export type LanguageLevel = 'nativo' | 'fluente' | 'avancado' | 'intermediario' | 'basico';

export interface ResumeExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  /** @deprecated legado — preferir startDate/endDate */
  period?: string;
}

export interface ResumeEducation {
  id: string;
  institution: string;
  course: string;
  level: string;
  startDate: string;
  endDate: string;
  details: string;
  /** @deprecated legado — preferir startDate/endDate */
  period?: string;
}

export interface ResumeLanguage {
  id: string;
  name: string;
  level: LanguageLevel | string;
}

export interface ResumeCourse {
  id: string;
  name: string;
  institution: string;
  year: string;
  hours: string;
  description: string;
}

export interface ResumeData {
  id: string;
  title: string;
  templateId: ResumeTemplateId;
  /** Fonte tipográfica do PDF (Calibri, Arial, etc.). */
  fontId?: string;
  updatedAt: string;
  personal: {
    fullName: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    summary: string;
  };
  experiences: ResumeExperience[];
  education: ResumeEducation[];
  courses: ResumeCourse[];
  skills: string[];
  languages: ResumeLanguage[];
}

export interface ResumeTemplateMeta {
  id: ResumeTemplateId;
  name: string;
  description: string;
  accent: string;
  previewClass: string;
}

export const LANGUAGE_LEVEL_LABELS: Record<string, string> = {
  nativo: 'Nativo',
  fluente: 'Fluente',
  avancado: 'Avançado',
  intermediario: 'Intermediário',
  basico: 'Básico'
};

export function formatResumePeriod(params: {
  startDate?: string;
  endDate?: string;
  current?: boolean;
  period?: string;
}) {
  const start = (params.startDate || '').trim();
  const end = params.current ? 'Atual' : (params.endDate || '').trim();
  if (start && end) return `${start} – ${end}`;
  if (start) return params.current ? `${start} – Atual` : start;
  if (end) return end;
  return (params.period || '').trim();
}

export function descriptionLines(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^[\s•\-\*]+/, '').trim())
    .filter(Boolean);
}
