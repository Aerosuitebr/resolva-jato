import { ArrowDown } from 'lucide-react';
import type { SeoPageStep } from '@/lib/seo-pages/types';

export function ToolLandingHowItWorks({ steps }: { steps: SeoPageStep[] }) {
  return (
    <section className="border-y border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">Como funciona</p>
        <h2 className="rj-display mt-3 max-w-xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Pronto em 3 passos simples.
        </h2>
        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="relative flex flex-col">
              <div className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-0">
                <span className="rj-display grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-900 text-lg font-extrabold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-0 text-base font-bold text-slate-900 sm:mt-4">{step.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              {index < steps.length - 1 && (
                <ArrowDown className="mt-4 h-5 w-5 text-slate-300 sm:hidden" aria-hidden />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
