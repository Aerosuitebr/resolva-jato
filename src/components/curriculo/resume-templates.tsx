import { DOC_MARGIN, DOC_PAGE } from '@/lib/documents/page';
import {
  descriptionLines,
  formatResumePeriod,
  LANGUAGE_LEVEL_LABELS,
  type ResumeCourse,
  type ResumeData,
  type ResumeEducation,
  type ResumeExperience,
  type ResumeLanguage
} from '@/lib/curriculo/types';
import { cn } from '@/lib/utils';

interface ResumeTemplateProps {
  data: ResumeData;
}

function SectionTitle({
  children,
  light = false
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <h2
      className={cn(
        'mb-3 border-b pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em]',
        light ? 'border-white/25 text-sky-200' : 'border-slate-200 text-slate-500'
      )}
    >
      {children}
    </h2>
  );
}

function ContactLine({
  label,
  value,
  light = false
}: {
  label: string;
  value: string;
  light?: boolean;
}) {
  if (!value.trim()) return null;
  return (
    <p className={cn('text-[11px] leading-5', light ? 'text-slate-200' : 'text-slate-700')}>
      <span className={cn('font-semibold', light ? 'text-white' : 'text-slate-900')}>{label}: </span>
      {value}
    </p>
  );
}

function BulletList({ text }: { text: string }) {
  const lines = descriptionLines(text);
  if (!lines.length) return null;
  if (lines.length === 1) {
    return <p className="mt-1.5 text-[12.5px] leading-6 text-slate-700">{lines[0]}</p>;
  }
  return (
    <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[12.5px] leading-6 text-slate-700">
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}

function ExperienceBlock({
  item,
  accentCompany
}: {
  item: ResumeExperience;
  accentCompany?: string;
}) {
  if (!item.company.trim() && !item.role.trim()) return null;
  const period = formatResumePeriod(item);
  return (
    <article className="break-inside-avoid">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <h3 className="text-[13px] font-bold text-slate-900">{item.role || 'Cargo'}</h3>
        {period ? <span className="shrink-0 text-[11px] font-medium text-slate-500">{period}</span> : null}
      </div>
      <p className={cn('text-[12.5px] font-semibold', accentCompany || 'text-slate-600')}>
        {item.company}
        {item.location ? <span className="font-normal text-slate-500"> · {item.location}</span> : null}
      </p>
      <BulletList text={item.description} />
    </article>
  );
}

function EducationBlock({ item, accent }: { item: ResumeEducation; accent?: string }) {
  if (!item.institution.trim() && !item.course.trim()) return null;
  const period = formatResumePeriod(item);
  const title = [item.course, item.level].filter(Boolean).join(' · ') || 'Curso';
  return (
    <article className="break-inside-avoid">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <h3 className="text-[13px] font-bold text-slate-900">{title}</h3>
        {period ? <span className="shrink-0 text-[11px] font-medium text-slate-500">{period}</span> : null}
      </div>
      <p className={cn('text-[12.5px] font-semibold', accent || 'text-slate-600')}>{item.institution}</p>
      {item.details ? <p className="mt-1 text-[12.5px] leading-6 text-slate-700">{item.details}</p> : null}
    </article>
  );
}

function CourseBlock({ item }: { item: ResumeCourse }) {
  if (!item.name.trim()) return null;
  const meta = [item.institution, item.year, item.hours].filter(Boolean).join(' · ');
  return (
    <article className="break-inside-avoid">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <h3 className="text-[13px] font-bold text-slate-900">{item.name}</h3>
        {item.year ? <span className="text-[11px] font-medium text-slate-500">{item.year}</span> : null}
      </div>
      {meta ? <p className="text-[12.5px] font-semibold text-slate-600">{meta}</p> : null}
      {item.description ? <p className="mt-1 text-[12.5px] leading-6 text-slate-700">{item.description}</p> : null}
    </article>
  );
}

function languageLabel(item: ResumeLanguage) {
  const level = LANGUAGE_LEVEL_LABELS[item.level] || item.level;
  return level ? `${item.name}: ${level}` : item.name;
}

function hasExperience(list: ResumeExperience[]) {
  return list.some((item) => item.company.trim() || item.role.trim());
}

function hasEducation(list: ResumeEducation[]) {
  return list.some((item) => item.institution.trim() || item.course.trim());
}

function hasCourses(list: ResumeCourse[]) {
  return list.some((item) => item.name.trim());
}

function hasLanguages(list: ResumeLanguage[]) {
  return list.some((item) => item.name.trim());
}

export function ProfessionalTemplate({ data }: ResumeTemplateProps) {
  const { personal, experiences, education, courses, skills, languages } = data;

  return (
    <div className={cn(DOC_PAGE, DOC_MARGIN)}>
      <header className="border-b-2 border-slate-900 pb-4">
        <h1 className="text-[26px] font-bold leading-tight tracking-tight">
          {personal.fullName || 'Seu nome'}
        </h1>
        <p className="mt-1 text-[15px] font-medium text-slate-600">
          {personal.headline || 'Cargo ou área de atuação'}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <ContactLine label="E-mail" value={personal.email} />
          <ContactLine label="Telefone" value={personal.phone} />
          <ContactLine label="Cidade" value={personal.location} />
          <ContactLine label="LinkedIn / Site" value={personal.website} />
        </div>
      </header>

      {personal.summary ? (
        <section className="mt-5">
          <SectionTitle>Resumo profissional</SectionTitle>
          <p className="text-[12.5px] leading-6 text-slate-700">{personal.summary}</p>
        </section>
      ) : null}

      {hasExperience(experiences) ? (
        <section className="mt-5">
          <SectionTitle>Experiência profissional</SectionTitle>
          <div className="space-y-4">
            {experiences.map((item) => (
              <ExperienceBlock key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {hasEducation(education) ? (
        <section className="mt-5">
          <SectionTitle>Formação acadêmica</SectionTitle>
          <div className="space-y-3">
            {education.map((item) => (
              <EducationBlock key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {hasCourses(courses) ? (
        <section className="mt-5">
          <SectionTitle>Cursos e certificações</SectionTitle>
          <div className="space-y-3">
            {courses.map((item) => (
              <CourseBlock key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {(skills.length > 0 || hasLanguages(languages)) && (
        <section className="mt-5 grid gap-5 sm:grid-cols-2">
          {skills.length > 0 ? (
            <div>
              <SectionTitle>Habilidades</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {hasLanguages(languages) ? (
            <div>
              <SectionTitle>Idiomas</SectionTitle>
              <ul className="space-y-1 text-[12.5px] text-slate-700">
                {languages
                  .filter((item) => item.name.trim())
                  .map((item) => (
                    <li key={item.id}>{languageLabel(item)}</li>
                  ))}
              </ul>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}

export function ModernTemplate({ data }: ResumeTemplateProps) {
  const { personal, experiences, education, courses, skills, languages } = data;

  return (
    <div className={cn(DOC_PAGE, DOC_MARGIN)}>
      <div className="grid min-h-[calc(297mm-30mm)] grid-cols-[32%_1fr] overflow-hidden rounded-sm">
        <aside className="bg-slate-900 px-4 py-5 text-white">
          <h1 className="text-[22px] font-bold leading-tight">{personal.fullName || 'Seu nome'}</h1>
          <p className="mt-2 text-[12px] font-medium text-sky-200">
            {personal.headline || 'Cargo ou área'}
          </p>
          <div className="mt-6 space-y-2">
            <ContactLine label="E-mail" value={personal.email} light />
            <ContactLine label="Telefone" value={personal.phone} light />
            <ContactLine label="Cidade" value={personal.location} light />
            <ContactLine label="Site" value={personal.website} light />
          </div>
          {skills.length > 0 ? (
            <div className="mt-6">
              <SectionTitle light>Habilidades</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {hasLanguages(languages) ? (
            <div className="mt-6">
              <SectionTitle light>Idiomas</SectionTitle>
              <ul className="space-y-1 text-[11px] text-slate-200">
                {languages
                  .filter((item) => item.name.trim())
                  .map((item) => (
                    <li key={item.id}>{languageLabel(item)}</li>
                  ))}
              </ul>
            </div>
          ) : null}
        </aside>

        <main className="px-5 py-5">
          {personal.summary ? (
            <section>
              <SectionTitle>Perfil</SectionTitle>
              <p className="text-[12.5px] leading-6 text-slate-700">{personal.summary}</p>
            </section>
          ) : null}

          {hasExperience(experiences) ? (
            <section className="mt-5">
              <SectionTitle>Experiência profissional</SectionTitle>
              <div className="space-y-4">
                {experiences.map((item) => (
                  <div key={item.id} className="border-l-2 border-sky-500 pl-3">
                    <ExperienceBlock item={item} accentCompany="text-sky-700" />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {hasEducation(education) ? (
            <section className="mt-5">
              <SectionTitle>Formação acadêmica</SectionTitle>
              <div className="space-y-3">
                {education.map((item) => (
                  <EducationBlock key={item.id} item={item} />
                ))}
              </div>
            </section>
          ) : null}

          {hasCourses(courses) ? (
            <section className="mt-5">
              <SectionTitle>Cursos e certificações</SectionTitle>
              <div className="space-y-3">
                {courses.map((item) => (
                  <CourseBlock key={item.id} item={item} />
                ))}
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export function AcademicTemplate({ data }: ResumeTemplateProps) {
  const { personal, experiences, education, courses, skills, languages } = data;

  return (
    <div className={cn(DOC_PAGE, DOC_MARGIN)}>
      <header className="rounded-xl bg-indigo-50 px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-700">
          Currículo acadêmico
        </p>
        <h1 className="mt-1.5 text-[24px] font-bold tracking-tight">
          {personal.fullName || 'Seu nome'}
        </h1>
        <p className="mt-1 text-[14px] font-medium text-indigo-700">
          {personal.headline || 'Estudante / área de interesse'}
        </p>
        <div className="mt-3 grid gap-1 sm:grid-cols-2">
          <ContactLine label="E-mail" value={personal.email} />
          <ContactLine label="Telefone" value={personal.phone} />
          <ContactLine label="Cidade" value={personal.location} />
          <ContactLine label="LinkedIn / Portfólio" value={personal.website} />
        </div>
      </header>

      {personal.summary ? (
        <section className="mt-5">
          <SectionTitle>Objetivo</SectionTitle>
          <p className="text-[12.5px] leading-6 text-slate-700">{personal.summary}</p>
        </section>
      ) : null}

      {hasEducation(education) ? (
        <section className="mt-5">
          <SectionTitle>Formação acadêmica</SectionTitle>
          <div className="space-y-3">
            {education.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 px-3 py-2.5">
                <EducationBlock item={item} accent="text-indigo-700" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {hasCourses(courses) ? (
        <section className="mt-5">
          <SectionTitle>Cursos e certificações</SectionTitle>
          <div className="space-y-3">
            {courses.map((item) => (
              <CourseBlock key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {hasExperience(experiences) ? (
        <section className="mt-5">
          <SectionTitle>Experiências e projetos</SectionTitle>
          <div className="space-y-4">
            {experiences.map((item) => (
              <ExperienceBlock key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {(skills.length > 0 || hasLanguages(languages)) && (
        <section className="mt-5 grid gap-5 sm:grid-cols-2">
          {skills.length > 0 ? (
            <div>
              <SectionTitle>Competências</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {hasLanguages(languages) ? (
            <div>
              <SectionTitle>Idiomas</SectionTitle>
              <ul className="space-y-1 text-[12.5px] text-slate-700">
                {languages
                  .filter((item) => item.name.trim())
                  .map((item) => (
                    <li key={item.id}>{languageLabel(item)}</li>
                  ))}
              </ul>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
