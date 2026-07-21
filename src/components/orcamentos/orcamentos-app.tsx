'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Receipt,
  RefreshCw,
  Timer,
  UserRound,
  XCircle
} from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { ToolsWatermark } from '@/components/brand/tools-watermark';
import { OrcamentoItemsEditor } from '@/components/orcamentos/orcamento-items-editor';
import { EnablePushButton } from '@/components/push/enable-push-button';
import { ToolsBackButton } from '@/components/shared/tools-back-button';
import { WhatsAppSendModal } from '@/components/whatsapp/whatsapp-send-modal';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use-auth';
import { performBillableAction } from '@/lib/billing';
import { formatCurrency, formatPhone } from '@/lib/formatters';
import {
  createEmptyItem,
  loadOrcamentoPrefs,
  saveOrcamentoPrefs
} from '@/lib/orcamentos/defaults';
import { buildClienteOrcamentoWhatsAppText, buildClienteWhatsAppSendUrl } from '@/lib/orcamentos/whatsapp-links';
import {
  calcOrcamentoTotal,
  type OrcamentoHistoryItem,
  type OrcamentoItem,
  type OrcamentoStatus
} from '@/lib/orcamentos/types';
import { isValidEmail, isValidPhone } from '@/lib/validators';
import { cn } from '@/lib/utils';

interface GeneratedLink {
  id: string;
  url: string;
  clienteNome: string;
  clienteWhatsapp: string;
  clienteEmail: string;
  total: number;
  whatsappApiSent?: boolean;
  whatsappApiConfigured?: boolean;
  whatsappApiError?: string | null;
}

interface FieldErrors {
  clienteNome?: string;
  clienteWhatsapp?: string;
  items?: string;
  profissionalNome?: string;
  profissionalWhatsapp?: string;
}

const QUICK_NOTES = ['50% na entrada', 'Pagamento via Pix', 'Prazo de 7 dias úteis', 'Materiais inclusos'];
const PERIOD_OPTIONS = ['7', '15', '30'];

function statusLabel(status: OrcamentoStatus) {
  if (status === 'approved') return 'Aprovado';
  if (status === 'declined') return 'Alteração solicitada';
  return 'Aguardando resposta';
}

function statusClass(status: OrcamentoStatus) {
  if (status === 'approved') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (status === 'declined') return 'border-rose-200 bg-rose-50 text-rose-800';
  return 'border-amber-200 bg-amber-50 text-amber-900';
}

function StatusIcon({ status, className }: { status: OrcamentoStatus; className?: string }) {
  if (status === 'approved') return <CheckCircle2 className={cn('h-3.5 w-3.5', className)} aria-hidden />;
  if (status === 'declined') return <XCircle className={cn('h-3.5 w-3.5', className)} aria-hidden />;
  return <Clock3 className={cn('h-3.5 w-3.5', className)} aria-hidden />;
}

function formatPhoneDisplay(digits: string) {
  return formatPhone(digits);
}

type ChecklistKey = 'profissional' | 'cliente' | 'itens' | 'valor';

const CHECKLIST_TARGETS: Record<ChecklistKey, { sectionId: string; focusId: string }> = {
  profissional: { sectionId: 'orc-section-profissional', focusId: 'orc-profissional-nome' },
  cliente: { sectionId: 'orc-section-cliente', focusId: 'orc-cliente-nome' },
  itens: { sectionId: 'orc-section-itens', focusId: 'orc-item-0-nome' },
  valor: { sectionId: 'orc-section-itens', focusId: 'orc-item-0-nome' }
};

function detectValidadeMode(value: string): 'period' | 'date' {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value.trim()) ? 'date' : 'period';
}

export function OrcamentosApp() {
  const { toast } = useToast();
  const { session, usage, refresh: refreshAuth } = useAuth();
  const [profissionalNome, setProfissionalNome] = useState('');
  const [profissionalWhatsapp, setProfissionalWhatsapp] = useState('');
  const [profissionalEmail, setProfissionalEmail] = useState('');
  const [profissionalCollapsed, setProfissionalCollapsed] = useState(false);
  const hasHydratedProfissionalRef = useRef(false);
  const [clienteNome, setClienteNome] = useState('');
  const [clienteWhatsapp, setClienteWhatsapp] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [validade, setValidade] = useState('');
  const [validadeMode, setValidadeMode] = useState<'period' | 'date'>('period');
  const [observacoes, setObservacoes] = useState('');
  const [items, setItems] = useState<OrcamentoItem[]>([createEmptyItem()]);
  const [generating, setGenerating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [bannerError, setBannerError] = useState('');
  const [generated, setGenerated] = useState<GeneratedLink | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [history, setHistory] = useState<OrcamentoHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [whatsAppApiReady, setWhatsAppApiReady] = useState<boolean | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [sendModal, setSendModal] = useState<{
    id: string;
    url: string;
    clienteNome: string;
    clienteWhatsapp: string;
    profissionalNome: string;
    total: number;
  } | null>(null);

  const total = useMemo(() => calcOrcamentoTotal(items), [items]);
  const ownerEmail = (profissionalEmail || session?.user.email || '').trim().toLowerCase();
  const professionalComplete = Boolean(
    profissionalNome.trim() && profissionalWhatsapp.replace(/\D+/g, '').length >= 10 && profissionalEmail.trim()
  );

  const hasValidItem = useMemo(
    () => items.some((item) => item.nome.trim() && item.valorUnitario > 0 && item.quantidade >= 1),
    [items]
  );

  const checklist = useMemo(
    () =>
      [
        {
          key: 'profissional' as const,
          label: 'Dados profissionais',
          hint: 'Nome e WhatsApp com DDD',
          done: Boolean(profissionalNome.trim() && isValidPhone(profissionalWhatsapp))
        },
        {
          key: 'cliente' as const,
          label: 'Dados do cliente',
          hint: 'Nome e WhatsApp para envio',
          done: Boolean(clienteNome.trim() && isValidPhone(clienteWhatsapp))
        },
        {
          key: 'itens' as const,
          label: 'Pelo menos um item',
          hint: 'Nome + quantidade + valor',
          done: hasValidItem
        },
        {
          key: 'valor' as const,
          label: 'Valor maior que zero',
          hint: 'Defina ao menos um item com valor > 0',
          done: total > 0
        }
      ] satisfies Array<{ key: ChecklistKey; label: string; hint: string; done: boolean }>,
    [profissionalNome, profissionalWhatsapp, clienteNome, clienteWhatsapp, hasValidItem, total]
  );

  const liveHints = useMemo(() => {
    const hints: string[] = [];
    if (clienteNome.trim() && !clienteWhatsapp.trim()) {
      hints.push('Informe o WhatsApp do cliente para enviar o link.');
    }
    if (clienteWhatsapp.trim() && !isValidPhone(clienteWhatsapp)) {
      hints.push('WhatsApp do cliente inválido — use DDD + número.');
    }
    if (profissionalWhatsapp.trim() && !isValidPhone(profissionalWhatsapp)) {
      hints.push('Seu WhatsApp parece incompleto — confira o DDD.');
    }
    if (clienteEmail.trim() && !isValidEmail(clienteEmail)) {
      hints.push('E-mail do cliente inválido.');
    }
    if (profissionalEmail.trim() && !isValidEmail(profissionalEmail)) {
      hints.push('E-mail de alertas inválido.');
    }
    if (items.some((item) => item.nome.trim() && item.valorUnitario <= 0)) {
      hints.push('Há item com nome, mas valor zero. Informe um valor > 0.');
    }
    if (!hasValidItem && items.some((item) => item.nome.trim() || item.valorUnitario > 0)) {
      hints.push('Defina pelo menos um item com nome e valor maior que zero.');
    }
    return hints;
  }, [
    clienteNome,
    clienteWhatsapp,
    clienteEmail,
    profissionalWhatsapp,
    profissionalEmail,
    items,
    hasValidItem
  ]);

  const missingLabels = checklist.filter((item) => !item.done).map((item) => item.label);
  const readyToGenerate = missingLabels.length === 0 && liveHints.length === 0;
  const blockedHint = !readyToGenerate
    ? liveHints[0] ||
      (missingLabels.length === 1
        ? `Preencha: ${missingLabels[0].toLowerCase()}.`
        : `Preencha ${missingLabels
            .slice(0, -1)
            .map((label) => label.toLowerCase())
            .join(', ')} e ${missingLabels[missingLabels.length - 1].toLowerCase()} para continuar.`)
    : '';

  function focusChecklistItem(key: ChecklistKey) {
    if (key === 'profissional') setProfissionalCollapsed(false);
    const target = CHECKLIST_TARGETS[key];
    window.requestAnimationFrame(() => {
      document.getElementById(target.sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => {
        const el = document.getElementById(target.focusId);
        el?.focus();
      }, 280);
    });
  }

  useEffect(() => {
    const prefs = loadOrcamentoPrefs();
    setProfissionalNome(prefs.profissionalNome);
    setProfissionalWhatsapp(prefs.profissionalWhatsapp);
    setProfissionalEmail(prefs.profissionalEmail || session?.user.email || '');
    if (!hasHydratedProfissionalRef.current) {
      hasHydratedProfissionalRef.current = true;
      setProfissionalCollapsed(
        Boolean(
          prefs.profissionalNome.trim() &&
            prefs.profissionalWhatsapp.trim() &&
            (prefs.profissionalEmail || session?.user.email || '').trim()
        )
      );
    }
  }, [session?.user.email]);

  const loadHistory = useCallback(async () => {
    if (!ownerEmail) return;
    setHistoryLoading(true);
    try {
      const response = await fetch(`/api/orcamentos?ownerEmail=${encodeURIComponent(ownerEmail)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao carregar histórico.');
      setHistory((data.items || []) as OrcamentoHistoryItem[]);
    } catch {
      // keep silent on first paint; user can refresh
    } finally {
      setHistoryLoading(false);
    }
  }, [ownerEmail]);

  useEffect(() => {
    fetch('/api/whatsapp/status')
      .then((res) => res.json())
      .then((data) => setWhatsAppApiReady(Boolean(data.configured)))
      .catch(() => setWhatsAppApiReady(false));
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  function savePrefs() {
    saveOrcamentoPrefs({
      profissionalNome,
      profissionalWhatsapp,
      profissionalEmail
    });
  }

  function payloadBody() {
    return {
      profissionalNome,
      profissionalWhatsapp,
      clienteNome,
      clienteContato: clienteWhatsapp,
      clienteEmail,
      validade,
      observacoes,
      itens: items,
      ownerEmail
    };
  }

  function appendObservacao(text: string) {
    setObservacoes((current) => (current.trim() ? `${current.trim()}\n${text}` : text));
  }

  function validateForm(): boolean {
    const errors: FieldErrors = {};
    if (!profissionalNome.trim()) errors.profissionalNome = 'Informe seu nome ou empresa.';
    if (!isValidPhone(profissionalWhatsapp)) {
      errors.profissionalWhatsapp = 'Informe seu WhatsApp com DDD.';
    }
    if (!clienteNome.trim()) errors.clienteNome = 'Informe o nome do cliente.';
    if (!isValidPhone(clienteWhatsapp)) {
      errors.clienteWhatsapp = 'Informe o WhatsApp do cliente com DDD.';
    }
    if (!hasValidItem) errors.items = 'Adicione ao menos um item com nome e valor maior que zero.';

    setFieldErrors(errors);

    if (profissionalEmail.trim() && !isValidEmail(profissionalEmail)) {
      setBannerError('Corrija o e-mail de alertas antes de gerar o link.');
      document.getElementById('orc-profissional-email')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    if (clienteEmail.trim() && !isValidEmail(clienteEmail)) {
      setBannerError('Corrija o e-mail do cliente ou deixe em branco.');
      document.getElementById('orc-cliente-email')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    const order: (keyof FieldErrors)[] = [
      'profissionalNome',
      'profissionalWhatsapp',
      'clienteNome',
      'clienteWhatsapp',
      'items'
    ];
    const firstInvalid = order.find((key) => errors[key]);
    if (firstInvalid) {
      if (firstInvalid === 'profissionalNome' || firstInvalid === 'profissionalWhatsapp') {
        setProfissionalCollapsed(false);
      }
      const idMap: Record<string, string> = {
        profissionalNome: 'orc-profissional-nome',
        profissionalWhatsapp: 'orc-profissional-whatsapp',
        clienteNome: 'orc-cliente-nome',
        clienteWhatsapp: 'orc-cliente-whatsapp',
        items: 'orc-item-0-nome'
      };
      const targetId = idMap[firstInvalid];
      window.requestAnimationFrame(() => {
        const el = document.getElementById(targetId);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el?.focus();
      });
      return false;
    }
    return true;
  }

  async function handleGenerate() {
    setBannerError('');
    if (!validateForm()) return;
    setGenerating(true);
    setEditingId(null);
    try {
      savePrefs();

      const outcome = await performBillableAction(
        {
          toolId: 'orcamentos',
          artifactId: `draft_${Date.now()}`,
          action: 'download'
        },
        async () => {
          const response = await fetch('/api/orcamentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadBody())
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Não foi possível gerar o link.');
          }
          return data as {
            id: string;
            url: string;
            total: number;
            whatsapp?: {
              sent?: boolean;
              configured?: boolean;
              error?: string | null;
            };
          };
        }
      );

      if (!outcome.allowed) {
        setBannerError(outcome.reason || 'Seu saldo não permite gerar o link agora.');
        return;
      }

      const result = outcome.result!;
      const entry: GeneratedLink = {
        id: result.id,
        url: result.url,
        clienteNome,
        clienteWhatsapp,
        clienteEmail,
        total: result.total,
        whatsappApiSent: Boolean(result.whatsapp?.sent),
        whatsappApiConfigured: Boolean(result.whatsapp?.configured),
        whatsappApiError: result.whatsapp?.error || null
      };
      setGenerated(entry);
      refreshAuth();
      await loadHistory();
      toast('Link gerado. Conecte seu WhatsApp para enviar ao cliente (escaneia → envia → desconecta).');
    } catch (submitError) {
      setBannerError(submitError instanceof Error ? submitError.message : 'Falha ao gerar orçamento.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleUpdatePending() {
    if (!editingId) return;
    setBannerError('');
    if (!validateForm()) return;
    setUpdating(true);
    try {
      savePrefs();
      const response = await fetch(`/api/orcamentos/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadBody())
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível atualizar.');

      const entry: GeneratedLink = {
        id: data.id,
        url: data.url,
        clienteNome,
        clienteWhatsapp,
        clienteEmail,
        total: data.total
      };
      setGenerated(entry);
      await loadHistory();
      toast('Orçamento atualizado. O mesmo link público continua válido.');
    } catch (submitError) {
      setBannerError(submitError instanceof Error ? submitError.message : 'Falha ao atualizar.');
    } finally {
      setUpdating(false);
    }
  }

  async function copyText(value: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast(successMessage);
    } catch {
      setBannerError('Não foi possível copiar. Selecione o texto manualmente.');
    }
  }

  function openEphemeralSend(link: {
    id: string;
    url: string;
    clienteNome: string;
    clienteWhatsapp: string;
    total: number;
    profissionalNome?: string;
  }) {
    if (!ownerEmail) {
      setBannerError('Informe seu e-mail de alertas antes de enviar pelo WhatsApp.');
      return;
    }
    if (!link.clienteWhatsapp) {
      setBannerError('Informe o WhatsApp do cliente.');
      return;
    }
    setOpenMenuId(null);
    setSendModal({
      id: link.id,
      url: link.url,
      clienteNome: link.clienteNome,
      clienteWhatsapp: link.clienteWhatsapp,
      profissionalNome: link.profissionalNome || profissionalNome,
      total: link.total
    });
  }

  function openClienteWhatsAppFallback(link: {
    clienteWhatsapp: string;
    clienteNome: string;
    url: string;
    total: number;
  }) {
    const href = buildClienteWhatsAppSendUrl({
      clienteWhatsapp: link.clienteWhatsapp,
      clienteNome: link.clienteNome,
      profissionalNome,
      url: link.url,
      total: link.total
    });
    window.open(href, '_blank', 'noopener,noreferrer');
  }

  function fillFromHistory(item: OrcamentoHistoryItem, mode: 'reuse' | 'edit') {
    setProfissionalNome(item.profissionalNome || profissionalNome);
    setProfissionalWhatsapp(formatPhoneDisplay(item.profissionalWhatsapp || profissionalWhatsapp));
    setClienteNome(item.clienteNome);
    setClienteWhatsapp(formatPhoneDisplay(item.clienteContato));
    setClienteEmail(item.clienteEmail || '');
    setValidade(item.validade || '');
    setValidadeMode(detectValidadeMode(item.validade || ''));
    setObservacoes(item.observacoes || '');
    setItems(
      item.itens?.length
        ? item.itens.map((row) => ({ ...row, id: row.id || crypto.randomUUID() }))
        : [createEmptyItem()]
    );
    setBannerError('');
    setFieldErrors({});
    setOpenMenuId(null);

    if (mode === 'edit' && item.status === 'pending') {
      setEditingId(item.id);
      setGenerated({
        id: item.id,
        url: item.url,
        clienteNome: item.clienteNome,
        clienteWhatsapp: item.clienteContato,
        clienteEmail: item.clienteEmail,
        total: item.total
      });
      toast('Orçamento carregado para edição. O link público será mantido ao salvar.');
    } else {
      setEditingId(null);
      setGenerated(null);
      toast('Dados copiados. Gere um novo link quando terminar de editar.');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const periodMatch = validade.trim().match(/^(\d+)\s*dias?$/i);
  const isKnownPeriod = Boolean(periodMatch && PERIOD_OPTIONS.includes(periodMatch[1]));
  const periodSelectValue = isKnownPeriod ? periodMatch![1] : 'custom';
  const dateMatch = validade.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const dateInputValue = dateMatch ? `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}` : '';

  return (
    <AuthGate
      title="Orçamentos exigem cadastro"
      description="Crie sua conta gratuita para gerar links de aprovação para seus clientes."
    >
      <div className="space-y-5 pb-24 lg:pb-0">
        <EnablePushButton variant="banner" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Link href="/ferramentas" className="hover:text-slate-700 hover:underline">
              Ferramentas
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span>Orçamentos</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-slate-900">Novo orçamento</span>
          </nav>
          <ToolsBackButton />
        </div>

        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 px-5 py-5 text-white shadow-sm sm:px-6">
          <ToolsWatermark />
          <div className="relative z-10 flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-300">
              <Receipt className="h-5 w-5" />
            </span>
            <div>
              <h1 className="rj-display text-xl font-extrabold tracking-tight sm:text-2xl">
                Orçamentos com link de aprovação
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                Monte, envie no WhatsApp do cliente e acompanhe o histórico. Na resposta, você recebe
                alerta no celular, e-mail e WhatsApp.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.85fr)]">
          <div className="space-y-5">
            {bannerError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
                {bannerError}
              </div>
            ) : null}

            {editingId ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                Editando orçamento aguardando resposta. Ao salvar, o <strong>mesmo link</strong> é
                atualizado.{' '}
                <button
                  type="button"
                  className="font-bold underline"
                  onClick={() => {
                    setEditingId(null);
                    setGenerated(null);
                  }}
                >
                  Cancelar edição
                </button>
              </div>
            ) : null}

            {/* Seus dados */}
            <section
              id="orc-section-profissional"
              className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-700">
                    <UserRound className="h-4 w-4" aria-hidden />
                  </span>
                  <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-900">
                    Seus dados
                  </h2>
                </div>
                {profissionalCollapsed && professionalComplete ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setProfissionalCollapsed(false)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                ) : null}
              </div>

              {profissionalCollapsed && professionalComplete ? (
                <p className="mt-3 truncate text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">{profissionalNome}</span>
                  <span className="px-1.5 text-slate-400">·</span>
                  {formatPhoneDisplay(profissionalWhatsapp)}
                  <span className="px-1.5 text-slate-400">·</span>
                  {profissionalEmail}
                </p>
              ) : (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <FormField
                    label="Seu nome / empresa"
                    required
                    htmlFor="orc-profissional-nome"
                    error={fieldErrors.profissionalNome}
                    hint="Aparece no orçamento que o cliente vê."
                  >
                    <Input
                      id="orc-profissional-nome"
                      value={profissionalNome}
                      onChange={(event) => setProfissionalNome(event.target.value)}
                      placeholder="Seu nome ou empresa"
                      className={
                        fieldErrors.profissionalNome
                          ? 'border-red-500 bg-red-50/40 focus:border-red-500 focus:ring-red-100'
                          : undefined
                      }
                      aria-invalid={Boolean(fieldErrors.profissionalNome)}
                    />
                  </FormField>
                  <FormField
                    label="Seu WhatsApp para receber respostas"
                    required
                    htmlFor="orc-profissional-whatsapp"
                    error={fieldErrors.profissionalWhatsapp}
                    hint="É o SEU número. O cliente fala com você e a aprovação chega aqui."
                  >
                    <MaskedInput
                      id="orc-profissional-whatsapp"
                      format={formatPhone}
                      value={profissionalWhatsapp}
                      onValueChange={setProfissionalWhatsapp}
                      placeholder="(62) 99999-0000"
                      invalid={
                        Boolean(fieldErrors.profissionalWhatsapp) ||
                        Boolean(profissionalWhatsapp.trim() && !isValidPhone(profissionalWhatsapp))
                      }
                      valid={Boolean(profissionalWhatsapp.trim() && isValidPhone(profissionalWhatsapp))}
                    />
                  </FormField>
                  <FormField
                    className="sm:col-span-2"
                    label="Seu e-mail de alertas"
                    required
                    htmlFor="orc-profissional-email"
                    error={
                      profissionalEmail.trim() && !isValidEmail(profissionalEmail)
                        ? 'E-mail inválido.'
                        : undefined
                    }
                    hint="Recebe e-mail quando o cliente aprovar ou pedir ajuste."
                  >
                    <Input
                      id="orc-profissional-email"
                      type="email"
                      value={profissionalEmail}
                      onChange={(event) => setProfissionalEmail(event.target.value)}
                      placeholder="seu@email.com"
                      className={cn(
                        profissionalEmail.trim() &&
                          !isValidEmail(profissionalEmail) &&
                          'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                      )}
                    />
                  </FormField>
                  {professionalComplete ? (
                    <div className="sm:col-span-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setProfissionalCollapsed(true)}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Concluir
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}
            </section>

            {/* Cliente */}
            <section
              id="orc-section-cliente"
              className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <MessageCircle className="h-4 w-4" aria-hidden />
                </span>
                <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-900">
                  Cliente
                </h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <FormField
                  label="Nome do cliente"
                  required
                  htmlFor="orc-cliente-nome"
                  error={
                    fieldErrors.clienteNome ||
                    (!clienteNome.trim() && clienteWhatsapp.trim()
                      ? 'Nome do cliente obrigatório.'
                      : undefined)
                  }
                  hint="Para quem é o orçamento."
                >
                  <Input
                    id="orc-cliente-nome"
                    value={clienteNome}
                    onChange={(event) => {
                      setClienteNome(event.target.value);
                      if (fieldErrors.clienteNome) {
                        setFieldErrors((current) => ({ ...current, clienteNome: undefined }));
                      }
                    }}
                    placeholder="Nome de quem vai receber"
                    className={
                      fieldErrors.clienteNome
                        ? 'border-red-500 bg-red-50/40 focus:border-red-500 focus:ring-red-100'
                        : undefined
                    }
                    aria-invalid={Boolean(fieldErrors.clienteNome)}
                  />
                </FormField>
                <FormField
                  label="WhatsApp para envio"
                  required
                  htmlFor="orc-cliente-whatsapp"
                  error={
                    fieldErrors.clienteWhatsapp ||
                    (clienteWhatsapp.trim() && !isValidPhone(clienteWhatsapp)
                      ? 'WhatsApp inválido. Use DDD + número.'
                      : undefined)
                  }
                  hint="Número dele. Usamos para abrir o WhatsApp e enviar o link."
                >
                  <MaskedInput
                    id="orc-cliente-whatsapp"
                    format={formatPhone}
                    value={clienteWhatsapp}
                    onValueChange={(value) => {
                      setClienteWhatsapp(value);
                      if (fieldErrors.clienteWhatsapp) {
                        setFieldErrors((current) => ({ ...current, clienteWhatsapp: undefined }));
                      }
                    }}
                    placeholder="(62) 98888-0000"
                    invalid={
                      Boolean(fieldErrors.clienteWhatsapp) ||
                      Boolean(clienteWhatsapp.trim() && !isValidPhone(clienteWhatsapp))
                    }
                    valid={Boolean(clienteWhatsapp.trim() && isValidPhone(clienteWhatsapp))}
                  />
                </FormField>
                <FormField
                  className="sm:col-span-2"
                  label="E-mail do cliente"
                  htmlFor="orc-cliente-email"
                  error={
                    clienteEmail.trim() && !isValidEmail(clienteEmail)
                      ? 'E-mail inválido.'
                      : undefined
                  }
                  hint="Opcional — útil para histórico e recontato."
                >
                  <Input
                    id="orc-cliente-email"
                    type="email"
                    value={clienteEmail}
                    onChange={(event) => setClienteEmail(event.target.value)}
                    placeholder="cliente@email.com"
                    className={cn(
                      clienteEmail.trim() &&
                        !isValidEmail(clienteEmail) &&
                        'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                    )}
                  />
                </FormField>
              </div>
            </section>

            {/* Itens */}
            <section
              id="orc-section-itens"
              className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="mb-4 flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-700">
                  <Package className="h-4 w-4" aria-hidden />
                </span>
                <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-900">
                  Itens do orçamento
                </h2>
              </div>
              <OrcamentoItemsEditor
                items={items}
                onChange={(next) => {
                  setItems(next);
                  if (fieldErrors.items) {
                    setFieldErrors((current) => ({ ...current, items: undefined }));
                  }
                }}
                error={
                  fieldErrors.items ||
                  (items.some((item) => item.nome.trim() && item.valorUnitario <= 0)
                    ? 'Informe um valor maior que zero neste item.'
                    : undefined)
                }
              />
            </section>

            {/* Validade */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-900">
                Validade da proposta
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-600">Como o cliente deve ler o prazo desta proposta?</p>

              <div
                className="mt-4 grid gap-3 sm:grid-cols-2"
                role="radiogroup"
                aria-label="Tipo de validade"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={validadeMode === 'period'}
                  onClick={() => {
                    setValidadeMode('period');
                    if (detectValidadeMode(validade) === 'date') setValidade('7 dias');
                  }}
                  className={cn(
                    'flex items-start gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition',
                    validadeMode === 'period'
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl',
                      validadeMode === 'period'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    <Timer className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        'block text-sm font-bold',
                        validadeMode === 'period' ? 'text-emerald-950' : 'text-slate-900'
                      )}
                    >
                      Por período
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-600">
                      Ex.: 7, 15 ou 30 dias a partir do envio
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={validadeMode === 'date'}
                  onClick={() => {
                    setValidadeMode('date');
                    if (detectValidadeMode(validade) !== 'date') setValidade('');
                  }}
                  className={cn(
                    'flex items-start gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition',
                    validadeMode === 'date'
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl',
                      validadeMode === 'date'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        'block text-sm font-bold',
                        validadeMode === 'date' ? 'text-emerald-950' : 'text-slate-900'
                      )}
                    >
                      Até uma data
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-600">
                      Escolha o dia limite no calendário
                    </span>
                  </span>
                </button>
              </div>

              <div className="mt-4">
                {validadeMode === 'period' ? (
                  <div className="space-y-3">
                    <FormField label="Duração" htmlFor="orc-validade-periodo">
                      <Select
                        id="orc-validade-periodo"
                        className="w-full sm:max-w-xs"
                        value={periodSelectValue}
                        onChange={(event) => {
                          const value = event.target.value;
                          setValidade(value === 'custom' ? '' : `${value} dias`);
                        }}
                      >
                        <option value="7">7 dias</option>
                        <option value="15">15 dias</option>
                        <option value="30">30 dias</option>
                        <option value="custom">Personalizado</option>
                      </Select>
                    </FormField>
                    {periodSelectValue === 'custom' ? (
                      <FormField label="Prazo personalizado" htmlFor="orc-validade-custom">
                        <Input
                          id="orc-validade-custom"
                          value={validade}
                          onChange={(event) => setValidade(event.target.value)}
                          placeholder='Ex.: "15 dias úteis" ou "Até o fim do mês"'
                        />
                      </FormField>
                    ) : null}
                  </div>
                ) : (
                  <FormField label="Válido até" htmlFor="orc-validade-data">
                    <Input
                      id="orc-validade-data"
                      type="date"
                      className="w-full sm:max-w-xs"
                      value={dateInputValue}
                      onChange={(event) => {
                        const raw = event.target.value;
                        if (!raw) {
                          setValidade('');
                          return;
                        }
                        const [year, month, day] = raw.split('-');
                        setValidade(`${day}/${month}/${year}`);
                      }}
                    />
                  </FormField>
                )}
              </div>
            </section>

            {/* Observações */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-slate-900">
                Observações
              </h2>
              <Textarea
                value={observacoes}
                onChange={(event) => setObservacoes(event.target.value)}
                rows={3}
                placeholder="Condições de pagamento, prazo de execução, materiais inclusos..."
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {QUICK_NOTES.map((note) => (
                  <button
                    key={note}
                    type="button"
                    onClick={() => appendObservacao(note)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    <Plus className="h-3 w-3" />
                    {note}
                  </button>
                ))}
              </div>
            </section>

            {/* Total */}
            <section className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">Total do orçamento</p>
              <p className="mt-2 text-3xl font-black text-emerald-900 sm:text-4xl">{formatCurrency(total)}</p>
              <p className="mt-1 text-sm text-emerald-800/80">
                {items.length} {items.length === 1 ? 'item' : 'itens'} no orçamento
              </p>
            </section>
          </div>

          {/* Sidebar: sticky só no bloco de ação (resumo + checklist + CTA) */}
          <aside className="space-y-5">
            <div className="space-y-4 xl:sticky xl:top-[var(--rj-section-scroll-mt)] xl:z-10">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-900">Resumo</p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="font-medium text-slate-600">Cliente</dt>
                    <dd className="max-w-[60%] truncate font-bold text-slate-950">
                      {clienteNome || 'Não informado'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="font-medium text-slate-600">Itens</dt>
                    <dd className="font-bold text-slate-950">{items.length}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="font-medium text-slate-600">Validade</dt>
                    <dd className="max-w-[60%] truncate font-bold text-slate-950">
                      {validade || 'Não definida'}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-2xl font-black text-slate-950">{formatCurrency(total)}</p>
                  <p className="text-xs font-medium text-slate-600">Total do orçamento</p>
                </div>
                <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                  {usage.unlimited
                    ? 'Uso ilimitado de ferramentas (Premium)'
                    : `${usage.remaining ?? 0} de ${usage.limit ?? 0} usos de ferramentas restantes`}
                </div>

                <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4" aria-label="Checklist do orçamento">
                  {checklist.map((item) => (
                    <li key={item.key}>
                      <button
                        type="button"
                        onClick={() => focusChecklistItem(item.key)}
                        className={cn(
                          'flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition',
                          item.done
                            ? 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50'
                            : 'border-amber-200 bg-amber-50/60 hover:bg-amber-50'
                        )}
                      >
                        {item.done ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                        ) : (
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                        )}
                        <span className="min-w-0">
                          <span
                            className={cn(
                              'block text-sm font-bold',
                              item.done ? 'text-emerald-950' : 'text-amber-950'
                            )}
                          >
                            {item.label}
                          </span>
                          <span className="mt-0.5 block text-xs leading-4 text-slate-600">
                            {item.done ? 'Concluído — clique para revisar' : item.hint}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                {liveHints.length > 0 ? (
                  <div className="mt-3 space-y-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5">
                    {liveHints.slice(0, 2).map((hint) => (
                      <p key={hint} className="flex items-start gap-2 text-xs font-semibold text-rose-800">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                        {hint}
                      </p>
                    ))}
                  </div>
                ) : null}

                <Button
                  type="button"
                  variant="success"
                  size="lg"
                  className="mt-4 w-full bg-emerald-600 text-base shadow-md hover:bg-emerald-500"
                  icon={generating || updating ? undefined : editingId ? Pencil : Link2}
                  loading={generating || updating}
                  onClick={editingId ? handleUpdatePending : handleGenerate}
                  disabled={generating || updating || !readyToGenerate}
                >
                  {editingId ? 'Salvar alterações' : 'Gerar link'}
                </Button>
                {!readyToGenerate ? (
                  <p className="mt-2 text-xs font-medium leading-5 text-amber-800">{blockedHint}</p>
                ) : (
                  <p className="mt-2 text-xs font-medium leading-5 text-emerald-800">
                    Tudo certo — pronto para gerar o link de aprovação.
                  </p>
                )}
              </div>

              {generated ? (
                <div className="rounded-2xl border border-emerald-300 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Check className="h-4 w-4" />
                    <p className="text-sm font-bold">
                      {generated.whatsappApiSent
                        ? 'Link gerado e WhatsApp enviado'
                        : editingId
                          ? 'Link público (mesmo UUID)'
                          : 'Link pronto'}
                    </p>
                  </div>
                  {whatsAppApiReady === false ? (
                    <p className="mt-2 text-sm leading-6 text-amber-800">
                      Servidor WhatsApp (Evolution) ainda não configurado. Rode{' '}
                      <code className="rounded bg-amber-100 px-1">npm run whatsapp:up</code> ou use o
                      envio manual.
                    </p>
                  ) : generated.whatsappApiSent ? (
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Mensagem enviada pelo seu WhatsApp. A sessão já foi desconectada do servidor.
                    </p>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Envie com o seu aparelho: escaneie o QR → envie → desconectamos automaticamente.
                    </p>
                  )}
                  <p className="mt-3 break-all rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    {generated.url}
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-500"
                      onClick={() => openEphemeralSend(generated)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      {generated.whatsappApiSent
                        ? 'Reenviar (conectar → enviar → desconectar)'
                        : 'Enviar com meu WhatsApp (QR)'}
                    </Button>
                    <Button variant="outline" onClick={() => openClienteWhatsAppFallback(generated)}>
                      <MessageCircle className="h-4 w-4" />
                      Abrir WhatsApp manual (contingência)
                    </Button>
                    <Button variant="outline" onClick={() => copyText(generated.url, 'Link copiado.')}>
                      <Copy className="h-4 w-4" />
                      Copiar link
                    </Button>
                    <Button asChild variant="outline">
                      <a href={generated.url} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Pré-visualizar página do cliente
                      </a>
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-900">
                  Histórico recente
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={loadHistory}
                  disabled={historyLoading}
                >
                  {historyLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              {historyLoading && history.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">Carregando...</p>
              ) : history.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">Seus orçamentos aparecem aqui.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {history.slice(0, 3).map((item) => (
                    <li
                      key={item.id}
                      className={cn('rounded-xl border px-3 py-3', statusClass(item.status))}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-extrabold text-slate-950">{item.clienteNome}</p>
                          <p className="mt-0.5 text-sm font-bold text-slate-900">
                            {formatCurrency(item.total)}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                            statusClass(item.status)
                          )}
                        >
                          <StatusIcon status={item.status} />
                          {statusLabel(item.status)}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3">
                        <button
                          type="button"
                          className="text-xs font-bold text-emerald-800 hover:underline"
                          onClick={() => fillFromHistory(item, 'reuse')}
                        >
                          Criar cópia
                        </button>
                        {item.status === 'pending' ? (
                          <button
                            type="button"
                            className="text-xs font-bold text-amber-900 hover:underline"
                            onClick={() => fillFromHistory(item, 'edit')}
                          >
                            Editar
                          </button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() =>
                  document.getElementById('historico-completo')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="mt-3 block text-xs font-bold text-slate-700 hover:underline"
              >
                Ver todo o histórico →
              </button>
            </div>
          </aside>
        </div>

        {/* Histórico completo */}
        <section
          id="historico-completo"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-900">
                Histórico completo
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
                Reaproveite dados, edite orçamentos pendentes e reenvie pelo WhatsApp.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={loadHistory} disabled={historyLoading}>
              {historyLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Atualizar
            </Button>
          </div>

          {historyLoading && history.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Carregando...</p>
          ) : history.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Seus orçamentos ficam aqui para reutilizar e editar depois.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {history.map((item) => (
                <li key={item.id} className={cn('rounded-xl border px-4 py-3.5', statusClass(item.status))}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-extrabold text-slate-950">{item.clienteNome}</p>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                            statusClass(item.status)
                          )}
                        >
                          <StatusIcon status={item.status} />
                          {statusLabel(item.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-slate-900">{formatCurrency(item.total)}</p>
                      <p className="mt-0.5 text-xs font-medium text-slate-600">
                        Orçamento #{item.id.slice(-4).toUpperCase()}
                        {item.itens?.length
                          ? ` · ${item.itens.length} ${item.itens.length === 1 ? 'item' : 'itens'}`
                          : ''}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-600">
                        Enviado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                        {item.validade ? ` · Validade: ${item.validade}` : ''}
                        {item.updatedAt !== item.createdAt
                          ? ` · Atualizado ${new Date(item.updatedAt).toLocaleDateString('pt-BR')}`
                          : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => fillFromHistory(item, 'reuse')}>
                        <Copy className="h-3.5 w-3.5" />
                        Criar cópia
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500"
                        onClick={() =>
                          openEphemeralSend({
                            id: item.id,
                            url: item.url,
                            clienteNome: item.clienteNome,
                            clienteWhatsapp: item.clienteContato,
                            total: item.total,
                            profissionalNome: item.profissionalNome
                          })
                        }
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Enviar
                      </Button>
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label="Mais ações"
                          onClick={() => setOpenMenuId((current) => (current === item.id ? null : item.id))}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        {openMenuId === item.id ? (
                          <div className="absolute right-0 z-10 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                            {item.status === 'pending' ? (
                              <button
                                type="button"
                                className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                                onClick={() => fillFromHistory(item, 'edit')}
                              >
                                Editar orçamento
                              </button>
                            ) : null}
                            <a
                              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => setOpenMenuId(null)}
                            >
                              Abrir link
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Barra fixa mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Total</p>
            <p className="text-lg font-extrabold text-slate-900">{formatCurrency(total)}</p>
          </div>
          <Button
            className="bg-emerald-600 hover:bg-emerald-500"
            onClick={editingId ? handleUpdatePending : handleGenerate}
            disabled={generating || updating || !readyToGenerate}
          >
            {generating || updating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : editingId ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <Link2 className="h-4 w-4" />
            )}
            {editingId ? 'Salvar' : 'Gerar link'}
          </Button>
        </div>
        {!readyToGenerate ? (
          <p className="mt-1.5 text-[11px] leading-4 text-amber-700">{blockedHint}</p>
        ) : null}
      </div>

      {sendModal && ownerEmail ? (
        <WhatsAppSendModal
          open={Boolean(sendModal)}
          onClose={() => setSendModal(null)}
          ownerEmail={ownerEmail}
          toPhone={sendModal.clienteWhatsapp}
          destinationHint="WhatsApp do cliente"
          message={buildClienteOrcamentoWhatsAppText({
            clienteNome: sendModal.clienteNome,
            profissionalNome: sendModal.profissionalNome,
            total: sendModal.total,
            url: sendModal.url
          })}
          onSent={() => {
            setGenerated((current) =>
              current && current.id === sendModal.id
                ? {
                    ...current,
                    whatsappApiSent: true,
                    whatsappApiConfigured: true,
                    whatsappApiError: null
                  }
                : current
            );
          }}
        />
      ) : null}
    </AuthGate>
  );
}
