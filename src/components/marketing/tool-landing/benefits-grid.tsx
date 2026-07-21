import type { SeoPageBenefit } from '@/lib/seo-pages/types';

const ACCENTS = [
  { bg: 'bg-sky-50', text: 'text-sky-700', ring: 'hover:border-sky-200' },
  { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'hover:border-emerald-200' },
  { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'hover:border-violet-200' },
  { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'hover:border-amber-200' }
];

export function ToolLandingBenefits({
  toolName,
  benefits
}: {
  toolName: string;
  benefits: SeoPageBenefit[];
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-800">Por que usar</p>
      <h2 className="rj-display mt-3 max-w-2xl text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
        Tudo que você precisa para gerar seu {toolName.toLowerCase()} sem complicação.
      </h2>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map(({ icon: Icon, title, description }, index) => {
          const accent = ACCENTS[index % ACCENTS.length];
          return (
            <li
              key={title}
              className={`rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition-colors ${accent.ring}`}
            >
              <span className={`grid h-11 w-11 place-items-center rounded-2xl ${accent.bg} ${accent.text}`}>
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-sm font-medium leading-6 text-slate-700">{description}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
