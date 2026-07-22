'use client';

import Link from 'next/link';
import { ArrowRight, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { formatDate } from '@/lib/billing';
import { PLANS } from '@/lib/plans';
import { cn } from '@/lib/utils';

/**
 * Vende a remoção das referências Resolva Jato no PDF por R$ 4,99/mês.
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
      <div
        className={cn(
          'rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950',
          className
        )}
      >
        <p className="flex items-center gap-2 font-bold">
          <Crown className="h-4 w-4 text-emerald-700" />
          Documentos sem marca Resolva Jato
        </p>
        <p className="mt-1 text-xs leading-5 text-emerald-900">
          Vigência até{' '}
          <strong>
            {usage.premiumExpiresAt ? formatDate(usage.premiumExpiresAt) : 'o fim do período'}
          </strong>
          . Uso ilimitado e PDFs limpos — sem rodapé nem logo do Resolva Jato.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={cn(
          'flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between',
          className
        )}
      >
        <p className="text-xs leading-5 text-amber-950">
          <span className="font-bold">Marca Resolva Jato no PDF e no WhatsApp.</span> Remova por{' '}
          {premium.priceLabel}
          {premium.period}.
        </p>
        <Button asChild size="sm" className="shrink-0 bg-slate-900 font-bold hover:bg-slate-800">
          <Link href="/conta?upgrade=premium">
            Remover marca
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        'overflow-hidden rounded-[24px] border border-slate-800 bg-[linear-gradient(135deg,#0f172a_0%,#1e3a5f_55%,#0f766e_100%)] p-5 text-white shadow-sm sm:p-6',
        className
      )}
    >
      <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-200">
        <Sparkles className="h-3.5 w-3.5" />
        Documento limpo
      </p>
      <h2 className="rj-display mt-2 text-xl font-extrabold tracking-tight sm:text-2xl">
        Teste grátis. Remova a marca por {premium.priceLabel}
        {premium.period}.
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-200">
        No plano gratuito, PDF e mensagens de WhatsApp/e-mail levam a referência do Resolva Jato.
        No Premium, saem limpos — sem marca — com uso ilimitado por 30 dias.
      </p>
      <ul className="mt-4 space-y-1.5 text-sm text-slate-100">
        <li>· PDF sem rodapé e sem logo</li>
        <li>· WhatsApp e e-mail sem referência Resolva Jato</li>
        <li>· Salvamentos e downloads ilimitados</li>
        <li>· Vigência clara na sua conta após o pagamento</li>
      </ul>
      <Button asChild size="lg" className="mt-5 w-full bg-amber-400 font-bold text-slate-950 hover:bg-amber-300">
        <Link href="/conta?upgrade=premium">
          Remover referências por {premium.priceLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </aside>
  );
}
