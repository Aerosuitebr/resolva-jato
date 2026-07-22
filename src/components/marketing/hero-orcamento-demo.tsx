'use client';

import { useMemo, useState } from 'react';
import { Check, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatBrl(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function HeroOrcamentoDemo({ className }: { className?: string }) {
  const [profissional, setProfissional] = useState('Ana Lima Design');
  const [cliente, setCliente] = useState('Mercado Central Ltda');
  const [servico, setServico] = useState('Identidade visual + kit redes');
  const [valor, setValor] = useState('2450');

  const total = useMemo(() => {
    const parsed = Number(String(valor).replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [valor]);

  return (
    <div className={cn('grid gap-4', className)}>
      <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
          Experimente agora · sem cadastro
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-sky-100">
            Seu nome / empresa
            <input
              value={profissional}
              onChange={(e) => setProfissional(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-white/15 bg-slate-950/40 px-3 text-sm text-white outline-none ring-amber-300/0 transition placeholder:text-slate-400 focus:ring-2 focus:ring-amber-300/60"
            />
          </label>
          <label className="block text-xs font-semibold text-sky-100">
            Cliente
            <input
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-white/15 bg-slate-950/40 px-3 text-sm text-white outline-none transition focus:ring-2 focus:ring-amber-300/60"
            />
          </label>
          <label className="block text-xs font-semibold text-sky-100 sm:col-span-2">
            Serviço
            <input
              value={servico}
              onChange={(e) => setServico(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-white/15 bg-slate-950/40 px-3 text-sm text-white outline-none transition focus:ring-2 focus:ring-amber-300/60"
            />
          </label>
          <label className="block text-xs font-semibold text-sky-100 sm:col-span-2">
            Valor (R$)
            <input
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value.replace(/[^\d.,]/g, ''))}
              className="mt-1.5 h-10 w-full rounded-xl border border-white/15 bg-slate-950/40 px-3 text-sm text-white outline-none transition focus:ring-2 focus:ring-amber-300/60"
            />
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-emerald-200/30 bg-white text-slate-800 shadow-2xl shadow-emerald-950/30">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-emerald-50 px-4 py-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
              Orçamento · aprovação
            </p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">{profissional || 'Seu negócio'}</p>
          </div>
          <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            No WhatsApp
          </span>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div>
            <p className="text-xs text-slate-500">Para</p>
            <p className="text-sm font-semibold text-slate-900">{cliente || 'Nome do cliente'}</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-800">{servico || 'Descrição do serviço'}</p>
                <p className="mt-1 text-xs text-slate-500">1 × item</p>
              </div>
              <p className="shrink-0 text-sm font-bold text-slate-900">{formatBrl(total)}</p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
            <p className="text-2xl font-black tracking-tight text-slate-950">{formatBrl(total)}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white"
              tabIndex={-1}
            >
              <Check className="h-4 w-4" />
              Aprovar
            </button>
            <button
              type="button"
              className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700"
              tabIndex={-1}
            >
              Ajustar
            </button>
          </div>

          <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/70 p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-lg bg-white text-emerald-700 shadow-sm">
                <QrCode className="h-8 w-8" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-900">Cobrança Pix</p>
                <p className="text-xs leading-5 text-emerald-800/80">
                  QR Code e Copia e Cola prontos para colar no WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
