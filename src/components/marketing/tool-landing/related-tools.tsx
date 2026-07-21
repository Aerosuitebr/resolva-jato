import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { SeoPageRelatedTool } from '@/lib/seo-pages/types';

export function ToolLandingRelated({ tools }: { tools: SeoPageRelatedTool[] }) {
  if (tools.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">Você também pode gostar</p>
      <h2 className="rj-display mt-3 max-w-xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Outras ferramentas que combinam com essa.
      </h2>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((tool) => (
          <li key={tool.name}>
            <Link
              href={tool.href}
              className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-sm font-bold text-slate-900">{tool.name}</span>
              <span className="mt-1.5 flex-1 text-xs leading-5 text-slate-600">{tool.description}</span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-700">
                Ver ferramenta
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
