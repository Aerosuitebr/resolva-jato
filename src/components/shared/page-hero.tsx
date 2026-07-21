import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ToolsWatermark } from '@/components/brand/tools-watermark';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
}

export function PageHero({ title, subtitle, icon: Icon, actions }: PageHeroProps) {
  return (
    <section className="relative -mx-2 overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--rj-hero-from)] via-[var(--rj-hero-via)] to-[var(--rj-hero-to)] p-6 text-white shadow-rj sm:p-7">
      <ToolsWatermark />
      <div className="absolute right-8 top-6 h-24 w-24 rounded-full bg-white/10 blur-sm" />
      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10">
            {Icon ? <Icon className="h-5 w-5" /> : null}
          </div>
          <h1 className="text-[clamp(1.35rem,2.5vw,1.65rem)] font-bold leading-tight">{title}</h1>
          {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200 sm:text-[0.9375rem]">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}
