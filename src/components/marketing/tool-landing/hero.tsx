import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SeoPageContent } from '@/lib/seo-pages/types';

export function ToolLandingHero({
  content,
  preview
}: {
  content: SeoPageContent;
  preview: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#020617_0%,#0f172a_55%,#0c4a6e_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(60%_50%_at_80%_0%,theme(colors.sky.500/40),transparent)]" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
        <div>
          <p className="rj-display text-xs font-bold uppercase tracking-[0.25em] text-sky-300">
            Resolva Jato · {content.toolName}
          </p>
          <h1 className="rj-display mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {content.h1}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
            {content.subtitle}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-13 px-6 text-base">
              <Link href={content.ctaHref}>
                {content.ctaPrimary}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-13 border-white/20 bg-white/5 px-6 text-base text-white hover:bg-white/10">
              <a href="#exemplos">{content.ctaSecondary}</a>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2.5">
            {content.quickBadges.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-1.5 text-sm font-medium text-slate-300">
                <Icon className="h-4 w-4 text-emerald-400" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[32px] bg-white/5 blur-2xl" aria-hidden />
          <div className="relative rounded-[28px] border border-white/10 bg-white/[0.03] p-3 shadow-2xl backdrop-blur-sm sm:p-4">
            {preview}
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 text-xs text-slate-400 sm:px-6">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
          Sem instalar nada. Funciona no navegador do celular ou do computador.
        </div>
      </div>
    </section>
  );
}
