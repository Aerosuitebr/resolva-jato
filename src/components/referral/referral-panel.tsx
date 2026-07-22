'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Gift, Loader2, MessageCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { REFERRAL_BATCH_SIZE } from '@/lib/referral-shared';
import { cn } from '@/lib/utils';

interface ReferralDashboard {
  code: string;
  inviteUrl: string;
  whatsappUrl: string;
  batchSize: number;
  activations: number;
  pendingReferrals: number;
  remainingForReward: number;
  progressInBatch: number;
  rewardsCount: number;
  lastRewardExpiresAt: string | null;
}

export function ReferralPanel({ className }: { className?: string }) {
  const { toast } = useToast();
  const [data, setData] = useState<ReferralDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/referral/me');
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error || 'Não foi possível carregar indicações.');
      setData(json as ReferralDashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast(`${label} copiado.`);
    } catch {
      toast('Não foi possível copiar.');
    }
  }

  const batch = data?.batchSize || REFERRAL_BATCH_SIZE;
  const progress = data?.progressInBatch ?? 0;
  const pct = Math.min(100, Math.round((progress / batch) * 100));

  return (
    <section
      className={cn(
        'rounded-[28px] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-6 shadow-sm sm:p-7',
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
            <Gift className="h-3.5 w-3.5" />
            Indique e ganhe
          </p>
          <h2 className="rj-display mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
            3 amigos ativos = 1 mês Premium
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Seu amigo precisa confirmar o e-mail e usar uma ferramenta (salvar ou baixar PDF). Aí
            conta como ativo. A cada 3, você ganha 30 dias de Premium — empilha com o que já tiver.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Atualizar'}
        </Button>
      </div>

      {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}

      {loading && !data ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando seu link…
        </div>
      ) : data ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Neste ciclo</p>
              <p className="mt-1 text-2xl font-black tabular-nums text-slate-900">
                {progress}/{batch}
              </p>
              <p className="mt-1 text-xs text-slate-500">amigos ativos</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Faltam</p>
              <p className="mt-1 text-2xl font-black tabular-nums text-slate-900">
                {data.remainingForReward}
              </p>
              <p className="mt-1 text-xs text-slate-500">para o próximo mês Pro</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Já ganhos</p>
              <p className="mt-1 text-2xl font-black tabular-nums text-slate-900">
                {data.rewardsCount}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {data.pendingReferrals > 0
                  ? `${data.pendingReferrals} convite(s) ainda sem uso`
                  : 'meses Premium por indicação'}
              </p>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-amber-400 transition-all"
              style={{ width: `${pct}%` }}
              aria-hidden
            />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Seu código</p>
            <p className="mt-1 font-mono text-xl font-black tracking-wider text-slate-900">{data.code}</p>
            <p className="mt-3 break-all rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
              {data.inviteUrl}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button
                className="bg-emerald-600 hover:bg-emerald-500"
                onClick={() => void copy(data.inviteUrl, 'Link')}
              >
                <Copy className="h-4 w-4" />
                Copiar link
              </Button>
              <Button variant="outline" asChild>
                <a href={data.whatsappUrl} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  Convidar no WhatsApp
                </a>
              </Button>
              <Button variant="ghost" onClick={() => void copy(data.code, 'Código')}>
                <Users className="h-4 w-4" />
                Copiar código
              </Button>
            </div>
          </div>

          {data.rewardsCount > 0 ? (
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">
              <Check className="h-4 w-4" />
              {data.lastRewardExpiresAt
                ? `Última recompensa empilhada no Premium (válido até ${new Date(data.lastRewardExpiresAt).toLocaleDateString('pt-BR')}).`
                : 'Recompensas de indicação já creditadas.'}
            </p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
