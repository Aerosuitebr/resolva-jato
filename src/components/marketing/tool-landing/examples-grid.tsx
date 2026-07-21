import Link from 'next/link';
import type { ReactNode } from 'react';

export interface ToolLandingExampleItem {
  title: string;
  description: string;
  href: string;
  /** Miniatura real do modelo (preferível a imagem estática). */
  thumbnail: ReactNode;
}

export function ToolLandingExamples({ examples }: { examples: ToolLandingExampleItem[] }) {
  if (examples.length === 0) return null;

  return (
    <section id="exemplos" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">Modelos prontos</p>
      <h2 className="rj-display mt-3 max-w-xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Escolha um modelo e comece já preenchido.
      </h2>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {examples.map((example) => (
          <li
            key={example.title}
            className="group flex flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative flex aspect-[4/3] w-full items-start justify-center overflow-hidden bg-slate-100 p-4">
              <div className="pointer-events-none w-full max-w-[220px] origin-top scale-[0.62] shadow-lg transition-transform duration-300 group-hover:scale-[0.66]">
                {example.thumbnail}
              </div>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-base font-bold text-slate-900">{example.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-6 text-slate-600">{example.description}</p>
              <Link
                href={example.href}
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Usar este modelo
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
