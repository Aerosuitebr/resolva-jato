'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Download,
  Droplets,
  Eraser,
  FilePlus2,
  PenLine,
  Receipt,
  Save,
  Sparkles,
  Trash2
} from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { ReciboPreview } from '@/components/recibos/recibo-preview';
import { AddressFields } from '@/components/shared/address-fields';
import { DigitalSignatureDisplay } from '@/components/shared/digital-signature-display';
import { DocumentFontPicker } from '@/components/shared/document-font-picker';
import { DocumentStickyActions } from '@/components/shared/document-sticky-actions';
import { EditorStepProgress } from '@/components/shared/editor-step-progress';
import { SignatureStyleModal } from '@/components/shared/signature-style-modal';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import { ProgressBanner } from '@/components/ui/progress-banner';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use-auth';
import { performBillableAction } from '@/lib/billing';
import { RemoveBrandingUpsell } from '@/components/billing/remove-branding-upsell';
import { DocumentExportShell } from '@/components/brand/document-export-shell';
import { ViralPdfShareModal, useViralPdfShare } from '@/components/marketing/viral-pdf-share';
import { exportElementToPdf } from '@/lib/curriculo/pdf';
import type { DocumentFontId } from '@/lib/documents/fonts';
import { createEmptyReceipt, PAYMENT_METHODS, SAMPLE_RECEIPT } from '@/lib/recibos/defaults';
import { deleteReceipt, listReceipts, saveReceipt } from '@/lib/recibos/storage';
import type { ReceiptData, ReceiptParty, ReceiptTemplateId } from '@/lib/recibos/types';
import { getSignatureTemplate } from '@/lib/signatures/templates';
import type { DigitalSignature } from '@/lib/signatures/types';
import { currencyToWords, formatCpfCnpj, formatCurrencyInput, formatPhone, parseCurrency } from '@/lib/formatters';
import { isValidCpfCnpj, isValidEmail, isValidPhone } from '@/lib/validators';
import { cn } from '@/lib/utils';

type EditorTab = 'valores' | 'recebedor' | 'pagador';
type TouchedKey =
  | 'amount'
  | 'reference'
  | 'date'
  | 'number'
  | 'receiverName'
  | 'payerName';

const templates: { id: ReceiptTemplateId; name: string; description: string; previewClass: string }[] = [
  {
    id: 'profissional',
    name: 'Profissional',
    description: 'Faixa escura, partes em blocos e assinatura central.',
    previewClass: 'from-slate-900 to-slate-700'
  },
  {
    id: 'moderno',
    name: 'Moderno',
    description: 'Barra lateral, valor em destaque e colunas.',
    previewClass: 'from-sky-600 to-cyan-500'
  },
  {
    id: 'compacto',
    name: 'Compacto',
    description: 'Filete no topo, cabeçalho em linha e layout denso.',
    previewClass: 'from-emerald-600 to-teal-500'
  }
];

const STEPS: { id: EditorTab; label: string }[] = [
  { id: 'valores', label: 'Valores' },
  { id: 'recebedor', label: 'Recebedor' },
  { id: 'pagador', label: 'Pagador' }
];

export function RecibosApp() {
  const previewRef = useRef<HTMLDivElement>(null);
  const { refresh: refreshAuth, usage } = useAuth();
  const brandDocuments = !usage.unlimited;
  const { toast } = useToast();
  const { afterPdfExport, viralShareOpen, viralShareLabel, closeViralShare } = useViralPdfShare();
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData>(createEmptyReceipt());
  const [tab, setTab] = useState<EditorTab>('valores');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<TouchedKey, boolean>>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);

  useEffect(() => {
    const stored = listReceipts();
    if (stored.length > 0) {
      setReceipts(stored);
      setActiveId(stored[0].id);
      setReceipt(stored[0]);
      return;
    }
    const initial = createEmptyReceipt();
    const saved = saveReceipt(initial);
    setReceipts([saved]);
    setActiveId(saved.id);
    setReceipt(saved);
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const timeout = window.setTimeout(() => {
      setSaveState('saving');
      saveReceipt(receipt);
      setReceipts(listReceipts());
      setSaveState('saved');
      window.setTimeout(() => setSaveState('idle'), 1200);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [receipt, activeId]);

  function markTouched(key: TouchedKey) {
    setTouched((current) => ({ ...current, [key]: true }));
  }

  function shouldShow(key: TouchedKey) {
    return showAllErrors || Boolean(touched[key]);
  }

  function updateReceipt(patch: Partial<ReceiptData>) {
    setReceipt((current) => ({ ...current, ...patch }));
  }

  function updateReceiver(patch: Partial<ReceiptParty>) {
    setReceipt((current) => {
      const receiver = { ...current.receiver, ...patch };
      const shouldSyncSignature =
        current.signature.enabled &&
        (!current.signature.text.trim() || current.signature.text === current.receiver.name);
      return {
        ...current,
        receiver,
        signature: shouldSyncSignature
          ? { ...current.signature, text: receiver.name }
          : current.signature
      };
    });
  }

  function updatePayer(patch: Partial<ReceiptParty>) {
    setReceipt((current) => ({ ...current, payer: { ...current.payer, ...patch } }));
  }

  function handleSelect(receiptId: string) {
    const selected = receipts.find((item) => item.id === receiptId);
    if (!selected) return;
    setActiveId(selected.id);
    setReceipt(selected);
    setTouched({});
    setShowAllErrors(false);
    setError('');
  }

  function handleNew() {
    const created = saveReceipt(createEmptyReceipt(receipt.templateId));
    setReceipts(listReceipts());
    setActiveId(created.id);
    setReceipt(created);
    setTab('valores');
    setTouched({});
    setShowAllErrors(false);
    setError('');
    toast('Novo recibo criado');
  }

  function handleLoadSample() {
    const sample = saveReceipt({ ...SAMPLE_RECEIPT, id: receipt.id, title: 'Recibo de exemplo' });
    setReceipt(sample);
    setReceipts(listReceipts());
    setTouched({});
    setShowAllErrors(false);
    setError('');
    toast('Exemplo carregado');
  }

  function handleClearForm() {
    const blank = createEmptyReceipt(receipt.templateId);
    const cleared = saveReceipt({
      ...blank,
      id: receipt.id,
      title: 'Novo recibo',
      number: receipt.number
    });
    setReceipt(cleared);
    setReceipts(listReceipts());
    setTouched({});
    setShowAllErrors(false);
    setError('');
    toast('Formulário limpo');
  }

  function handleDelete() {
    if (receipts.length <= 1) return;
    const removed = receipt;
    deleteReceipt(receipt.id);
    const next = listReceipts();
    setReceipts(next);
    setActiveId(next[0].id);
    setReceipt(next[0]);
    setTouched({});
    setShowAllErrors(false);
    toast('Recibo excluído', {
      undoLabel: 'Desfazer',
      onUndo: () => {
        const restored = saveReceipt(removed);
        setReceipts(listReceipts());
        setActiveId(restored.id);
        setReceipt(restored);
      }
    });
  }

  async function handleManualSave() {
    setError('');
    setSaveState('saving');
    try {
      const outcome = await performBillableAction(
        { toolId: 'recibos', artifactId: receipt.id, action: 'manual_save' },
        () => saveReceipt(receipt)
      );
      if (!outcome.allowed) {
        setError(outcome.reason || 'Faça login e confirme seu e-mail para continuar.');
        toast(outcome.reason || 'Não foi possível salvar');
        return;
      }
      setReceipts(listReceipts());
      refreshAuth();
      setSaveState('saved');
      toast('Recibo salvo');
    } catch {
      setError('Não foi possível salvar o recibo.');
      toast('Erro ao salvar');
    } finally {
      window.setTimeout(() => setSaveState('idle'), 1200);
    }
  }

  const amountError = useMemo(() => {
    if (!receipt.amountInput.trim()) return 'Valor obrigatório.';
    if (receipt.amount <= 0) return 'Valor inválido.';
    return '';
  }, [receipt.amount, receipt.amountInput]);

  const referenceError = receipt.reference.trim() ? '' : 'Referência obrigatória.';
  const dateError = receipt.date.trim() ? '' : 'Data obrigatória.';
  const receiverNameError = receipt.receiver.name.trim() ? '' : 'Nome do recebedor obrigatório.';
  const payerNameError = receipt.payer.name.trim() ? '' : 'Nome do pagador obrigatório.';

  const receiverDocInvalid = receipt.receiver.document.length > 0 && !isValidCpfCnpj(receipt.receiver.document);
  const receiverEmailInvalid = receipt.receiver.email.length > 0 && !isValidEmail(receipt.receiver.email);
  const receiverPhoneInvalid = receipt.receiver.phone.length > 0 && !isValidPhone(receipt.receiver.phone);
  const payerDocInvalid = receipt.payer.document.length > 0 && !isValidCpfCnpj(receipt.payer.document);
  const payerEmailInvalid = receipt.payer.email.length > 0 && !isValidEmail(receipt.payer.email);
  const payerPhoneInvalid = receipt.payer.phone.length > 0 && !isValidPhone(receipt.payer.phone);

  const blockingErrors = [
    amountError,
    referenceError,
    dateError,
    receiverNameError,
    payerNameError,
    receiverDocInvalid ? 'CPF/CNPJ do recebedor inválido.' : '',
    payerDocInvalid ? 'CPF/CNPJ do pagador inválido.' : '',
    receiverEmailInvalid ? 'E-mail do recebedor inválido.' : '',
    payerEmailInvalid ? 'E-mail do pagador inválido.' : '',
    receiverPhoneInvalid ? 'Telefone do recebedor inválido.' : '',
    payerPhoneInvalid ? 'Telefone do pagador inválido.' : ''
  ].filter(Boolean);

  const isComplete = blockingErrors.length === 0;

  async function handleExportPdf() {
    setError('');
    setShowAllErrors(true);
    if (!isComplete) {
      const first = blockingErrors[0];
      setError(first);
      toast(first || 'Complete os campos obrigatórios');
      if (amountError || referenceError || dateError) setTab('valores');
      else if (receiverNameError || receiverDocInvalid || receiverEmailInvalid || receiverPhoneInvalid) {
        setTab('recebedor');
      } else setTab('pagador');
      return;
    }
    if (!previewRef.current) return;
    try {
      setExporting(true);
      const safeName = (receipt.title || 'recibo').replace(/[^\w\-]+/g, '_');
      const outcome = await performBillableAction(
        { toolId: 'recibos', artifactId: receipt.id, action: 'download' },
        () => exportElementToPdf(previewRef.current!, `${safeName}.pdf`, { branded: brandDocuments })
      );
      if (!outcome.allowed) {
        setError(outcome.reason || 'Não foi possível exportar o PDF.');
        toast(outcome.reason || 'Não foi possível exportar o PDF');
        return;
      }
      refreshAuth();
      afterPdfExport('recibo');
    } catch {
      setError('Não foi possível gerar o PDF. Tente novamente.');
      toast('Erro ao gerar PDF');
    } finally {
      setExporting(false);
    }
  }

  function handleApplySignature(signature: DigitalSignature) {
    updateReceipt({ signature });
  }

  const amountWords = receipt.amount > 0 ? currencyToWords(receipt.amount) : '';
  const signatureTemplate = getSignatureTemplate(receipt.signature.styleId);

  return (
    <AuthGate
      title="Recibos exigem cadastro"
      description="Crie sua conta gratuita para emitir, salvar e baixar recibos profissionais em PDF."
    >
      <ViralPdfShareModal open={viralShareOpen} onClose={closeViralShare} docLabel={viralShareLabel} />
      <div className="space-y-5">
        <RemoveBrandingUpsell />
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700">
                <Receipt className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Gerador de Recibos</h1>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  Escolha o modelo, preencha os dados e veja o recibo pronto à direita. Salva sozinho e exporta em PDF.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:hidden">
              <Button
                type="button"
                variant="success"
                size="sm"
                icon={exporting ? undefined : Download}
                loading={exporting}
                onClick={handleExportPdf}
              >
                Baixar PDF
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select
                value={activeId ?? ''}
                onChange={(event) => handleSelect(event.target.value)}
                className="min-w-[220px]"
              >
                {receipts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} · Nº {item.number}
                  </option>
                ))}
              </Select>
              <Input
                value={receipt.title}
                onChange={(event) => updateReceipt({ title: event.target.value })}
                placeholder="Nome do recibo"
                className="min-w-[220px]"
              />
            </div>
            <p className="text-sm font-medium text-slate-600">
              {saveState === 'saving'
                ? 'Salvando...'
                : saveState === 'saved'
                  ? 'Salvo automaticamente'
                  : 'Alterações sincronizadas localmente'}
            </p>
          </div>
          {error ? (
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-rose-600" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
              {error}
            </p>
          ) : null}
        </section>

        <DocumentStickyActions>
          <Button type="button" variant="outline" size="sm" icon={FilePlus2} onClick={handleNew}>
            Novo
          </Button>
          <Button type="button" variant="outline" size="sm" icon={Sparkles} onClick={handleLoadSample}>
            Exemplo
          </Button>
          <Button type="button" variant="outline" size="sm" icon={Eraser} onClick={handleClearForm}>
            Limpar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={saveState === 'saving' ? undefined : Save}
            loading={saveState === 'saving'}
            onClick={handleManualSave}
          >
            Salvar
          </Button>
          <Button
            type="button"
            variant="success"
            size="sm"
            icon={exporting ? undefined : Download}
            loading={exporting}
            onClick={handleExportPdf}
          >
            Baixar PDF
          </Button>
          {receipts.length > 1 ? (
            <Button type="button" variant="danger" size="sm" icon={Trash2} onClick={handleDelete}>
              Excluir
            </Button>
          ) : null}
        </DocumentStickyActions>

        {exporting ? <ProgressBanner label="Gerando PDF…" /> : null}

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-600">Modelos</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {templates.map((template) => {
              const active = receipt.templateId === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => updateReceipt({ templateId: template.id })}
                  className={cn(
                    'rounded-2xl border p-3 text-left transition-all sm:p-4',
                    active
                      ? 'border-sky-600 bg-sky-50 shadow-sm ring-2 ring-sky-100'
                      : 'border-slate-200 bg-slate-50 hover:border-sky-300'
                  )}
                >
                  <div
                    className={cn(
                      'mb-3 overflow-hidden rounded-xl border border-white/40 bg-gradient-to-br p-2.5 shadow-inner',
                      template.previewClass
                    )}
                  >
                    {template.id === 'profissional' ? (
                      <div className="space-y-1.5 rounded-lg bg-white p-2">
                        <div className="h-2 w-2/3 rounded bg-slate-800" />
                        <div className="h-1.5 w-full rounded bg-slate-200" />
                        <div className="grid grid-cols-2 gap-1 pt-1">
                          <div className="h-6 rounded bg-slate-100" />
                          <div className="h-6 rounded bg-slate-100" />
                        </div>
                      </div>
                    ) : null}
                    {template.id === 'moderno' ? (
                      <div className="flex gap-1.5 rounded-lg bg-white p-2">
                        <div className="w-2 shrink-0 rounded bg-sky-500" />
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="h-2 w-1/2 rounded bg-sky-700" />
                          <div className="h-5 w-full rounded bg-sky-50" />
                          <div className="h-1.5 w-3/4 rounded bg-slate-200" />
                        </div>
                      </div>
                    ) : null}
                    {template.id === 'compacto' ? (
                      <div className="space-y-1 rounded-lg bg-white p-2">
                        <div className="h-1 w-full rounded bg-emerald-600" />
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="h-2 w-1/3 rounded bg-slate-800" />
                          <div className="h-2 w-1/4 rounded bg-emerald-200" />
                        </div>
                        <div className="h-1.5 w-full rounded bg-slate-200" />
                        <div className="h-1.5 w-5/6 rounded bg-slate-100" />
                      </div>
                    ) : null}
                  </div>
                  <p className="font-semibold text-slate-900">{template.name}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{template.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <DocumentFontPicker
          kind="recibo"
          value={receipt.fontId}
          onChange={(fontId: DocumentFontId) => updateReceipt({ fontId })}
        />

        <section className="grid gap-5 xl:grid-cols-[460px_1fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <EditorStepProgress
              steps={STEPS}
              currentId={tab}
              onSelect={(id) => setTab(id as EditorTab)}
            />

            <div className="mt-6 space-y-5">
              {tab === 'valores' ? (
                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      label="Valor"
                      required
                      error={shouldShow('amount') ? amountError || undefined : undefined}
                      success={!amountError && amountWords ? amountWords : undefined}
                      hint={!amountError && !amountWords ? 'Digite apenas números' : undefined}
                    >
                      <MaskedInput
                        format={formatCurrencyInput}
                        value={receipt.amountInput}
                        onValueChange={(masked) => {
                          markTouched('amount');
                          updateReceipt({ amountInput: masked, amount: parseCurrency(masked) });
                        }}
                        onBlur={() => markTouched('amount')}
                        placeholder="R$ 0,00"
                        invalid={shouldShow('amount') && Boolean(amountError)}
                        valid={!amountError && receipt.amount > 0}
                      />
                    </FormField>
                    <FormField
                      label="Nº do recibo"
                      error={
                        shouldShow('number') && !receipt.number.trim()
                          ? 'Número do recibo recomendado.'
                          : undefined
                      }
                      hint={!receipt.number.trim() ? 'Ex.: 2026-001' : undefined}
                    >
                      <Input
                        value={receipt.number}
                        onChange={(event) => {
                          markTouched('number');
                          updateReceipt({ number: event.target.value });
                        }}
                        onBlur={() => markTouched('number')}
                        placeholder="2026-001"
                      />
                    </FormField>
                  </div>

                  <FormField
                    label="Referente a"
                    required
                    error={shouldShow('reference') ? referenceError || undefined : undefined}
                  >
                    <Input
                      value={receipt.reference}
                      onChange={(event) => {
                        markTouched('reference');
                        updateReceipt({ reference: event.target.value });
                      }}
                      onBlur={() => markTouched('reference')}
                      placeholder="Ex: Serviços de consultoria em maio"
                      className={cn(
                        shouldShow('reference') &&
                          referenceError &&
                          'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                      )}
                    />
                  </FormField>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField label="Forma de pagamento">
                      <Select
                        value={receipt.paymentMethod}
                        onChange={(event) => updateReceipt({ paymentMethod: event.target.value })}
                        className="w-full"
                      >
                        {PAYMENT_METHODS.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                    <FormField
                      label="Data"
                      required
                      error={shouldShow('date') ? dateError || undefined : undefined}
                    >
                      <Input
                        type="date"
                        value={receipt.date}
                        onChange={(event) => {
                          markTouched('date');
                          updateReceipt({ date: event.target.value });
                        }}
                        onBlur={() => markTouched('date')}
                        className={cn(
                          shouldShow('date') &&
                            dateError &&
                            'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                        )}
                      />
                    </FormField>
                  </div>

                  <FormField label="Cidade de emissão">
                    <Input
                      value={receipt.city}
                      onChange={(event) => updateReceipt({ city: event.target.value })}
                      placeholder="São Paulo"
                    />
                  </FormField>

                  <FormField label="Observações">
                    <Textarea
                      value={receipt.notes}
                      onChange={(event) => updateReceipt({ notes: event.target.value })}
                      placeholder="Informações adicionais (opcional)"
                    />
                  </FormField>

                  <Button type="button" variant="outline" className="w-full" onClick={() => setTab('recebedor')}>
                    Ir para Recebedor
                  </Button>
                </div>
              ) : null}

              {tab === 'recebedor' ? (
                <div className="space-y-5">
                  <FormField
                    label="Nome / Razão social"
                    required
                    error={shouldShow('receiverName') ? receiverNameError || undefined : undefined}
                  >
                    <Input
                      value={receipt.receiver.name}
                      onChange={(event) => {
                        markTouched('receiverName');
                        updateReceiver({ name: event.target.value });
                      }}
                      onBlur={() => markTouched('receiverName')}
                      placeholder="Quem recebeu o pagamento"
                      className={cn(
                        shouldShow('receiverName') &&
                          receiverNameError &&
                          'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                      )}
                    />
                  </FormField>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      label="CPF / CNPJ"
                      error={receiverDocInvalid ? 'Documento inválido.' : undefined}
                      success={
                        !receiverDocInvalid && receipt.receiver.document ? 'Documento válido.' : undefined
                      }
                    >
                      <MaskedInput
                        format={formatCpfCnpj}
                        value={receipt.receiver.document}
                        onValueChange={(masked) => updateReceiver({ document: masked })}
                        placeholder="000.000.000-00"
                        invalid={receiverDocInvalid}
                        valid={!receiverDocInvalid && receipt.receiver.document.length > 0}
                      />
                    </FormField>
                    <FormField
                      label="Telefone"
                      error={receiverPhoneInvalid ? 'Telefone inválido.' : undefined}
                    >
                      <MaskedInput
                        format={formatPhone}
                        value={receipt.receiver.phone}
                        onValueChange={(masked) => updateReceiver({ phone: masked })}
                        placeholder="(11) 99999-9999"
                        invalid={receiverPhoneInvalid}
                        valid={!receiverPhoneInvalid && receipt.receiver.phone.length > 0}
                      />
                    </FormField>
                  </div>
                  <FormField
                    label="E-mail"
                    error={receiverEmailInvalid ? 'E-mail inválido.' : undefined}
                    success={
                      !receiverEmailInvalid && receipt.receiver.email ? 'E-mail válido.' : undefined
                    }
                  >
                    <Input
                      type="email"
                      value={receipt.receiver.email}
                      onChange={(event) => updateReceiver({ email: event.target.value })}
                      placeholder="voce@email.com"
                      className={cn(
                        receiverEmailInvalid && 'border-rose-400 focus:border-rose-500 focus:ring-rose-100',
                        !receiverEmailInvalid &&
                          receipt.receiver.email &&
                          'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100'
                      )}
                    />
                  </FormField>

                  <div className="border-t border-slate-100 pt-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                      Endereço
                    </p>
                    <AddressFields
                      value={receipt.address}
                      onChange={(address) => updateReceipt({ address })}
                      idPrefix="recibo"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Assinatura digital</p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          Personalize o estilo da assinatura no rodapé do recibo e no PDF.
                        </p>
                      </div>
                      <label className="flex shrink-0 items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={receipt.signature.enabled}
                          onChange={(event) =>
                            updateReceipt({
                              signature: {
                                ...receipt.signature,
                                enabled: event.target.checked,
                                text: receipt.signature.text.trim() || receipt.receiver.name
                              }
                            })
                          }
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                        />
                        Ativar
                      </label>
                    </div>

                    {receipt.signature.enabled ? (
                      <div className="mt-4 space-y-3">
                        <div className="rounded-xl border border-white bg-white px-4 py-5 shadow-sm">
                          <DigitalSignatureDisplay
                            signature={{
                              ...receipt.signature,
                              text: receipt.signature.text.trim() || receipt.receiver.name
                            }}
                            subtitle={
                              receipt.receiver.name ? `Estilo ${signatureTemplate.name}` : undefined
                            }
                            size="md"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            icon={PenLine}
                            onClick={() => setSignatureModalOpen(true)}
                          >
                            Personalizar assinatura
                          </Button>
                          <span className="text-xs font-medium text-slate-500">
                            Template: {signatureTemplate.name}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-slate-500">
                        Assinatura desativada — o recibo usará só o nome do recebedor.
                      </p>
                    )}
                  </div>

                  <Button type="button" variant="outline" className="w-full" onClick={() => setTab('pagador')}>
                    Ir para Pagador
                  </Button>
                </div>
              ) : null}

              {tab === 'pagador' ? (
                <div className="space-y-5">
                  <FormField
                    label="Nome / Razão social"
                    required
                    error={shouldShow('payerName') ? payerNameError || undefined : undefined}
                  >
                    <Input
                      value={receipt.payer.name}
                      onChange={(event) => {
                        markTouched('payerName');
                        updatePayer({ name: event.target.value });
                      }}
                      onBlur={() => markTouched('payerName')}
                      placeholder="Quem efetuou o pagamento"
                      className={cn(
                        shouldShow('payerName') &&
                          payerNameError &&
                          'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                      )}
                    />
                  </FormField>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      label="CPF / CNPJ"
                      error={payerDocInvalid ? 'Documento inválido.' : undefined}
                      success={!payerDocInvalid && receipt.payer.document ? 'Documento válido.' : undefined}
                    >
                      <MaskedInput
                        format={formatCpfCnpj}
                        value={receipt.payer.document}
                        onValueChange={(masked) => updatePayer({ document: masked })}
                        placeholder="00.000.000/0000-00"
                        invalid={payerDocInvalid}
                        valid={!payerDocInvalid && receipt.payer.document.length > 0}
                      />
                    </FormField>
                    <FormField label="Telefone" error={payerPhoneInvalid ? 'Telefone inválido.' : undefined}>
                      <MaskedInput
                        format={formatPhone}
                        value={receipt.payer.phone}
                        onValueChange={(masked) => updatePayer({ phone: masked })}
                        placeholder="(11) 3333-4444"
                        invalid={payerPhoneInvalid}
                        valid={!payerPhoneInvalid && receipt.payer.phone.length > 0}
                      />
                    </FormField>
                  </div>
                  <FormField
                    label="E-mail"
                    error={payerEmailInvalid ? 'E-mail inválido.' : undefined}
                    success={!payerEmailInvalid && receipt.payer.email ? 'E-mail válido.' : undefined}
                  >
                    <Input
                      type="email"
                      value={receipt.payer.email}
                      onChange={(event) => updatePayer({ email: event.target.value })}
                      placeholder="pagador@email.com"
                      className={cn(
                        payerEmailInvalid && 'border-rose-400 focus:border-rose-500 focus:ring-rose-100',
                        !payerEmailInvalid &&
                          receipt.payer.email &&
                          'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100'
                      )}
                    />
                  </FormField>
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
              <Button
                type="button"
                variant="success"
                icon={saveState === 'saving' ? undefined : Save}
                loading={saveState === 'saving'}
                onClick={handleManualSave}
              >
                Salvar agora
              </Button>
              <Button
                type="button"
                variant="success"
                icon={exporting ? undefined : Download}
                loading={exporting}
                onClick={handleExportPdf}
                className="bg-emerald-600"
              >
                Baixar PDF
              </Button>
              {receipts.length > 1 ? (
                <Button type="button" variant="danger" icon={Trash2} onClick={handleDelete}>
                  Excluir
                </Button>
              ) : null}
            </div>
          </div>

          <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <div
              className={cn(
                'flex flex-col gap-3 rounded-2xl border-2 border-dashed p-4 transition-colors sm:flex-row sm:items-center sm:justify-between',
                receipt.inkSaver ? 'border-slate-800 bg-slate-50' : 'border-amber-300 bg-amber-50/60'
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
                    receipt.inkSaver ? 'bg-slate-900 text-white' : 'bg-amber-100 text-amber-700'
                  )}
                >
                  <Droplets className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">Economizar tinta na impressão</p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-600">
                    Afeta a pré-visualização e o PDF: remove preenchimentos coloridos e mantém contornos.
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={receipt.inkSaver}
                onClick={() => updateReceipt({ inkSaver: !receipt.inkSaver })}
                className={cn(
                  'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                  receipt.inkSaver
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-amber-400 bg-white text-amber-800 hover:bg-amber-50'
                )}
              >
                <span
                  className={cn(
                    'relative h-5 w-9 rounded-full transition-colors',
                    receipt.inkSaver ? 'bg-white/30' : 'bg-amber-200'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
                      receipt.inkSaver ? 'left-[1.125rem]' : 'left-0.5'
                    )}
                  />
                </span>
                {receipt.inkSaver ? 'Ativado' : 'Ativar'}
              </button>
            </div>

            {!isComplete ? (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden />
                <div>
                  <p className="text-sm font-bold text-rose-900">Campos pendentes</p>
                  <p className="mt-0.5 text-xs font-medium leading-5 text-rose-800">
                    {blockingErrors.slice(0, 2).join(' · ')}
                    {blockingErrors.length > 2 ? ` · +${blockingErrors.length - 2}` : ''}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
                Recibo completo — pronto para baixar o PDF.
              </div>
            )}

            <div className="rounded-[28px] border border-slate-200 bg-slate-100 p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-600">
                  Pré-visualização
                </h2>
                <span className="text-xs font-medium text-slate-500">Formato A4</span>
              </div>
              <div className="overflow-auto rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                <div ref={previewRef} className="mx-auto w-full max-w-[210mm]">
                  <DocumentExportShell branded={brandDocuments}>
                    <ReciboPreview data={receipt} />
                  </DocumentExportShell>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <SignatureStyleModal
        open={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        value={receipt.signature}
        defaultName={receipt.receiver.name}
        onApply={handleApplySignature}
      />
    </AuthGate>
  );
}
