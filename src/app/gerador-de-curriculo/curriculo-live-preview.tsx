'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { ResumePreview } from '@/components/curriculo/resume-preview';
import { SAMPLE_RESUME } from '@/lib/curriculo/defaults';
import type { ResumeTemplateId } from '@/lib/curriculo/types';
import { RESUME_TEMPLATES } from '@/lib/curriculo/templates';

export function CurriculoLivePreview() {
  const [fullName, setFullName] = useState(SAMPLE_RESUME.personal.fullName);
  const [headline, setHeadline] = useState(SAMPLE_RESUME.personal.headline);
  const [experience, setExperience] = useState('');
  const [templateId, setTemplateId] = useState<ResumeTemplateId>(SAMPLE_RESUME.templateId);

  const previewData = useMemo(
    () => ({
      ...SAMPLE_RESUME,
      templateId,
      personal: {
        ...SAMPLE_RESUME.personal,
        fullName: fullName || SAMPLE_RESUME.personal.fullName,
        headline: headline || SAMPLE_RESUME.personal.headline
      }
    }),
    [fullName, headline, templateId]
  );

  const checklist = [
    { label: 'Perfil', done: fullName.trim().length > 2 },
    { label: 'Cargo desejado', done: headline.trim().length > 2 },
    { label: 'Um resultado de experiência', done: experience.trim().length > 5 },
    { label: 'Modelo escolhido', done: true }
  ];
  const completedCount = checklist.filter((item) => item.done).length;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-start">
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Checklist de progresso */}
        <div aria-live="polite">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Seu progresso</span>
            <span className="text-xs font-bold text-sky-700">{completedCount}/{checklist.length}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-sky-600 transition-all"
              style={{ width: `${(completedCount / checklist.length) * 100}%` }}
            />
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span
                  className={`grid h-4 w-4 place-items-center rounded-full ${
                    item.done ? 'bg-emerald-500 text-white' : 'border border-slate-300 bg-white'
                  }`}
                  aria-hidden
                >
                  {item.done && <Check className="h-2.5 w-2.5" />}
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="cv-nome">
            Seu nome
          </label>
          <input
            id="cv-nome"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Ex: Ana Paula Mendes"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="cv-cargo">
            Cargo desejado
          </label>
          <input
            id="cv-cargo"
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
            placeholder="Ex: Analista de Marketing Digital"
            aria-describedby="cv-cargo-dica"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200"
          />
          <p id="cv-cargo-dica" className="mt-1 text-xs font-medium text-slate-500">
            Dica: use o mesmo nome do cargo que aparece na vaga que você quer aplicar.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="cv-experiencia">
            Um resultado da sua última experiência
          </label>
          <textarea
            id="cv-experiencia"
            value={experience}
            onChange={(event) => setExperience(event.target.value)}
            placeholder="Ex: Aumentei em 30% a taxa de conversão do site em 4 meses"
            rows={2}
            aria-describedby="cv-experiencia-dica"
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200"
          />
          <p id="cv-experiencia-dica" className="mt-1 text-xs font-medium text-slate-500">
            Dica: descreva resultados alcançados (números, %) em vez de apenas listar tarefas — isso pesa mais para o
            recrutador e para os sistemas de triagem (ATS).
          </p>
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-slate-800">
            Modelo <span className="font-normal text-slate-500">— veja a mudança em tempo real</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {RESUME_TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setTemplateId(template.id)}
                aria-pressed={templateId === template.id}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  templateId === template.id
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-sky-400 hover:text-sky-700'
                }`}
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        <Link
          href="/cadastro?next=/ferramentas/curriculo"
          className="block w-full rounded-lg bg-sky-600 px-4 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
        >
          Continuar e baixar meu currículo
        </Link>
        <p className="text-center text-xs font-medium text-slate-500">
          Grátis para começar. Sem cartão de crédito.
        </p>
      </div>

      <div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-8">
          <div className="mx-auto max-w-[560px] origin-top scale-[0.85] rounded-lg bg-white shadow-lg sm:scale-100">
            <ResumePreview data={previewData} />
          </div>
        </div>

        {/* Miniaturas dos modelos para comparação lado a lado */}
        <div className="mt-4 grid grid-cols-3 gap-3" role="group" aria-label="Comparar modelos">
          {RESUME_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => setTemplateId(template.id)}
              aria-pressed={templateId === template.id}
              className={`overflow-hidden rounded-xl border-2 bg-white p-1.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                templateId === template.id ? 'border-sky-600' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="pointer-events-none aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-50">
                <div className="origin-top-left scale-[0.24]">
                  <div className="w-[420px]">
                    <ResumePreview data={{ ...SAMPLE_RESUME, templateId: template.id }} />
                  </div>
                </div>
              </div>
              <span className="mt-1.5 block truncate text-center text-xs font-semibold text-slate-700">
                {template.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
