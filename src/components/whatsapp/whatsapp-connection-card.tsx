'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, MessageCircle, RefreshCw, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface WhatsAppStatus {
  configured?: boolean;
  hint?: string;
  evolution?: {
    baseUrl?: string | null;
    instance?: string;
    state?: string | null;
    qr?: string | null;
    error?: string | null;
  };
}

export function WhatsAppConnectionCard() {
  const { toast } = useToast();
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/status', { cache: 'no-store' });
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ configured: false, hint: 'Não foi possível consultar a Evolution.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 8000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  async function ensureInstance() {
    setBusy(true);
    try {
      const res = await fetch('/api/whatsapp/status', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao preparar instância.');
      toast(data.created ? 'Instância criada. Escaneie o QR.' : 'Instância pronta. Atualize o QR se precisar.');
      await refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Falha ao conectar WhatsApp.');
    } finally {
      setBusy(false);
    }
  }

  const state = status?.evolution?.state || 'unknown';
  const connected = state === 'open';
  const qr = status?.evolution?.qr;
  const qrSrc = qr ? (qr.startsWith('data:') ? qr : `data:image/png;base64,${qr}`) : null;

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            WhatsApp independente
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Evolution própria do Resolva Jato (porta 18083). Não usa o Aerosuite.
          </p>
        </div>
        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={refresh} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span
          className={
            connected
              ? 'rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800'
              : 'rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900'
          }
        >
          {connected ? 'Conectado' : `Status: ${state}`}
        </span>
        <span className="text-xs text-slate-500">
          Instância {status?.evolution?.instance || 'resolva-jato'} ·{' '}
          {status?.evolution?.baseUrl || 'http://localhost:18083'}
        </span>
      </div>

      {!connected ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-slate-600">
            1. <code className="rounded bg-slate-100 px-1">npm run whatsapp:up</code>
            <br />
            2. Prepare a instância e escaneie o QR no WhatsApp do profissional.
          </p>
          <Button onClick={ensureInstance} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
            Preparar / atualizar QR
          </Button>
          {qrSrc ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrSrc} alt="QR Code WhatsApp" className="mx-auto h-56 w-56 object-contain" />
              <p className="mt-3 text-center text-xs text-slate-500">
                WhatsApp → Aparelhos conectados → Conectar um aparelho
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              {status?.hint || status?.evolution?.error || 'QR ainda não disponível. Clique em preparar.'}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">
          <MessageCircle className="h-4 w-4" />
          Envios de orçamento saem direto pela API deste WhatsApp.
        </p>
      )}
    </div>
  );
}
