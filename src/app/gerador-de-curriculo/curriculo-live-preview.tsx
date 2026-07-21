'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ResumePreview } from '@/components/curriculo/resume-preview';
import { SAMPLE_RESUME } from '@/lib/curriculo/defaults';
import type { ResumeTemplateId } from '@/lib/curriculo/types';
import { RESUME_TEMPLATES } from '@/lib/curriculo/templates';

export function CurriculoLivePreview() {
  const [fullName, setFullName] = useState(SAMPLE_RESUME.personal.fullName);
  const [headline, setHeadline] = useState(SAMPLE_RESUME.personal.headline);
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

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start">
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="cv-nome">
            Seu nome
          </label>
          <input
            id="cv-nome"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Ex: Ana Paula Mendes"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="cv-cargo">
            Cargo desejado
          </label>
          <input
            id="cv-cargo"
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
            placeholder="Ex: Analista de Marketing Digital"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>
        <div>
          <span className="mb-2 block text-sm font-medium text-slate-700">Modelo</span>
          <div className="flex flex-wrap gap-2">
            {RESUME_TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setTemplateId(template.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  templateId === template.id
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-sky-400 hover:text-sky-600'
                }`}
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>
        <Link
          href="/cadastro?next=/ferramentas/curriculo"
          className="block w-full rounded-lg bg-sky-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
        >
          Continuar e baixar meu currículo
        </Link>
        <p className="text-center text-xs text-slate-500">
          Grátis para começar. Sem cartão de crédito.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-8">
        <div className="mx-auto max-w-[560px] origin-top scale-[0.85] rounded-lg bg-white shadow-lg sm:scale-100">
          <ResumePreview data={previewData} />
        </div>
      </div>
    </div>
  );
}
