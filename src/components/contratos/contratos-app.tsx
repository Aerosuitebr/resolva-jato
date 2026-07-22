'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Download,
  Eraser,
  FilePlus2,
  RefreshCw,
  Save,
  Scale,
  Sparkles,
  Trash2
} from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { ToolsWatermark } from '@/components/brand/tools-watermark';
import { ContratoPreview } from '@/components/contratos/contrato-preview';
import { DocumentFontPicker } from '@/components/shared/document-font-picker';
import { DocumentHistoryPanel } from '@/components/shared/document-history-panel';
import { DocumentPartyFields } from '@/components/shared/document-party-fields';
import { DocumentStickyActions } from '@/components/shared/document-sticky-actions';
import { EditorStepFooter } from '@/components/shared/editor-step-footer';
import { EditorStepProgress } from '@/components/shared/editor-step-progress';
import { ToolsBackButton } from '@/components/shared/tools-back-button';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { ProgressBanner } from '@/components/ui/progress-banner';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use-auth';
import { performBillableAction } from '@/lib/billing';
import { buildDefaultClauses } from '@/lib/contratos/clauses';
import { createEmptyContrato, SAMPLE_CONTRATO } from '@/lib/contratos/defaults';
import { deleteContrato, listContratos, saveContrato } from '@/lib/contratos/storage';
import { CONTRACT_TEMPLATES, getContractTemplate } from '@/lib/contratos/templates';
import type { ContractClause, ContractData, ContractParty, ContractTemplateId } from '@/lib/contratos/types';
import { ViralPdfShareModal, useViralPdfShare } from '@/components/marketing/viral-pdf-share';
import { exportElementToPdf } from '@/lib/curriculo/pdf';
import type { DocumentFontId } from '@/lib/documents/fonts';
import { cn } from '@/lib/utils';

type EditorTab = 'partes' | 'termos' | 'clausulas' | 'assinatura';

const TABS: { id: EditorTab; label: string }[] = [
  { id: 'partes', label: 'Partes' },
  { id: 'termos', label: 'Termos' },
  { id: 'clausulas', label: 'Cláusulas' },
  { id: 'assinatura', label: 'Assinatura' }
];

const TAB_ORDER = TABS.map((item) => item.id);

export function ContratosApp() {
  const previewRef = useRef<HTMLDivElement>(null);
  const { refresh: refreshAuth } = useAuth();
  const { toast } = useToast();
  const { afterPdfExport, viralShareOpen, viralShareLabel, closeViralShare } = useViralPdfShare();
  const [items, setItems] = useState<ContractData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [contrato, setContrato] = useState<ContractData>(createEmptyContrato());
  const [tab, setTab] = useState<EditorTab>('partes');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [clauseHint, setClauseHint] = useState('');

  const meta = getContractTemplate(contrato.templateId);
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabIndex = TAB_ORDER.indexOf(tab);

  function goToTab(next: EditorTab) {
    setTab(next);
    window.requestAnimationFrame(() => {
      tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  function goNextTab() {
    if (tabIndex < TAB_ORDER.length - 1) goToTab(TAB_ORDER[tabIndex + 1]);
  }

  function goPrevTab() {
    if (tabIndex > 0) goToTab(TAB_ORDER[tabIndex - 1]);
  }

  const showDurationFields = contrato.templateId !== 'compra-venda';

  useEffect(() => {
    const stored = listContratos();
    if (stored.length > 0) {
      setItems(stored);
      setActiveId(stored[0].id);
      setContrato(stored[0]);
      return;
    }
    const saved = saveContrato(createEmptyContrato());
    setItems([saved]);
    setActiveId(saved.id);
    setContrato(saved);
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const timeout = window.setTimeout(() => {
      setSaveState('saving');
      saveContrato(contrato);
      setItems(listContratos());
      setSaveState('saved');
      window.setTimeout(() => setSaveState('idle'), 1200);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [contrato, activeId]);

  function updateContrato(patch: Partial<ContractData>) {
    setContrato((current) => ({ ...current, ...patch }));
  }

  function updateParty(side: 'partyA' | 'partyB', patch: Partial<ContractParty>) {
    setContrato((current) => ({
      ...current,
      [side]: { ...current[side], ...patch }
    }));
  }

  function updateClause(clauseId: string, patch: Partial<ContractClause>) {
    setContrato((current) => ({
      ...current,
      clauses: current.clauses.map((item) => (item.id === clauseId ? { ...item, ...patch } : item))
    }));
  }

  function handleSelect(id: string) {
    const selected = items.find((item) => item.id === id);
    if (!selected) return;
    setActiveId(selected.id);
    setContrato(selected);
  }

  function handleDuplicate(id: string) {
    const source = items.find((item) => item.id === id);
    if (!source) return;
    const copyId = createEmptyContrato(source.templateId).id;
    const copy = saveContrato({
      ...source,
      id: copyId,
      title: source.title?.trim() ? `Cópia · ${source.title}` : 'Cópia do contrato',
      updatedAt: new Date().toISOString()
    });
    setItems(listContratos());
    setActiveId(copy.id);
    setContrato(copy);
    toast('Cópia criada.');
  }

  function handleDeleteById(id: string) {
    if (items.length <= 1) return;
    const snapshot = items.find((item) => item.id === id);
    deleteContrato(id);
    const next = listContratos();
    setItems(next);
    if (activeId === id) {
      setActiveId(next[0].id);
      setContrato(next[0]);
    }
    toast('Contrato excluído.', {
      undoLabel: 'Desfazer',
      onUndo: () => {
        if (!snapshot) return;
        const restored = saveContrato(snapshot);
        setItems(listContratos());
        setActiveId(restored.id);
        setContrato(restored);
        toast('Exclusão desfeita.');
      }
    });
  }

  function handleNew() {
    const created = saveContrato(createEmptyContrato(contrato.templateId));
    setItems(listContratos());
    setActiveId(created.id);
    setContrato(created);
    setTab('partes');
    setClauseHint('');
    toast('Novo contrato criado.');
  }

  function handleLoadSample() {
    const sample = saveContrato({
      ...SAMPLE_CONTRATO,
      id: contrato.id,
      templateId: contrato.templateId === 'prestacao-servicos' ? 'aluguel-residencial' : 'prestacao-servicos'
    });
    const withClauses = { ...sample, clauses: buildDefaultClauses(sample) };
    const saved = saveContrato(withClauses);
    setContrato(saved);
    setItems(listContratos());
    toast('Exemplo carregado — revise os dados.');
  }

  function handleClearForm() {
    const blank = createEmptyContrato(contrato.templateId);
    const cleared = saveContrato({
      ...blank,
      id: contrato.id,
      title: 'Novo contrato'
    });
    setContrato(cleared);
    setItems(listContratos());
    setError('');
    setClauseHint('');
    toast('Formulário limpo.');
  }

  function handleTemplateChange(templateId: ContractTemplateId) {
    setContrato((current) => {
      const next = { ...current, templateId };
      const templateName = getContractTemplate(templateId).name;
      const shouldRename =
        !current.title.trim() ||
        current.title.startsWith('Novo contrato') ||
        /exemplo/i.test(current.title);
      return {
        ...next,
        title: shouldRename ? templateName : current.title,
        clauses: buildDefaultClauses(next)
      };
    });
    const name = getContractTemplate(templateId).name;
    if (templateId === 'prestacao-servicos') {
      setClauseHint(
        'Cláusulas padrão de prestação de serviços já foram aplicadas (objeto, prazo, preço, obrigações, rescisão e foro). Você pode editar na etapa Cláusulas.'
      );
      toast('Modelo de prestação de serviços — cláusulas pré-preenchidas.');
    } else {
      setClauseHint(`Cláusulas sugeridas para “${name}” aplicadas. Ajuste o texto se precisar.`);
      toast(`Modelo “${name}” selecionado.`);
    }
  }

  function handleRegenerateClauses() {
    setContrato((current) => ({ ...current, clauses: buildDefaultClauses(current) }));
    toast('Cláusulas atualizadas com os termos atuais.');
  }

  function handleDelete() {
    handleDeleteById(contrato.id);
  }

  const historyItems = items.map((item) => ({
    id: item.id,
    title: item.title,
    typeLabel: getContractTemplate(item.templateId).name,
    partyLabel: item.partyA.name || item.partyB.name,
    updatedAt: item.updatedAt
  }));

  async function handleManualSave() {
    setError('');
    setSaveState('saving');
    try {
      const outcome = await performBillableAction(
        { toolId: 'contratos', artifactId: contrato.id, action: 'manual_save' },
        () => saveContrato(contrato)
      );
      if (!outcome.allowed) {
        setError(outcome.reason || 'Seu saldo não permite salvar agora.');
        return;
      }
      setItems(listContratos());
      refreshAuth();
      setSaveState('saved');
      toast('Contrato salvo com sucesso!');
    } catch {
      setError('Não foi possível salvar o contrato.');
    } finally {
      window.setTimeout(() => setSaveState('idle'), 1200);
    }
  }

  async function handleExportPdf() {
    setError('');
    if (!previewRef.current) return;
    try {
      setExporting(true);
      const safeName = (contrato.title || meta.name || 'contrato').replace(/[^\w\-]+/g, '_');
      const outcome = await performBillableAction(
        { toolId: 'contratos', artifactId: contrato.id, action: 'download' },
        () => exportElementToPdf(previewRef.current!, `Contrato_${safeName}.pdf`)
      );
      if (!outcome.allowed) {
        setError(outcome.reason || 'Não foi possível exportar o PDF.');
        return;
      }
      refreshAuth();
      afterPdfExport('contrato');
    } catch {
      setError('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <AuthGate
      title="Contratos exigem cadastro"
      description="Crie sua conta gratuita para montar contratos sob medida e baixar em PDF."
    >
      <ViralPdfShareModal open={viralShareOpen} onClose={closeViralShare} docLabel={viralShareLabel} />
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 px-5 py-6 text-white sm:px-6">
            <ToolsWatermark />
            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-300/15 text-amber-200">
                  <Scale className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-300">
                    Ferramenta premium
                  </p>
                  <h1 className="rj-display mt-1 text-2xl font-extrabold tracking-tight">
                    Contratos sob medida
                  </h1>
                  <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-300">
                    Monte contratos de aluguel, serviços, trabalho, compra e venda e comodato — com
                    prévia em tempo real e PDF para assinar.
                  </p>
                </div>
              </div>
              <ToolsBackButton
                size="default"
                className="shrink-0 border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/20 hover:text-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <FormField label="Nome na lista" htmlFor="contrato-title" className="min-w-0 flex-1" hint="Só para organizar no seu histórico.">
              <Input
                id="contrato-title"
                value={contrato.title}
                onChange={(event) => updateContrato({ title: event.target.value })}
                placeholder="Ex.: Contrato aluguel Centro"
                className="max-w-md"
              />
            </FormField>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={contrato.inkSaver}
                  onChange={(event) => updateContrato({ inkSaver: event.target.checked })}
                  className="rounded border-slate-300"
                />
                Economia de tinta
              </label>
              <p className="text-sm font-semibold text-slate-700">
                {saveState === 'saving'
                  ? 'Salvando…'
                  : saveState === 'saved'
                    ? 'Salvo automaticamente'
                    : 'Alterações locais'}
              </p>
            </div>
          </div>
          {error ? (
            <p className="px-5 pb-4 text-sm font-semibold text-rose-600 sm:px-6" role="alert">
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
            size="sm"
            icon={saveState === 'saving' ? undefined : Save}
            loading={saveState === 'saving'}
            onClick={handleManualSave}
          >
            Salvar
          </Button>
          <Button
            type="button"
            size="sm"
            icon={exporting ? undefined : Download}
            loading={exporting}
            onClick={handleExportPdf}
            className="bg-amber-500 hover:bg-amber-600"
          >
            Baixar PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Trash2}
            onClick={handleDelete}
            disabled={items.length <= 1}
            className="border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50"
          >
            Excluir
          </Button>
        </DocumentStickyActions>

        <DocumentHistoryPanel
          items={historyItems}
          activeId={activeId}
          onEdit={handleSelect}
          onDuplicate={handleDuplicate}
          onDelete={handleDeleteById}
        />

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="rj-display text-lg font-bold text-slate-950">Tipo de contrato</h2>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Ao escolher o modelo, cláusulas sugeridas são aplicadas automaticamente.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {CONTRACT_TEMPLATES.map((template) => {
              const active = contrato.templateId === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateChange(template.id)}
                  className={cn(
                    'rj-press overflow-hidden rounded-2xl border text-left transition',
                    active ? 'border-sky-500 ring-2 ring-sky-200' : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div className={cn('h-2 bg-gradient-to-r', template.previewClass)} aria-hidden />
                  <div className="p-4">
                    <p className="text-sm font-bold text-slate-950">{template.name}</p>
                    <p className="mt-1 text-xs font-semibold text-sky-800">{template.audience}</p>
                    <p className="mt-2 min-h-[2.5rem] text-xs font-medium leading-5 text-slate-600">
                      {template.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          {clauseHint ? (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" aria-hidden />
              <p className="text-sm font-medium leading-5 text-sky-950">{clauseHint}</p>
            </div>
          ) : null}
        </section>

        <DocumentFontPicker
          kind="contrato"
          value={contrato.fontId}
          onChange={(fontId: DocumentFontId) => updateContrato({ fontId })}
        />

        {exporting ? <ProgressBanner label="Gerando PDF…" /> : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(320px,42%)_1fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div ref={tabsRef}>
              <EditorStepProgress
                steps={TABS}
                currentId={tab}
                onSelect={(id) => goToTab(id as EditorTab)}
              />
            </div>

            <div className="mt-6 space-y-5">
              {tab === 'partes' ? (
                <>
                  <DocumentPartyFields
                    title={meta.labels.partyA}
                    party={contrato.partyA}
                    idPrefix="party-a"
                    onChange={(patch) => updateParty('partyA', patch)}
                  />
                  <div className="border-t border-slate-100 pt-5">
                    <DocumentPartyFields
                      title={meta.labels.partyB}
                      party={contrato.partyB}
                      idPrefix="party-b"
                      onChange={(patch) => updateParty('partyB', patch)}
                    />
                  </div>
                </>
              ) : null}

              {tab === 'termos' ? (
                <>
                  <FormField label={meta.labels.objectLabel}>
                    <Textarea
                      value={contrato.objectDescription}
                      onChange={(event) => updateContrato({ objectDescription: event.target.value })}
                      rows={4}
                      placeholder="Descreva com clareza o objeto do contrato"
                    />
                  </FormField>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField label={meta.labels.valueLabel}>
                      <Input
                        value={contrato.valueLabel}
                        onChange={(event) => updateContrato({ valueLabel: event.target.value })}
                        placeholder="R$ 1.500,00"
                        inputMode="decimal"
                      />
                    </FormField>
                    {showDurationFields ? (
                      <FormField label="Prazo / duração">
                        <Input
                          value={contrato.duration}
                          onChange={(event) => updateContrato({ duration: event.target.value })}
                          placeholder="12 meses"
                        />
                      </FormField>
                    ) : null}
                  </div>
                  <FormField label="Forma de pagamento">
                    <Textarea
                      value={contrato.paymentTerms}
                      onChange={(event) => updateContrato({ paymentTerms: event.target.value })}
                      rows={3}
                      placeholder="Ex.: até o dia 10 de cada mês, via PIX"
                    />
                  </FormField>
                  <div className={cn('grid gap-5', showDurationFields ? 'sm:grid-cols-2' : '')}>
                    <FormField label={contrato.templateId === 'compra-venda' ? 'Data de entrega' : 'Início'}>
                      <Input
                        value={contrato.startDate}
                        onChange={(event) => updateContrato({ startDate: event.target.value })}
                        placeholder="01/08/2026"
                      />
                    </FormField>
                    {showDurationFields ? (
                      <FormField label="Término">
                        <Input
                          value={contrato.endDate}
                          onChange={(event) => updateContrato({ endDate: event.target.value })}
                          placeholder="31/07/2027"
                        />
                      </FormField>
                    ) : null}
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField label="Cidade">
                      <Input
                        value={contrato.city}
                        onChange={(event) => updateContrato({ city: event.target.value })}
                        placeholder="Goiânia"
                      />
                    </FormField>
                    <FormField label="UF">
                      <Input
                        value={contrato.state}
                        onChange={(event) => updateContrato({ state: event.target.value })}
                        placeholder="GO"
                        maxLength={2}
                      />
                    </FormField>
                  </div>
                  <Button type="button" variant="outline" icon={RefreshCw} onClick={handleRegenerateClauses} className="w-full">
                    Atualizar cláusulas com estes termos
                  </Button>
                </>
              ) : null}

              {tab === 'clausulas' ? (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium text-slate-700">
                      Edite o texto livremente. Cada cláusula aparece numerada no PDF.
                    </p>
                    <Button type="button" variant="outline" size="sm" icon={RefreshCw} onClick={handleRegenerateClauses}>
                      Regenerar
                    </Button>
                  </div>
                  <div className="space-y-5">
                    {contrato.clauses.map((clause, index) => (
                      <div key={clause.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                          Cláusula {index + 1}ª
                        </p>
                        <FormField label="Título">
                          <Input
                            value={clause.title}
                            onChange={(event) => updateClause(clause.id, { title: event.target.value })}
                          />
                        </FormField>
                        <FormField label="Texto" className="mt-3">
                          <Textarea
                            value={clause.body}
                            onChange={(event) => updateClause(clause.id, { body: event.target.value })}
                            rows={4}
                          />
                        </FormField>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}

              {tab === 'assinatura' ? (
                <>
                  <FormField label="Data de assinatura">
                    <Input
                      value={contrato.signedAt}
                      onChange={(event) => updateContrato({ signedAt: event.target.value })}
                      placeholder="01/08/2026"
                    />
                  </FormField>
                  <FormField label="Testemunha 1 (opcional)">
                    <Input
                      value={contrato.witness1}
                      onChange={(event) => updateContrato({ witness1: event.target.value })}
                      placeholder="Nome completo"
                    />
                  </FormField>
                  <FormField label="Testemunha 2 (opcional)">
                    <Input
                      value={contrato.witness2}
                      onChange={(event) => updateContrato({ witness2: event.target.value })}
                      placeholder="Nome completo"
                    />
                  </FormField>
                  <FormField label="Observações finais">
                    <Textarea
                      value={contrato.extraNotes}
                      onChange={(event) => updateContrato({ extraNotes: event.target.value })}
                      rows={3}
                      placeholder="Notas adicionais que devem constar no documento"
                    />
                  </FormField>
                </>
              ) : null}
            </div>

            <EditorStepFooter
              hasPrev={tabIndex > 0}
              hasNext={tabIndex < TAB_ORDER.length - 1}
              onPrev={goPrevTab}
              onNext={goNextTab}
              nextLabel={
                tab === 'partes'
                  ? 'Ir para Termos'
                  : tab === 'termos'
                    ? 'Ir para Cláusulas'
                    : 'Ir para Assinatura'
              }
            />
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-slate-100/80 p-4 shadow-sm sm:p-6 xl:sticky xl:top-[var(--rj-doc-preview-top)] xl:self-start">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
              Pré-visualização
            </p>
            <div className="overflow-auto rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-200/80 to-slate-300/50 p-3 sm:p-5">
              <div
                ref={previewRef}
                className="mx-auto w-full max-w-[210mm] overflow-hidden rounded-[2px] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.18),0_2px_8px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5"
              >
                <ContratoPreview data={contrato} />
              </div>
            </div>
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
              <div>
                <p className="text-sm font-bold text-amber-950">Modelo orientativo</p>
                <p className="mt-0.5 text-xs font-medium leading-5 text-amber-900">
                  Não substitui assessoria jurídica. Revise com atenção e, se necessário, consulte um
                  profissional de direito.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AuthGate>
  );
}

