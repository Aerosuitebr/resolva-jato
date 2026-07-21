'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { ContabilPreview } from '@/components/contabeis/contabil-preview';
import { buildDefaultClauses } from '@/lib/contabeis/clauses';
import { SAMPLE_CONTABIL_DOCUMENT } from '@/lib/contabeis/defaults';
import type { ContabilTemplateId } from '@/lib/contabeis/types';
import { CONTABIL_TEMPLATES } from '@/lib/contabeis/templates';

export function ContabilLivePreview() {
  const [partyAName, setPartyAName] = useState(SAMPLE_CONTABIL_DOCUMENT.partyA.name);
  const [partyBName, setPartyBName] = useState(SAMPLE_CONTABIL_DOCUMENT.partyB.name);
  const [objectDescription, setObjectDescription] = useState('');
  const [templateId, setTemplateId] = useState<ContabilTemplateId>(SAMPLE_CONTABIL_DOCUMENT.templateId);

  const previewData = useMemo(() => {
    const base = {
      ...SAMPLE_CONTABIL_DOCUMENT,
      templateId,
      partyA: { ...SAMPLE_CONTABIL_DOCUMENT.partyA, name: partyAName || SAMPLE_CONTABIL_DOCUMENT.partyA.name },
      partyB: { ...SAMPLE_CONTABIL_DOCUMENT.partyB, name: partyBName || SAMPLE_CONTABIL_DOCUMENT.partyB.name },
      objectDescription: objectDescription || SAMPLE_CONTABIL_DOCUMENT.objectDescription
    };
    return { ...base, clauses: buildDefaultClauses(base) };
  }, [partyAName, partyBName, objectDescription, templateId]);

  const checklist = [
    { label: 'Cliente', done: partyAName.trim().length > 2 },
    { label: 'Escritório / profissional', done: partyBName.trim().length > 2 },
    { label: 'Escopo do serviço', done: objectDescription.trim().length > 5 },
    { label: 'Modelo escolhido', done: true }
  ];
  const completedCount = checklist.filter((item) => item.done).length;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-start">
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
          <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="cnt-partya">
            Cliente
          </label>
          <input
            id="cnt-partya"
            value={partyAName}
            onChange={(event) => setPartyAName(event.target.value)}
            placeholder="Ex: Comércio Norte LTDA"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="cnt-partyb">
            Escritório / profissional
          </label>
          <input
            id="cnt-partyb"
            value={partyBName}
            onChange={(event) => setPartyBName(event.target.value)}
            placeholder="Ex: Escritório Silva Contabilidade"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="cnt-objeto">
            Escopo do serviço
          </label>
          <textarea
            id="cnt-objeto"
            value={objectDescription}
            onChange={(event) => setObjectDescription(event.target.value)}
            placeholder="Ex: escrituração contábil e obrigações acessórias mensais"
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200"
          />
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-slate-800">
            Tipo de documento <span className="font-normal text-slate-500">— veja a mudança em tempo real</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {CONTABIL_TEMPLATES.map((template) => (
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
          href="/cadastro?next=/ferramentas/contabeis"
          className="block w-full rounded-lg bg-sky-600 px-4 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
        >
          Continuar e baixar meu documento
        </Link>
        <p className="text-center text-xs font-medium text-slate-500">Grátis para começar. Sem cartão de crédito.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-8">
        <div className="mx-auto max-w-[560px] origin-top scale-[0.85] rounded-lg bg-white shadow-lg sm:scale-100">
          <ContabilPreview data={previewData} />
        </div>
      </div>
    </div>
  );
}
