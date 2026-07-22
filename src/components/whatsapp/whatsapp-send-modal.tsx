'use client';

import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Loader2, MessageCircle, QrCode, Unplug, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { formatPhone } from '@/lib/formatters';

interface WhatsAppSendModalProps {
  open: boolean;
  onClose: () => void;
  ownerEmail: string;
  /** Telefone do destinatário (pode ser editado na modal). */
  toPhone?: string;
  message: string;
  destinationHint?: string;
  onSent?: () => void;
  /**
   * Plano grátis: esconde wa.me (texto editável) para a marca ir só pelo servidor.
   * Premium: permite abrir no WhatsApp Web/app.
   */
  allowWaMeFallback?: boolean;
  /** Exibe aviso de que a referência Resolva Jato não pode ser removida. */
  brandLocked?: boolean;
}

function digitsOnly(value: string) {
  return value.replace(/\D+/g, '');
}

function buildWaMeUrl(phone: string, text: string) {
  const digits = digitsOnly(phone);
  const withCountry = digits.startsWith('55') ? digits : digits ? `55${digits}` : '';
  const base = withCountry ? `https://wa.me/${withCountry}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function WhatsAppSendModal({
  open,
  onClose,
  ownerEmail,
  toPhone = '',
  message,
  destinationHint = 'Número do destinatário',
  onSent,
  allowWaMeFallback = true,
  brandLocked = false
}: WhatsAppSendModalProps) {
  const { toast } = useToast();
  const [phone, setPhone] = useState(toPhone);
  const [state, setState] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) setPhone(toPhone);
  }, [open, toPhone]);

  const refresh = useCallback(async () => {
    if (!ownerEmail) return;
    try {
      const res = await fetch(`/api/whatsapp/session?ownerEmail=${encodeURIComponent(ownerEmail)}`, {
        cache: 'no-store'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao consultar sessão.');
      setState(data.state || null);
      setQr(data.qr || null);
      setError(data.error || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao consultar WhatsApp.');
    }
  }, [ownerEmail]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function start() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/whatsapp/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ownerEmail })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Falha ao iniciar sessão.');
        if (!cancelled) {
          setState(data.state || null);
          setQr(data.qr || null);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Falha ao iniciar.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    start();
    const timer = window.setInterval(() => {
      refresh();
    }, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [open, ownerEmail, refresh]);

  async function handleSend() {
    const destination = digitsOnly(phone);
    if (destination.length < 10) {
      setError('Informe um WhatsApp válido com DDD.');
      return;
    }

    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/whatsapp/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerEmail,
          to: phone,
          text: message,
          disconnectAfter: true
        })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.qr) setQr(data.qr);
        if (data.state) setState(data.state);
        throw new Error(data.error || 'Falha ao enviar.');
      }
      toast('Mensagem enviada. Seu WhatsApp foi desconectado do servidor.');
      onSent?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao enviar.');
    } finally {
      setSending(false);
    }
  }

  async function handleCancelDisconnect() {
    try {
      await fetch('/api/whatsapp/session', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerEmail })
      });
    } catch {
      // ignore
    }
    onClose();
  }

  async function handleCopyAndOpenWaMe() {
    if (!allowWaMeFallback) return;
    try {
      await navigator.clipboard.writeText(message);
      toast('Mensagem copiada. Abrindo WhatsApp…');
    } catch {
      toast('Abrindo WhatsApp…');
    }
    window.open(buildWaMeUrl(phone, message), '_blank', 'noopener,noreferrer');
  }

  if (!open) return null;

  const connected = state === 'open';
  const qrSrc = qr ? (qr.startsWith('data:') ? qr : `data:image/png;base64,${qr}`) : null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/50 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              Envio com o seu WhatsApp
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Conecte, envie e desconecte</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Escaneie o QR com o WhatsApp que vai enviar. Depois do envio, o servidor desconecta.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            onClick={handleCancelDisconnect}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {destinationHint}
            </span>
            <Input
              value={phone}
              onChange={(event) => setPhone(formatPhone(event.target.value))}
              placeholder="(62) 99999-0000"
              inputMode="tel"
            />
          </label>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Mensagem</p>
            <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-xs leading-5 text-slate-700">
              {message}
            </pre>
            {brandLocked ? (
              <p className="mt-3 text-[11px] leading-4 text-slate-500">
                A referência Resolva Jato vai no envio pelo servidor e não pode ser removida neste
                plano. No Premium as mensagens saem sem essa marca.
              </p>
            ) : null}
          </div>

          <ol className="space-y-2 text-sm leading-6 text-slate-700">
            <li>
              <strong>1.</strong> Escaneie o QR com o WhatsApp que vai <em>enviar</em> (o seu).
            </li>
            <li>
              <strong>2.</strong> Confira o número do destinatário e toque em enviar.
            </li>
            <li>
              <strong>3.</strong> O servidor desconecta automaticamente após o envio.
            </li>
          </ol>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparando sessão...
            </div>
          ) : connected ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
              WhatsApp conectado. Pode enviar agora.
            </div>
          ) : qrSrc ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
              <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <QrCode className="h-3.5 w-3.5" />
                Escaneie agora
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrSrc} alt="QR Code do seu WhatsApp" className="mx-auto h-56 w-56 object-contain" />
              <p className="mt-3 text-xs text-slate-500">
                WhatsApp → Aparelhos conectados → Conectar um aparelho
              </p>
            </div>
          ) : (
            <p className="text-sm text-amber-800">
              {allowWaMeFallback
                ? 'QR ainda não disponível. Aguarde ou use o atalho abaixo.'
                : 'QR ainda não disponível. Aguarde a conexão para enviar pelo servidor.'}
            </p>
          )}

          {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

          <div className="flex flex-col gap-2">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-500"
              disabled={!connected || sending}
              onClick={handleSend}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
              Enviar e desconectar
            </Button>
            {allowWaMeFallback ? (
              <Button type="button" variant="outline" className="w-full" onClick={handleCopyAndOpenWaMe}>
                <ExternalLink className="h-4 w-4" />
                Abrir no WhatsApp (wa.me)
              </Button>
            ) : null}
            <Button type="button" variant="ghost" className="w-full" onClick={handleCancelDisconnect}>
              <Unplug className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
