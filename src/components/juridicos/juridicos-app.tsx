'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Download,
  Eraser,
  FilePlus2,
  Gavel,
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
  Trash2
} from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { RemoveBrandingUpsell } from '@/components/billing/remove-branding-upsell';
import { DocumentExportShell } from '@/components/brand/document-export-shell';
import { ToolsWatermark } from '@/components/brand/tools-watermark';
import { JuridicoPreview } from '@/components/juridicos/juridico-preview';
import { DocumentFontPicker } from '@/components/shared/document-font-picker';
import { DocumentHistoryPanel } from '@/components/shared/document-history-panel';
import { DocumentPartyFields } from '@/components/shared/document-party-fields';
import { DocumentStickyActions } from '@/components/shared/document-sticky-actions';
import { EditorStepFooter } from '@/components/shared/editor-step-footer';
import { ToolsBackButton } from '@/components/shared/tools-back-button';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { performBillableAction } from '@/lib/billing';
import { exportElementToPdf } from '@/lib/curriculo/pdf';
import type { DocumentFontId } from '@/lib/documents/fonts';
import { buildDefaultClauses } from '@/lib/juridicos/clauses';
import { createEmptyLegalDocument, SAMPLE_LEGAL_DOCUMENT } from '@/lib/juridicos/defaults';
import { deleteLegalDocument, listLegalDocuments, saveLegalDocument } from '@/lib/juridicos/storage';
import { getLegalTemplate, LEGAL_TEMPLATES } from '@/lib/juridicos/templates';
import type { LegalClause, LegalDocumentData, LegalParty, LegalTemplateId } from '@/lib/juridicos/types';
import { cn } from '@/lib/utils';

type EditorTab = 'partes' | 'termos' | 'clausulas' | 'assinatura';

const TABS: { id: EditorTab; label: string }[] = [
  { id: 'partes', label: 'Partes' },
  { id: 'termos', label: 'Conteúdo' },
  { id: 'clausulas', label: 'Cláusulas' },
  { id: 'assinatura', label: 'Assinatura' }
];

const TAB_ORDER = TABS.map((item) => item.id);

export function JuridicosApp() {
  const previewRef = useRef<HTMLDivElement>(null);
  const exportingLockRef = useRef(false);
  const { refresh: refreshAuth, usage } = useAuth();
  const brandDocuments = !usage.unlimited;
  const [items, setItems] = useState<LegalDocumentData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [doc, setDoc] = useState<LegalDocumentData>(createEmptyLegalDocument());
  const [tab, setTab] = useState<EditorTab>('partes');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const meta = getLegalTemplate(doc.templateId);
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

  useEffect(() => {
    const stored = listLegalDocuments();
    if (stored.length > 0) {
      setItems(stored);
      setActiveId(stored[0].id);
      setDoc(stored[0]);
      return;
    }
    const saved = saveLegalDocument(createEmptyLegalDocument());
    setItems([saved]);
    setActiveId(saved.id);
    setDoc(saved);
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const timeout = window.setTimeout(() => {
      setSaveState('saving');
      saveLegalDocument(doc);
      setItems(listLegalDocuments());
      setSaveState('saved');
      window.setTimeout(() => setSaveState('idle'), 1200);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [doc, activeId]);

  function updateDoc(patch: Partial<LegalDocumentData>) {
    setDoc((current) => ({ ...current, ...patch }));
  }

  function updateParty(side: 'partyA' | 'partyB', patch: Partial<LegalParty>) {
    setDoc((current) => ({
      ...current,
      [side]: { ...current[side], ...patch }
    }));
  }

  function updateClause(clauseId: string, patch: Partial<LegalClause>) {
    setDoc((current) => ({
      ...current,
      clauses: current.clauses.map((item) => (item.id === clauseId ? { ...item, ...patch } : item))
    }));
  }

  function handleSelect(id: string) {
    const selected = items.find((item) => item.id === id);
    if (!selected) return;
    setActiveId(selected.id);
    setDoc(selected);
  }

  function handleDuplicate(id: string) {
    const source = items.find((item) => item.id === id);
    if (!source) return;
    const copyId = createEmptyLegalDocument(source.templateId).id;
    const copy = saveLegalDocument({
      ...source,
      id: copyId,
      title: source.title?.trim() ? `Cópia · ${source.title}` : 'Cópia do documento',
      updatedAt: new Date().toISOString()
    });
    setItems(listLegalDocuments());
    setActiveId(copy.id);
    setDoc(copy);
  }

  function handleDeleteById(id: string) {
    if (items.length <= 1) return;
    deleteLegalDocument(id);
    const next = listLegalDocuments();
    setItems(next);
    if (activeId === id) {
      setActiveId(next[0].id);
      setDoc(next[0]);
    }
  }

  function handleNew() {
    const created = saveLegalDocument(createEmptyLegalDocument(doc.templateId));
    setItems(listLegalDocuments());
    setActiveId(created.id);
    setDoc(created);
  }

  function handleLoadSample() {
    const sample = saveLegalDocument({
      ...SAMPLE_LEGAL_DOCUMENT,
      id: doc.id,
      templateId: doc.templateId === 'procuracao' ? 'honorarios' : 'procuracao'
    });
    const withClauses = { ...sample, clauses: buildDefaultClauses(sample) };
    const saved = saveLegalDocument(withClauses);
    setDoc(saved);
    setItems(listLegalDocuments());
  }

  function handleClearForm() {
    const blank = createEmptyLegalDocument(doc.templateId);
    const cleared = saveLegalDocument({
      ...blank,
      id: doc.id,
      title: 'Novo documento jurídico'
    });
    setDoc(cleared);
    setItems(listLegalDocuments());
    setError('');
  }

  function handleTemplateChange(templateId: LegalTemplateId) {
    setDoc((current) => {
      const next = { ...current, templateId };
      const templateName = getLegalTemplate(templateId).name;
      const shouldRename =
        !current.title.trim() ||
        current.title.startsWith('Novo documento') ||
        /exemplo/i.test(current.title);
      return {
        ...next,
        title: shouldRename ? templateName : current.title,
        clauses: buildDefaultClauses(next)
      };
    });
  }

  function handleRegenerateClauses() {
    setDoc((current) => ({ ...current, clauses: buildDefaultClauses(current) }));
  }

  function handleDelete() {
    handleDeleteById(doc.id);
  }

  const historyItems = items.map((item) => ({
    id: item.id,
    title: item.title,
    typeLabel: getLegalTemplate(item.templateId).name,
    partyLabel: item.partyA.name || item.partyB.name,
    updatedAt: item.updatedAt
  }));

  async function handleManualSave() {
    setError('');
    setSaveState('saving');
    try {
      const outcome = await performBillableAction(
        { toolId: 'juridicos', artifactId: doc.id, action: 'manual_save' },
        () => saveLegalDocument(doc)
      );
      if (!outcome.allowed) {
        setError(outcome.reason || 'Faça login e confirme seu e-mail para continuar.');
        return;
      }
      setItems(listLegalDocuments());
      refreshAuth();
      setSaveState('saved');
    } catch {
      setError('Não foi possível salvar o documento.');
    } finally {
      window.setTimeout(() => setSaveState('idle'), 1200);
    }
  }

  async function handleExportPdf() {
    setError('');
    if (!previewRef.current || exportingLockRef.current) return;
    exportingLockRef.current = true;
    try {
      setExporting(true);
      const safeName = (doc.title || meta.name || 'documento').replace(/[^\w\-]+/g, '_');
      const outcome = await performBillableAction(
        { toolId: 'juridicos', artifactId: doc.id, action: 'download' },
        () =>
          exportElementToPdf(previewRef.current!, `Juridico_${safeName}.pdf`, { branded: brandDocuments })
      );
      if (!outcome.allowed) {
        setError(outcome.reason || 'Não foi possível exportar o PDF.');
        return;
      }
      refreshAuth();
    } catch {
      setError('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      exportingLockRef.current = false;
      setExporting(false);
    }
  }

  return (
    <AuthGate
      title="Documentos jurídicos exigem cadastro"
      description="Crie sua conta gratuita para montar procurações, honorários e notificações em PDF."
    >
      <div className="space-y-5">
        <RemoveBrandingUpsell />
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-stone-950 via-amber-950 to-stone-900 px-5 py-6 text-white sm:px-6">
            <ToolsWatermark />
            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-300/15 text-amber-200">
                  <Gavel className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/80">
                    Para advogados e escritórios
                  </p>
                  <h1 className="rj-display mt-1 text-2xl font-extrabold tracking-tight">
                    Documentos jurídicos
                  </h1>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-300">
                    Instrumentos, declarações e peças processuais para a prática jurídica e os
                    estudos — preencha, ajuste as cláusulas e baixe o PDF.
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
            <label className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Nome na lista
              </span>
              <Input
                value={doc.title}
                onChange={(event) => updateDoc({ title: event.target.value })}
                placeholder="Ex.: Procuração João Silva"
                className="max-w-md"
              />
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={doc.inkSaver}
                  onChange={(event) => updateDoc({ inkSaver: event.target.checked })}
                  className="rounded border-slate-300"
                />
                Economia de tinta
              </label>
              <p className="text-sm font-medium text-slate-600">
                {saveState === 'saving' ? 'Salvando...' : saveState === 'saved' ? 'Salvo automaticamente' : 'Alterações locais'}
              </p>
            </div>
          </div>
          {error ? <p className="px-5 pb-4 text-sm font-medium text-red-600 sm:px-6">{error}</p> : null}
        </section>

        <DocumentStickyActions>
          <Button type="button" variant="outline" size="sm" onClick={handleNew}>
            <FilePlus2 className="h-4 w-4" />
            Novo
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleLoadSample}>
            <Sparkles className="h-4 w-4" />
            Exemplo
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleClearForm}>
            <Eraser className="h-4 w-4" />
            Limpar
          </Button>
          <Button type="button" size="sm" onClick={handleManualSave} disabled={saveState === 'saving'}>
            {saveState === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar
          </Button>
          <Button type="button" size="sm" onClick={handleExportPdf} disabled={exporting} className="bg-amber-500 hover:bg-amber-600">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Baixar PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={items.length <= 1}
            className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
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
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Tipo de documento</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {LEGAL_TEMPLATES.map((template) => {
              const active = doc.templateId === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateChange(template.id)}
                  className={cn(
                    'overflow-hidden rounded-2xl border text-left transition',
                    active ? 'border-amber-500 ring-2 ring-amber-200' : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div className={cn('h-2 bg-gradient-to-r', template.previewClass)} />
                  <div className="p-4">
                    <p className="text-sm font-bold text-slate-900">{template.name}</p>
                    <p className="mt-1 text-xs font-medium text-amber-800">{template.audience}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-600">{template.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <DocumentFontPicker
          kind="peticao"
          value={doc.fontId}
          onChange={(fontId: DocumentFontId) => updateDoc({ fontId })}
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(320px,42%)_1fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div ref={tabsRef} className="flex flex-wrap gap-2">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToTab(item.id)}
                  className={cn(
                    'rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wide transition',
                    tab === item.id ? 'bg-stone-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-4">
              {tab === 'partes' ? (
                <>
                  <DocumentPartyFields
                    title={meta.labels.partyA}
                    party={doc.partyA}
                    idPrefix="jur-a"
                    onChange={(patch) => updateParty('partyA', patch)}
                  />
                  {meta.labels.showPartyB ? (
                    <div className="border-t border-slate-100 pt-4">
                      <DocumentPartyFields
                        title={meta.labels.partyB}
                        party={doc.partyB}
                        idPrefix="jur-b"
                        onChange={(patch) => updateParty('partyB', patch)}
                      />
                    </div>
                  ) : null}
                  {(doc.templateId === 'procuracao' ||
                    doc.templateId === 'honorarios' ||
                    doc.templateId === 'substabelecimento' ||
                    doc.templateId === 'peticao-inicial' ||
                    doc.templateId === 'contestacao' ||
                    doc.templateId === 'recurso-inominado') && (
                    <FormField label="OAB do advogado">
                      <Input
                        value={doc.oabNumber}
                        onChange={(event) => updateDoc({ oabNumber: event.target.value })}
                        placeholder="OAB/GO 00.000"
                      />
                    </FormField>
                  )}
                </>
              ) : null}

              {tab === 'termos' ? (
                <>
                  <FormField label={meta.labels.objectLabel}>
                    <Textarea
                      value={doc.objectDescription}
                      onChange={(event) => updateDoc({ objectDescription: event.target.value })}
                      rows={3}
                      placeholder="Descreva o objeto ou assunto do documento"
                    />
                  </FormField>

                  {(doc.templateId === 'procuracao' || doc.templateId === 'substabelecimento') && (
                    <FormField label="Poderes">
                      <Textarea
                        value={doc.powers}
                        onChange={(event) => updateDoc({ powers: event.target.value })}
                        rows={3}
                        placeholder="Ex.: propor ações, recorrer, transigir, receber e dar quitação..."
                      />
                    </FormField>
                  )}

                  {doc.templateId === 'substabelecimento' ? (
                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={doc.reservePowers}
                        onChange={(event) => updateDoc({ reservePowers: event.target.checked })}
                        className="rounded border-slate-300"
                      />
                      Com reserva de poderes
                    </label>
                  ) : null}

                  {(['notificacao', 'peticao-inicial', 'contestacao', 'recurso-inominado', 'fichamento-jurisprudencia', 'estudo-caso', 'parecer-academico', 'relatorio-audiencia', 'roteiro-peca'] as LegalTemplateId[]).includes(doc.templateId) ? (
                    <>
                      <FormField label={doc.templateId === 'relatorio-audiencia' ? 'Participantes e contexto' : 'Fatos / relatório'}>
                        <Textarea
                          value={doc.facts}
                          onChange={(event) => updateDoc({ facts: event.target.value })}
                          rows={4}
                          placeholder="Relate os fatos em ordem cronológica"
                        />
                      </FormField>
                      <FormField label={(['fichamento-jurisprudencia', 'estudo-caso', 'parecer-academico', 'relatorio-audiencia', 'roteiro-peca'] as LegalTemplateId[]).includes(doc.templateId) ? 'Tese, conclusão ou resultado' : 'Pedido / pretensão'}>
                        <Textarea
                          value={doc.request}
                          onChange={(event) => updateDoc({ request: event.target.value })}
                          rows={3}
                          placeholder="O que você exige do notificado"
                        />
                      </FormField>
                      {doc.templateId === 'notificacao' ? (
                        <FormField label="Prazo para cumprimento">
                          <Input
                            value={doc.deadline}
                            onChange={(event) => updateDoc({ deadline: event.target.value })}
                            placeholder="5 (cinco) dias úteis"
                          />
                        </FormField>
                      ) : null}
                    </>
                  ) : null}

                  {(['notificacao', 'peticao-inicial', 'contestacao', 'recurso-inominado'] as LegalTemplateId[]).includes(doc.templateId) ? (
                    <FormField label={meta.labels.valueLabel}>
                      <Input
                        value={doc.valueLabel}
                        onChange={(event) => updateDoc({ valueLabel: event.target.value })}
                        placeholder="R$ 1.500,00 (opcional)"
                      />
                    </FormField>
                  ) : null}

                  {(doc.templateId === 'honorarios' || doc.templateId === 'acordo-extrajudicial') ? (
                    <>
                      <FormField label={meta.labels.valueLabel}>
                        <Input
                          value={doc.valueLabel}
                          onChange={(event) => updateDoc({ valueLabel: event.target.value })}
                          placeholder="R$ 3.000,00 ou 20% sobre o êxito"
                        />
                      </FormField>
                      <FormField label="Forma de pagamento">
                        <Textarea
                          value={doc.paymentTerms}
                          onChange={(event) => updateDoc({ paymentTerms: event.target.value })}
                          rows={2}
                          placeholder="50% na assinatura, 50% ao final"
                        />
                      </FormField>
                      {doc.templateId === 'acordo-extrajudicial' ? (
                        <FormField label="Prazo para cumprimento">
                          <Input
                            value={doc.deadline}
                            onChange={(event) => updateDoc({ deadline: event.target.value })}
                            placeholder="Ex.: até 30/08/2026"
                          />
                        </FormField>
                      ) : null}
                    </>
                  ) : null}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Nº do processo (opcional)">
                      <Input
                        value={doc.caseNumber}
                        onChange={(event) => updateDoc({ caseNumber: event.target.value })}
                        placeholder="0000000-00.0000.0.00.0000"
                      />
                    </FormField>
                    <FormField label="Juízo / comarca">
                      <Input
                        value={doc.court}
                        onChange={(event) => updateDoc({ court: event.target.value })}
                        placeholder="Comarca de Goiânia/GO"
                      />
                    </FormField>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Cidade">
                      <Input
                        value={doc.city}
                        onChange={(event) => updateDoc({ city: event.target.value })}
                        placeholder="Goiânia"
                      />
                    </FormField>
                    <FormField label="UF">
                      <Input
                        value={doc.state}
                        onChange={(event) => updateDoc({ state: event.target.value })}
                        placeholder="GO"
                        maxLength={2}
                      />
                    </FormField>
                  </div>

                  <Button type="button" variant="outline" onClick={handleRegenerateClauses} className="w-full">
                    <RefreshCw className="h-4 w-4" />
                    Atualizar cláusulas com estes dados
                  </Button>
                </>
              ) : null}

              {tab === 'clausulas' ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-600">Edite o texto livremente. Cada item aparece no PDF.</p>
                    <Button type="button" variant="outline" size="sm" onClick={handleRegenerateClauses}>
                      <RefreshCw className="h-3.5 w-3.5" />
                      Regenerar
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {doc.clauses.map((clause, index) => (
                      <div key={clause.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          Item {index + 1}
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
                      value={doc.signedAt}
                      onChange={(event) => updateDoc({ signedAt: event.target.value })}
                      placeholder="17/07/2026"
                    />
                  </FormField>
                  <FormField label="Testemunha 1 (opcional)">
                    <Input
                      value={doc.witness1}
                      onChange={(event) => updateDoc({ witness1: event.target.value })}
                      placeholder="Nome completo"
                    />
                  </FormField>
                  <FormField label="Testemunha 2 (opcional)">
                    <Input
                      value={doc.witness2}
                      onChange={(event) => updateDoc({ witness2: event.target.value })}
                      placeholder="Nome completo"
                    />
                  </FormField>
                  <FormField label="Observações finais">
                    <Textarea
                      value={doc.extraNotes}
                      onChange={(event) => updateDoc({ extraNotes: event.target.value })}
                      rows={3}
                      placeholder="Notas adicionais no documento"
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
                  ? 'Ir para Conteúdo'
                  : tab === 'termos'
                    ? 'Ir para Cláusulas'
                    : 'Ir para Assinatura'
              }
            />
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-slate-100/80 p-4 shadow-sm sm:p-6 xl:sticky xl:top-[var(--rj-doc-preview-top)] xl:self-start">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Pré-visualização</p>
            <div className="overflow-auto rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-200/80 to-slate-300/50 p-3 sm:p-5">
              <div
                ref={previewRef}
                className="mx-auto w-full max-w-[210mm] overflow-hidden rounded-[2px] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.18),0_2px_8px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5"
              >
                <DocumentExportShell branded={brandDocuments}>
                  <JuridicoPreview data={doc} />
                </DocumentExportShell>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AuthGate>
  );
}
