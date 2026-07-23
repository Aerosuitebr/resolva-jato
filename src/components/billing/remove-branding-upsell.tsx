'use client';

import Link from 'next/link';
import { ArrowRight, Crown, ShieldCheck, Sparkles, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { formatDate } from '@/lib/billing';
import { PLANS } from '@/lib/plans';
import { cn } from '@/lib/utils';

const BENEFITS = [
  'PDF sem rodapé e sem logo Resolva Jato',
  'WhatsApp e e-mail sem referências',
  '30 dias de vigência claros na conta'
] as const;

function BrandComparison() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-amber-200">
          <Tag className="h-3.5 w-3.5" />
          Plano grátis
        </div>
        <p className="mt-2 text-sm font-bold text-white">Com referência</p>
        <p className="mt-1 text-xs leading-5 text-slate-300">
          PDF, WhatsApp e e-mail saem com a marca Resolva Jato no rodapé.
        </p>
        <div className="mt-3 rounded-xl border border-dashed border-white/15 bg-slate-950/40 px-3 py-2.5">
          <p className="truncate text-[10px] font-semibold text-slate-400">Seu documento · cliente</p>
          <p className="mt-1.5 text-[10px] leading-4 text-slate-500">
            Gerado com Resolva Jato · resolvajato.com.br
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-3.5">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-emerald-200">
          <Sparkles className="h-3.5 w-3.5" />
          Premium
        </div>
        <p className="mt-2 text-sm font-bold text-white">Sem referência</p>
        <p className="mt-1 text-xs leading-5 text-emerald-50/90">
          Documento limpo — só a sua marca profissional, sem menção ao Resolva Jato.
        </p>
        <div className="mt-3 rounded-xl border border-emerald-300/20 bg-slate-950/40 px-3 py-2.5">
          <p className="truncate text-[10px] font-semibold text-slate-300">Seu documento · cliente</p>
          <p className="mt-1.5 text-[10px] leading-4 text-emerald-200/80">
            Sem rodapé · sem logo · só o seu nome
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Banner Premium nas ferramentas — mesmo padrão visual da conta.
 * Com Premium ativo, mostra a vigência sem marca.
 */
export function RemoveBrandingUpsell({
  className,
  compact = false
}: {
  className?: string;
  compact?: boolean;
}) {
  const { usage, ready } = useAuth();
  const premium = PLANS.premium;

  if (!ready) return null;

  if (usage.unlimited) {
    return (
      <aside
        className={cn(
          'overflow-hidden rounded-[28px] border border-emerald-300 bg-gradient-to-br from-emerald-950 to-slate-950 p-5 text-white shadow-sm sm:p-6',
          className
        )}
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-300 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-emerald-950">
          <Crown className="h-3.5 w-3.5" />
          Premium ativo
        </span>
        <h2 className="mt-4 text-xl font-black tracking-tight sm:text-2xl">
          Documentos sem marca Resolva Jato.
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Vigência até{' '}
          <strong className="text-white">
            {usage.premiumExpiresAt ? formatDate(usage.premiumExpiresAt) : 'o fim do período'}
          </strong>
          . PDFs limpos — sem rodapé nem logo.
        </p>
      </aside>
    );
  }

  if (compact) {
    return (
      <aside
        className={cn(
          'overflow-hidden rounded-[24px] border border-slate-800 bg-gradient-to-br from-slate-950 to-blue-950 p-4 text-white',
          className
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-950">
              <Crown className="h-3 w-3" />
              Premium
            </span>
            <p className="mt-2 text-sm font-bold leading-5">
              Remova as referências por {premium.priceLabel}
              {premium.period}.
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0 bg-white font-bold text-slate-950 hover:bg-sky-50">
            <Link href="/conta?upgrade=premium">
              Assinar Premium
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <div className="mt-3">
          <BrandComparison />
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        'overflow-hidden rounded-[28px] border border-slate-800 bg-gradient-to-br from-slate-950 to-blue-950 p-6 text-white shadow-xl shadow-slate-900/10 sm:p-7',
        className
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-slate-950">
            <Crown className="h-3.5 w-3.5" />
            Premium
          </span>
          <h2 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">
            Remova as referências do PDF.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Por {premium.priceLabel}
            {premium.period}, gere documentos profissionais sem rodapé nem logo do Resolva Jato.
          </p>
          <div className="mt-5">
            <BrandComparison />
          </div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 text-sm text-slate-100">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full shrink-0 lg:max-w-xs">
          <Button
            asChild
            className="h-12 w-full bg-white text-base font-bold text-slate-950 hover:bg-sky-50"
          >
            <Link href="/conta?upgrade=premium">
              <ArrowRight className="h-4 w-4" />
              Assinar Premium por {premium.priceLabel}
            </Link>
          </Button>
          <p className="mt-3 text-center text-[11px] leading-5 text-slate-400 lg:text-left">
            Pagamento seguro (cartão, Pix, NuPay e outros). Assim que for aprovado — por qualquer meio — o
            Premium libera automaticamente por 30 dias.
          </p>
        </div>
      </div>
    </aside>
  );
}
