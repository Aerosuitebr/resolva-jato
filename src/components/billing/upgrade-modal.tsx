'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Crown } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { PlanBenefitsList } from '@/components/marketing/plan-benefits-list';
import { TrustSeals } from '@/components/marketing/trust-seals';
import { Button } from '@/components/ui/button';
import { PLANS } from '@/lib/plans';
import { cn } from '@/lib/utils';

interface UpgradeModalProps {
  open: boolean;
  nextReleaseAtLabel?: string | null;
  onUnlock: () => void;
  onLeave?: () => void;
}

export function UpgradeModal({ open, nextReleaseAtLabel, onUnlock, onLeave }: UpgradeModalProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const premium = PLANS.premium;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
      <div
        className={cn(
          'relative z-10 grid max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-[32px]',
          'border border-white/10 shadow-[0_40px_120px_rgba(2,8,23,0.55)]'
        )}
      >
        <div className="relative overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(ellipse 80% 50% at 20% 0%, rgba(56,189,248,0.35), transparent 55%), radial-gradient(ellipse 60% 40% at 90% 100%, rgba(251,191,36,0.18), transparent 50%)'
            }}
          />
          <div className="pointer-events-none absolute inset-0 rj-hud-grid opacity-50" />

          <div className="relative px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
              <Logo variant="hero" />
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/15 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-amber-200">
                <Crown className="h-3.5 w-3.5" />
                Acesso bloqueado
              </span>
            </div>

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-sky-300">
              Máximo de utilizações atingido
            </p>
            <h2 id="upgrade-modal-title" className="rj-display mt-3 max-w-xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Desbloqueie o Resolva Jato por apenas{' '}
              <span className="bg-gradient-to-r from-amber-200 via-amber-100 to-sky-200 bg-clip-text text-transparent">
                {premium.priceLabel}
              </span>
            </h2>
            <ul className="mt-4 max-w-lg space-y-1.5 text-sm text-slate-300">
              <li>· Continue editando e baixando sem interrupção</li>
              <li>· Menos que um cafezinho por 30 dias</li>
            </ul>

            <div className="mt-8 flex flex-wrap items-end gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Premium · 30 dias</p>
                <p className="rj-display mt-1 text-5xl font-black tracking-tight text-white sm:text-6xl">
                  {premium.priceLabel}
                  <span className="ml-1 text-lg font-semibold text-slate-400">{premium.period}</span>
                </p>
              </div>
            </div>

            <PlanBenefitsList
              benefits={premium.benefits}
              limit={3}
              layout="stack"
              className="mt-8 sm:grid-cols-3"
              iconWrapClassName="bg-sky-400/15 text-sky-300"
              titleClassName="text-white"
              textClassName="text-slate-400"
            />
            <TrustSeals tone="dark" className="mt-6 lg:grid-cols-4" />

            {nextReleaseAtLabel ? (
              <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-slate-400">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                Sem Premium, um novo pacote gratuito libera em {nextReleaseAtLabel}.
              </p>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                type="button"
                onClick={onUnlock}
                className="h-14 flex-1 bg-gradient-to-r from-amber-300 via-amber-200 to-sky-200 text-base font-black text-slate-950 shadow-[0_18px_40px_rgba(251,191,36,0.25)] hover:from-amber-200 hover:via-white hover:to-sky-100"
              >
                Desbloquear agora por {premium.priceLabel}
                <ArrowRight className="h-5 w-5" />
              </Button>
              {onLeave ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onLeave}
                  className="h-14 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  Continuar na busca gratuita
                </Button>
              ) : (
                <Button asChild variant="outline" className="h-14 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  <Link href="/busca">Continuar na busca gratuita</Link>
                </Button>
              )}
            </div>

            <p className="mt-5 text-center text-[11px] leading-5 text-slate-500 sm:text-left">
              Pagamento seguro via Mercado Pago. A busca de recursos continua gratuita para todos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
