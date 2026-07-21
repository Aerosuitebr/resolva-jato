import type {
  ResumeCourse,
  ResumeData,
  ResumeEducation,
  ResumeExperience,
  ResumeLanguage,
  ResumeTemplateId
} from './types';

export function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createExperience(partial?: Partial<ResumeExperience>): ResumeExperience {
  return {
    id: createId('exp'),
    company: '',
    role: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    ...partial
  };
}

export function createEducation(partial?: Partial<ResumeEducation>): ResumeEducation {
  return {
    id: createId('edu'),
    institution: '',
    course: '',
    level: '',
    startDate: '',
    endDate: '',
    details: '',
    ...partial
  };
}

export function createCourse(partial?: Partial<ResumeCourse>): ResumeCourse {
  return {
    id: createId('course'),
    name: '',
    institution: '',
    year: '',
    hours: '',
    description: '',
    ...partial
  };
}

export function createLanguage(partial?: Partial<ResumeLanguage>): ResumeLanguage {
  return {
    id: createId('lang'),
    name: '',
    level: 'intermediario',
    ...partial
  };
}

/** Normaliza currículos antigos (period livre, idiomas string[]) para o modelo atual. */
export function normalizeResume(raw: Partial<ResumeData> & Record<string, unknown>): ResumeData {
  const base = createEmptyResume(
    (raw.templateId as ResumeTemplateId) || 'professional'
  );

  const experiences = Array.isArray(raw.experiences)
    ? raw.experiences.map((item) => {
        const row = item as Partial<ResumeExperience> & { period?: string };
        const period = row.period || '';
        let startDate = row.startDate || '';
        let endDate = row.endDate || '';
        let current = Boolean(row.current);
        if (!startDate && period) {
          const parts = period.split(/\s*(?:até|a|–|-|ate)\s*/i);
          startDate = (parts[0] || '').trim();
          const endRaw = (parts[1] || '').trim();
          if (/hoje|atual|presente/i.test(endRaw)) {
            current = true;
            endDate = '';
          } else {
            endDate = endRaw;
          }
        }
        return createExperience({
          id: row.id || createId('exp'),
          company: row.company || '',
          role: row.role || '',
          location: row.location || '',
          startDate,
          endDate,
          current,
          description: row.description || '',
          period
        });
      })
    : base.experiences;

  const education = Array.isArray(raw.education)
    ? raw.education.map((item) => {
        const row = item as Partial<ResumeEducation> & { period?: string };
        const period = row.period || '';
        let startDate = row.startDate || '';
        let endDate = row.endDate || '';
        if (!startDate && period) {
          const parts = period.split(/\s*(?:até|a|–|-|ate)\s*/i);
          startDate = (parts[0] || '').trim();
          endDate = (parts[1] || '').trim();
        }
        return createEducation({
          id: row.id || createId('edu'),
          institution: row.institution || '',
          course: row.course || '',
          level: row.level || '',
          startDate,
          endDate,
          details: row.details || '',
          period
        });
      })
    : base.education;

  const courses = Array.isArray(raw.courses)
    ? raw.courses.map((item) => {
        const row = item as Partial<ResumeCourse>;
        return createCourse({
          id: row.id || createId('course'),
          name: row.name || '',
          institution: row.institution || '',
          year: row.year || '',
          hours: row.hours || '',
          description: row.description || ''
        });
      })
    : [];

  let languages: ResumeLanguage[] = [];
  if (Array.isArray(raw.languages)) {
    languages = (raw.languages as unknown[]).map((item) => {
      if (typeof item === 'string') {
        const match = item.match(/^(.+?)\s*[—(]\s*(.+?)\)?$/);
        if (match) {
          return createLanguage({ name: match[1].trim(), level: match[2].trim().toLowerCase() });
        }
        const parts = item.split(/\s+/);
        if (parts.length >= 2) {
          const level = parts.pop()!.toLowerCase();
          return createLanguage({ name: parts.join(' '), level });
        }
        return createLanguage({ name: item, level: 'intermediario' });
      }
      const row = item as Partial<ResumeLanguage>;
      return createLanguage({
        id: row.id || createId('lang'),
        name: row.name || '',
        level: row.level || 'intermediario'
      });
    });
  }

  const personal = {
    ...base.personal,
    ...(typeof raw.personal === 'object' && raw.personal ? raw.personal : {})
  };

  return {
    id: typeof raw.id === 'string' ? raw.id : base.id,
    title: typeof raw.title === 'string' ? raw.title : base.title,
    templateId: (raw.templateId as ResumeTemplateId) || base.templateId,
    fontId: typeof raw.fontId === 'string' ? raw.fontId : base.fontId,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : base.updatedAt,
    personal,
    experiences: experiences.length ? experiences : [createExperience()],
    education: education.length ? education : [createEducation()],
    courses,
    skills: Array.isArray(raw.skills) ? (raw.skills as string[]).filter(Boolean) : [],
    languages
  };
}

export function createEmptyResume(templateId: ResumeTemplateId = 'professional'): ResumeData {
  const now = new Date().toISOString();
  return {
    id: createId('resume'),
    title: 'Meu currículo',
    templateId,
    fontId: 'calibri',
    updatedAt: now,
    personal: {
      fullName: '',
      headline: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      summary: ''
    },
    experiences: [createExperience()],
    education: [createEducation()],
    courses: [],
    skills: [],
    languages: []
  };
}

export const SAMPLE_RESUME: ResumeData = {
  id: 'sample',
  title: 'Currículo profissional',
  templateId: 'modern',
  fontId: 'calibri',
  updatedAt: new Date().toISOString(),
  personal: {
    fullName: 'Ana Paula Mendes',
    headline: 'Analista de Marketing Digital',
    email: 'ana.mendes@email.com',
    phone: '(11) 98888-7777',
    location: 'São Paulo, SP',
    website: 'linkedin.com/in/anamendes',
    summary:
      'Profissional com 5 anos de experiência em campanhas digitais, branding e performance. Foco em resultados mensuráveis, comunicação clara e crescimento de marcas.'
  },
  experiences: [
    createExperience({
      id: 'exp1',
      company: 'Agência Horizonte',
      role: 'Analista de Marketing Pleno',
      location: 'São Paulo, SP',
      startDate: '03/2022',
      endDate: '',
      current: true,
      description:
        'Planejamento de campanhas multicanal para clientes B2B\nGestão de tráfego pago (Google Ads e Meta Ads)\nRelatórios mensais de performance e ROI'
    }),
    createExperience({
      id: 'exp2',
      company: 'Loja Viva Online',
      role: 'Assistente de Marketing',
      location: 'Remoto',
      startDate: '01/2020',
      endDate: '02/2022',
      current: false,
      description:
        'Produção de conteúdo e calendário editorial\nApoio em e-commerce com crescimento de 38% em conversões\nGestão de redes sociais e atendimento a influenciadores'
    })
  ],
  education: [
    createEducation({
      id: 'edu1',
      institution: 'Universidade Federal de São Paulo',
      course: 'Publicidade e Propaganda',
      level: 'Graduação',
      startDate: '2016',
      endDate: '2019',
      details: 'Ênfase em mídias digitais e comportamento do consumidor.'
    })
  ],
  courses: [
    createCourse({
      id: 'course1',
      name: 'Google Ads Certification',
      institution: 'Google Skillshop',
      year: '2023',
      hours: '40h',
      description: 'Campanhas de pesquisa, display e mensuração.'
    }),
    createCourse({
      id: 'course2',
      name: 'Copywriting para Performance',
      institution: 'Escola Conquer',
      year: '2022',
      hours: '20h',
      description: ''
    })
  ],
  skills: ['Google Ads', 'Meta Ads', 'SEO', 'Canva', 'Analytics', 'Copywriting'],
  languages: [
    createLanguage({ id: 'lang1', name: 'Português', level: 'nativo' }),
    createLanguage({ id: 'lang2', name: 'Inglês', level: 'intermediario' }),
    createLanguage({ id: 'lang3', name: 'Espanhol', level: 'basico' })
  ]
};
