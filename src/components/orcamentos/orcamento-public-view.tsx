'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  Mail,
  MessageCircle,
  Smartphone,
  ThumbsDown,
  ThumbsUp,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { formatCurrency } from '@/lib/formatters';
import type { OrcamentoPublic } from '@/lib/orcamentos/types';
import { cn } from '@/lib/utils';

interface OrcamentoPublicViewProps {
  initial: OrcamentoPublic;
}

interface NotifyPayload {
  emailSent?: boolean;
  smsSent?: boolean;
  smsConfigured?: boolean;
  whatsappUrl?: string;
  whatsappApiSent?: boolean;
  whatsappApiConfigured?: boolean;
  whatsappApiError?: string;
  whatsappProvider?: string | null;
  pushSent?: number;
  pushConfigured?: boolean;
}

export function OrcamentoPublicView({ initial }: OrcamentoPublicViewProps) {
  const { toast } = useToast();
  const [orcamento, setOrcamento] = useState(initial);
  const [showDecline, setShowDecline] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notify, setNotify] = useState<NotifyPayload | null>(null);
  const [whatsappOpened, setWhatsappOpened] = useState(false);

  const pending = orcamento.status === 'pending';
  const needsWhatsAppGate = !pending && !whatsappOpened;

  async function submitStatus(status: 'approved' | 'declined') {
    setError('');
    setSubmitting(true);
    try {
      const response = await fetch(`/api/orcamentos/${orcamento.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          feedbackCliente: status === 'declined' ? feedback : null
        })
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.orcamento) setOrcamento(data.orcamento);
        throw new Error(data.error || 'Não foi possível registrar a resposta.');
      }

      const { notifications, ...rest } = data as OrcamentoPublic & { notifications?: NotifyPayload };
      setOrcamento(rest);
      setNotify(notifications || null);
      setShowDecline(false);
      setWhatsappOpened(false);
      toast(
        status === 'approved'
          ? 'Aprovado! Abrindo seu WhatsApp para avisar o profissional…'
          : 'Registrado! Abrindo seu WhatsApp para avisar o profissional…'
      );

      // O próprio cliente dispara o aviso: abre o WhatsApp DELE com mensagem pronta para o prestador.
      const waUrl = notifications?.whatsappUrl;
      if (waUrl) {
        window.setTimeout(() => {
          window.location.href = waUrl;
          setWhatsappOpened(true);
        }, 400);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Falha ao enviar resposta.');
    } finally {
      setSubmitting(false);
    }
  }

  function openWhatsAppNotify() {
    const url =
      notify?.whatsappUrl ||
      (() => {
        const phone = orcamento.profissionalWhatsapp.replace(/\D+/g, '');
        const withCountry = phone.length >= 10 && !phone.startsWith('55') ? `55${phone}` : phone;
        const text = encodeURIComponent(
          orcamento.status === 'approved'
            ? `Olá ${orcamento.profissionalNome}! Sou ${orcamento.clienteNome}. Aprovei o orçamento de ${formatCurrency(orcamento.total)}. Podemos seguir?`
            : `Olá ${orcamento.profissionalNome}! Sou ${orcamento.clienteNome}. Sobre o orçamento (${formatCurrency(orcamento.total)}): ${orcamento.feedbackCliente || feedback || 'gostaria de ajustar.'}`
        );
        return `https://wa.me/${withCountry}?text=${text}`;
      })();

    window.location.href = url;
    setWhatsappOpened(true);
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ecfdf5_45%,#f8fafc_100%)] pb-28 text-slate-900">
      <div className="mx-auto max-w-lg px-4 pb-8 pt-8 sm:px-6">
        <header className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
            Orçamento digital
          </p>
          <h1 className="rj-display mt-2 text-2xl font-extrabold tracking-tight">
            {orcamento.profissionalNome}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Preparado para <strong>{orcamento.clienteNome}</strong>
          </p>
          <div className="mt-5 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
              <p className="text-3xl font-black text-emerald-700">{formatCurrency(orcamento.total)}</p>
            </div>
            <StatusPill status={orcamento.status} />
          </div>
          {orcamento.validade ? (
            <p className="mt-3 text-xs text-slate-500">Validade: {orcamento.validade}</p>
          ) : null}
        </header>

        <section className="mt-4 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-900">Itens</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {orcamento.itens.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-semibold text-slate-900">{item.nome}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.quantidade} × {formatCurrency(item.valorUnitario)}
                  </p>
                </div>
                <p className="shrink-0 font-bold text-slate-900">
                  {formatCurrency(item.quantidade * item.valorUnitario)}
                </p>
              </li>
            ))}
          </ul>
          {orcamento.observacoes ? (
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Observações</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {orcamento.observacoes}
              </p>
            </div>
          ) : null}
        </section>

        {!pending ? (
          <section
            className={cn(
              'mt-4 rounded-[28px] border p-5',
              needsWhatsAppGate
                ? 'border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-900/10'
                : orcamento.status === 'approved'
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-amber-200 bg-amber-50'
            )}
          >
            <div className="flex items-start gap-3">
              {orcamento.status === 'approved' ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 text-amber-700" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900">
                  {orcamento.status === 'approved' ? 'Orçamento aprovado' : 'Ajuste solicitado'}
                </p>
                {orcamento.status === 'declined' && orcamento.feedbackCliente ? (
                  <p className="mt-1 text-sm leading-6 text-slate-700">{orcamento.feedbackCliente}</p>
                ) : null}

                <div className="mt-4 rounded-2xl border border-emerald-200 bg-white p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Smartphone className="h-4 w-4 text-emerald-700" />
                    Avisar no WhatsApp do profissional
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    A mensagem sai do <strong>seu</strong> WhatsApp para o prestador, sem login e sem
                    escanear QR. Se o app não abriu, toque abaixo.
                  </p>
                  <Button
                    className="mt-4 h-12 w-full bg-emerald-600 text-base hover:bg-emerald-500"
                    onClick={openWhatsAppNotify}
                  >
                    <MessageCircle className="h-5 w-5" />
                    {whatsappOpened ? 'Abrir WhatsApp de novo' : 'Abrir WhatsApp e avisar'}
                  </Button>
                </div>

                <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                  {notify?.smsSent ? (
                    <li className="font-semibold text-emerald-800">SMS automático enviado ao celular</li>
                  ) : notify?.smsConfigured === false ? (
                    <li>SMS automático: disponível quando o servidor tiver Twilio configurado</li>
                  ) : null}
                  {notify?.emailSent ? (
                    <li className="inline-flex items-center gap-1.5 font-semibold text-emerald-800">
                      <Mail className="h-3.5 w-3.5" />
                      E-mail de alerta enviado
                    </li>
                  ) : (
                    <li className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      E-mail: enviado automaticamente quando ativo no sistema
                    </li>
                  )}
                  {typeof notify?.pushSent === 'number' && notify.pushSent > 0 ? (
                    <li className="font-semibold text-emerald-800">Push extra enviado (Android / PWA)</li>
                  ) : null}
                </ul>
              </div>
            </div>
          </section>
        ) : null}

        {showDecline && pending ? (
          <section className="mt-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-900">O que você gostaria de ajustar?</p>
            <Textarea
              className="mt-3"
              rows={4}
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              placeholder="Ex.: gostaria de parcelar, retirar o item X, reduzir o prazo..."
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                onClick={() => submitStatus('declined')}
                disabled={submitting || !feedback.trim()}
                className="bg-rose-600 hover:bg-rose-500"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsDown className="h-4 w-4" />}
                Enviar pedido de ajuste
              </Button>
              <Button variant="ghost" onClick={() => setShowDecline(false)} disabled={submitting}>
                Cancelar
              </Button>
            </div>
          </section>
        ) : null}

        {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}

        <p className="mt-8 text-center text-[11px] text-slate-400">
          Powered by Resolva Jato · Documento gerado para análise do cliente
        </p>
      </div>

      {pending ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
          <div className="mx-auto max-w-lg space-y-2">
            <p className="text-center text-[11px] leading-4 text-slate-500">
              Ao aprovar ou pedir ajuste, abrimos o seu WhatsApp com a mensagem pronta para o profissional.
            </p>
            <div className="flex gap-3">
              <Button
                className="h-12 flex-1 bg-emerald-600 hover:bg-emerald-500"
                onClick={() => submitStatus('approved')}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                Aprovar
              </Button>
              <Button
                className="h-12 flex-1"
                variant="outline"
                onClick={() => setShowDecline(true)}
                disabled={submitting}
              >
                <ThumbsDown className="h-4 w-4" />
                Recusar / ajustar
              </Button>
            </div>
          </div>
        </div>
      ) : needsWhatsAppGate ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-emerald-200 bg-emerald-600 p-4 text-white">
          <div className="mx-auto max-w-lg space-y-2">
            <p className="text-center text-xs text-emerald-50">
              Confirme o envio: toque para abrir o WhatsApp e avisar {orcamento.profissionalNome}.
            </p>
            <Button
              className="h-12 w-full bg-white text-base font-bold text-emerald-900 hover:bg-emerald-50"
              onClick={openWhatsAppNotify}
            >
              <MessageCircle className="h-5 w-5" />
              Abrir WhatsApp e avisar o profissional
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatusPill({ status }: { status: OrcamentoPublic['status'] }) {
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
        Aprovado
      </span>
    );
  }
  if (status === 'declined') {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
        Ajuste solicitado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
      Aguardando
    </span>
  );
}
