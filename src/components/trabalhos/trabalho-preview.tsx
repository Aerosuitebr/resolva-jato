import type { TrabalhoData } from '@/lib/trabalhos/types';
import { getDocumentFontStack } from '@/lib/documents/fonts';

interface TrabalhoPreviewProps {
  data: TrabalhoData;
}

function line(value: string, fallback: string) {
  return value.trim() || fallback;
}

function EscolarLayout({ data }: { data: TrabalhoData }) {
  return (
    <article className="flex min-h-[297mm] flex-col bg-white px-[18mm] py-[20mm] text-center text-[12px] leading-relaxed text-slate-800">
      <header className="space-y-2 border-b-2 border-sky-700 pb-6">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-sky-800">
          {line(data.institution, 'Nome da escola')}
        </p>
        <p className="text-xs text-slate-600">{line(data.courseOrGrade, 'Série / turma')}</p>
      </header>

      <div className="mt-14 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
          {line(data.discipline, 'Disciplina')}
        </p>
        <h1 className="text-2xl font-bold leading-tight text-slate-900">
          {line(data.workTitle, 'Título do trabalho')}
        </h1>
        {data.subtitle ? <p className="text-sm text-slate-600">{data.subtitle}</p> : null}
      </div>

      <div className="mt-auto space-y-8 pb-4">
        <div className="mx-auto max-w-sm space-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-left">
          <p>
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Aluno(a)</span>
            <br />
            <strong>{line(data.studentName, 'Nome do aluno')}</strong>
          </p>
          <p>
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Professor(a)</span>
            <br />
            <strong>{line(data.teacherOrAdvisor, 'Nome do professor')}</strong>
          </p>
        </div>
        <p className="text-sm font-semibold text-slate-700">
          {line(data.city, 'Cidade')} · {line(data.year, new Date().getFullYear().toString())}
        </p>
      </div>
    </article>
  );
}

function UniversitariaLayout({ data }: { data: TrabalhoData }) {
  return (
    <article className="flex min-h-[297mm] flex-col bg-white px-[25mm] py-[25mm] text-center font-serif text-[12px] leading-relaxed text-slate-900">
      <header className="space-y-2">
        <p className="text-sm font-bold uppercase tracking-[0.08em]">
          {line(data.institution, 'Nome da instituição')}
        </p>
        {data.courseOrGrade ? <p className="text-xs uppercase tracking-[0.06em]">{data.courseOrGrade}</p> : null}
      </header>

      <div className="mt-28">
        <p className="text-sm font-semibold uppercase tracking-[0.06em]">
          {line(data.studentName, 'Nome do autor')}
        </p>
      </div>

      <div className="mt-24 space-y-3">
        <h1 className="text-xl font-bold uppercase leading-snug tracking-[0.04em]">
          {line(data.workTitle, 'Título do trabalho')}
        </h1>
        {data.subtitle ? <p className="text-sm italic text-slate-700">{data.subtitle}</p> : null}
      </div>

      <footer className="mt-auto space-y-1 pb-2">
        <p className="text-sm font-semibold">{line(data.city, 'Cidade')}</p>
        <p className="text-sm font-semibold">{line(data.year, new Date().getFullYear().toString())}</p>
      </footer>
    </article>
  );
}

function FolhaRostoLayout({ data }: { data: TrabalhoData }) {
  return (
    <article className="flex min-h-[297mm] flex-col bg-white px-[25mm] py-[25mm] font-serif text-[12px] leading-relaxed text-slate-900">
      <header className="space-y-2 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.08em]">
          {line(data.institution, 'Nome da instituição')}
        </p>
        {data.courseOrGrade ? <p className="text-xs uppercase tracking-[0.06em]">{data.courseOrGrade}</p> : null}
      </header>

      <div className="mt-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.06em]">
          {line(data.studentName, 'Nome do autor')}
        </p>
      </div>

      <div className="mt-20 space-y-3 text-center">
        <h1 className="text-xl font-bold uppercase leading-snug tracking-[0.04em]">
          {line(data.workTitle, 'Título do trabalho')}
        </h1>
        {data.subtitle ? <p className="text-sm italic text-slate-700">{data.subtitle}</p> : null}
      </div>

      <div className="ml-auto mt-16 max-w-[58%] text-justify text-[11px] leading-6 text-slate-800">
        <p>{line(data.workNature, 'Natureza do trabalho')}</p>
        {data.teacherOrAdvisor ? (
          <p className="mt-3">
            Orientador(a): <strong>{data.teacherOrAdvisor}</strong>
          </p>
        ) : null}
        {data.discipline ? (
          <p className="mt-1">
            Disciplina: <strong>{data.discipline}</strong>
          </p>
        ) : null}
      </div>

      <footer className="mt-auto space-y-1 pb-2 text-center">
        <p className="text-sm font-semibold">{line(data.city, 'Cidade')}</p>
        <p className="text-sm font-semibold">{line(data.year, new Date().getFullYear().toString())}</p>
      </footer>
    </article>
  );
}

export function TrabalhoPreview({ data }: TrabalhoPreviewProps) {
  const fontFamily = getDocumentFontStack('academico', data.fontId);
  const content =
    data.templateId === 'folha-rosto' ? (
      <FolhaRostoLayout data={data} />
    ) : data.templateId === 'universitaria' ? (
      <UniversitariaLayout data={data} />
    ) : (
      <EscolarLayout data={data} />
    );

  return <div style={{ fontFamily }}>{content}</div>;
}
