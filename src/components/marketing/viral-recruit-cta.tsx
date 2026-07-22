'use client';

import Link from 'next/link';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  buildViralInviteWhatsAppUrl,
  viralOrcamentoSignupPath,
  viralOrcamentoToolPath
} from '@/lib/viral-loop';
import { cn } from '@/lib/utils';

/** CTA para quem recebeu o orçamento — recruta o próximo profissional. */
export function ViralRecruitCard({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        'rounded-[28px] border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-400 text-slate-950">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-slate-900">Gostou de receber assim?</p>
          <p className="mt-1.5 text-sm leading-6 text-slate-600">
            Cobrar com orçamento + Pix no WhatsApp é grátis para testar. Monte o seu em minutos.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button asChild className="h-11 bg-amber-400 font-bold text-slate-950 hover:bg-amber-300">
              <Link href={viralOrcamentoSignupPath()}>
                Quero cobrar assim
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11">
              <Link href={viralOrcamentoToolPath()}>Já tenho conta</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ViralRecruitSticky() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-200 bg-slate-950 p-4 text-white">
      <div className="mx-auto flex max-w-lg flex-col gap-2 sm:flex-row sm:items-center">
        <p className="flex-1 text-center text-xs leading-5 text-slate-300 sm:text-left">
          Quer cobrar assim no WhatsApp? Monte seu orçamento grátis.
        </p>
        <Button asChild className="h-11 shrink-0 bg-amber-400 font-bold text-slate-950 hover:bg-amber-300">
          <Link href={viralOrcamentoSignupPath()}>
            Quero cobrar assim
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

/** Pack de indicação após gerar link (profissional → colegas). */
export function ViralInviteShareRow({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-slate-50 p-3', className)}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Indicar Resolva Jato</p>
      <p className="mt-1 text-sm leading-5 text-slate-600">
        Mande para um colega que também cobra no WhatsApp.
      </p>
      <Button asChild variant="outline" className="mt-3 h-10 w-full border-emerald-200 bg-white">
        <a href={buildViralInviteWhatsAppUrl()} target="_blank" rel="noreferrer">
          <MessageCircle className="h-4 w-4 text-emerald-700" />
          Compartilhar no WhatsApp
        </a>
      </Button>
    </div>
  );
}
