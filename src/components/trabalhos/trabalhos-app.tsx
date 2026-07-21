'use client';

import { useEffect, useRef, useState } from 'react';
import { BookOpen, Download, Eraser, FilePlus2, Loader2, Save, Sparkles, Trash2 } from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { TrabalhoPreview } from '@/components/trabalhos/trabalho-preview';
import { DocumentFontPicker } from '@/components/shared/document-font-picker';
import { DocumentStickyActions } from '@/components/shared/document-sticky-actions';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { performBillableAction } from '@/lib/billing';
import { exportElementToPdf } from '@/lib/curriculo/pdf';
import type { DocumentFontId } from '@/lib/documents/fonts';
import { createEmptyTrabalho, SAMPLE_TRABALHO } from '@/lib/trabalhos/defaults';
import { deleteTrabalho, listTrabalhos, saveTrabalho } from '@/lib/trabalhos/storage';
import { TRABALHO_TEMPLATES } from '@/lib/trabalhos/templates';
import type { TrabalhoData, TrabalhoTemplateId } from '@/lib/trabalhos/types';
import { cn } from '@/lib/utils';

export function TrabalhosApp() {
  const previewRef = useRef<HTMLDivElement>(null);
  const { refresh: refreshAuth } = useAuth();
  const [items, setItems] = useState<TrabalhoData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [trabalho, setTrabalho] = useState<TrabalhoData>(createEmptyTrabalho());
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = listTrabalhos();
    if (stored.length > 0) {
      setItems(stored);
      setActiveId(stored[0].id);
      setTrabalho(stored[0]);
      return;
    }
    const saved = saveTrabalho(createEmptyTrabalho());
    setItems([saved]);
    setActiveId(saved.id);
    setTrabalho(saved);
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const timeout = window.setTimeout(() => {
      setSaveState('saving');
      saveTrabalho(trabalho);
      setItems(listTrabalhos());
      setSaveState('saved');
      window.setTimeout(() => setSaveState('idle'), 1200);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [trabalho, activeId]);

  function updateTrabalho(patch: Partial<TrabalhoData>) {
    setTrabalho((current) => ({ ...current, ...patch }));
  }

  function handleSelect(id: string) {
    const selected = items.find((item) => item.id === id);
    if (!selected) return;
    setActiveId(selected.id);
    setTrabalho(selected);
  }

  function handleNew() {
    const created = saveTrabalho(createEmptyTrabalho(trabalho.templateId));
    setItems(listTrabalhos());
    setActiveId(created.id);
    setTrabalho(created);
  }

  function handleLoadSample() {
    const sample = saveTrabalho({
      ...SAMPLE_TRABALHO,
      id: trabalho.id,
      templateId: trabalho.templateId === 'escolar' ? 'universitaria' : trabalho.templateId
    });
    setTrabalho(sample);
    setItems(listTrabalhos());
  }

  function handleClearForm() {
    const blank = createEmptyTrabalho(trabalho.templateId);
    const cleared = saveTrabalho({
      ...blank,
      id: trabalho.id,
      title: 'Nova capa'
    });
    setTrabalho(cleared);
    setItems(listTrabalhos());
    setError('');
  }

  function handleDelete() {
    if (items.length <= 1) return;
    deleteTrabalho(trabalho.id);
    const next = listTrabalhos();
    setItems(next);
    setActiveId(next[0].id);
    setTrabalho(next[0]);
  }

  async function handleManualSave() {
    setError('');
    setSaveState('saving');
    try {
      const outcome = await performBillableAction(
        { toolId: 'trabalhos', artifactId: trabalho.id, action: 'manual_save' },
        () => saveTrabalho(trabalho)
      );
      if (!outcome.allowed) {
        setError(outcome.reason || 'Seu saldo não permite salvar agora.');
        return;
      }
      setItems(listTrabalhos());
      refreshAuth();
      setSaveState('saved');
    } catch {
      setError('Não foi possível salvar a capa.');
    } finally {
      window.setTimeout(() => setSaveState('idle'), 1200);
    }
  }

  async function handleExportPdf() {
    setError('');
    if (!previewRef.current) return;
    try {
      setExporting(true);
      const safeName = (trabalho.workTitle || trabalho.title || 'capa-trabalho').replace(/[^\w\-]+/g, '_');
      const outcome = await performBillableAction(
        { toolId: 'trabalhos', artifactId: trabalho.id, action: 'download' },
        () => exportElementToPdf(previewRef.current!, `Capa_${safeName}.pdf`)
      );
      if (!outcome.allowed) {
        setError(outcome.reason || 'Não foi possível exportar o PDF.');
        return;
      }
      refreshAuth();
    } catch {
      setError('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setExporting(false);
    }
  }

  const isAcademic = trabalho.templateId !== 'escolar';
  const showDisciplineAndAdvisor = trabalho.templateId !== 'universitaria';

  return (
    <AuthGate
      title="Capas de trabalho exigem cadastro"
      description="Crie sua conta gratuita para gerar capas escolares e universitárias em segundos."
    >
      <div className="space-y-5">
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700">
                <BookOpen className="h-6 w-6" />
              </span>
              <div>
                <h1 className="rj-display text-2xl font-extrabold tracking-tight text-slate-900">
                  Capas de Trabalho
                </h1>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  Capas para ensino fundamental, médio e universidade no padrão ABNT. Rápido, limpo e pronto para
                  imprimir.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleNew}>
                <FilePlus2 className="h-4 w-4" />
                Nova
              </Button>
              <Button variant="outline" onClick={handleLoadSample}>
                <Sparkles className="h-4 w-4" />
                Carregar exemplo
              </Button>
              <Button variant="outline" onClick={handleClearForm}>
                <Eraser className="h-4 w-4" />
                Limpar
              </Button>
              <Button onClick={handleExportPdf} disabled={exporting}>
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Baixar PDF
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select value={activeId ?? ''} onChange={(event) => handleSelect(event.target.value)} className="min-w-[250px]">
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title || item.workTitle || 'Capa sem título'}
                  </option>
                ))}
              </Select>
              <Input
                value={trabalho.title}
                onChange={(event) => updateTrabalho({ title: event.target.value })}
                placeholder="Nome interno (só na lista)"
                className="min-w-[220px]"
                title="Identificação na lista (não aparece no PDF)"
              />
            </div>
            <p className="text-sm font-medium text-slate-600">
              {saveState === 'saving' ? 'Salvando...' : saveState === 'saved' ? 'Salva automaticamente' : 'Alterações locais'}
            </p>
          </div>
          {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
        </section>

        <DocumentStickyActions>
          <Button type="button" variant="outline" size="sm" onClick={handleNew}>
            <FilePlus2 className="h-4 w-4" />
            Nova
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
          <Button type="button" size="sm" onClick={handleExportPdf} disabled={exporting} className="bg-emerald-600 hover:bg-emerald-700">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Baixar PDF
          </Button>
        </DocumentStickyActions>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Modelos</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {TRABALHO_TEMPLATES.map((template) => {
              const active = trabalho.templateId === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => updateTrabalho({ templateId: template.id as TrabalhoTemplateId })}
                  className={cn(
                    'rounded-2xl border p-4 text-left transition-all',
                    active ? 'border-sky-600 bg-sky-50 shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-sky-300'
                  )}
                >
                  <div className={cn('mb-3 h-14 rounded-xl bg-gradient-to-br', template.previewClass)} />
                  <p className="font-semibold text-slate-900">{template.name}</p>
                  <p className="mt-1 text-xs font-medium text-sky-700">{template.audience}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{template.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <DocumentFontPicker
          kind="academico"
          value={trabalho.fontId}
          onChange={(fontId: DocumentFontId) => updateTrabalho({ fontId })}
        />

        <section className="grid gap-5 xl:grid-cols-[460px_1fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-4">
              <FormField label="Instituição / escola">
                <Input
                  value={trabalho.institution}
                  onChange={(event) => updateTrabalho({ institution: event.target.value })}
                  placeholder={isAcademic ? 'Universidade Federal...' : 'Escola Municipal...'}
                />
              </FormField>
              <FormField label={isAcademic ? 'Curso' : 'Série / turma'}>
                <Input
                  value={trabalho.courseOrGrade}
                  onChange={(event) => updateTrabalho({ courseOrGrade: event.target.value })}
                  placeholder={isAcademic ? 'Curso de Administração' : '8º ano B'}
                />
              </FormField>
              <FormField label="Nome do aluno(a) / autor(a)">
                <Input
                  value={trabalho.studentName}
                  onChange={(event) => updateTrabalho({ studentName: event.target.value })}
                  placeholder="Nome completo"
                />
              </FormField>
              <FormField label="Título do trabalho">
                <Input
                  value={trabalho.workTitle}
                  onChange={(event) => updateTrabalho({ workTitle: event.target.value })}
                  placeholder="Título principal"
                />
              </FormField>
              <FormField label="Subtítulo (opcional)">
                <Input
                  value={trabalho.subtitle}
                  onChange={(event) => updateTrabalho({ subtitle: event.target.value })}
                  placeholder="Subtítulo"
                />
              </FormField>
              {showDisciplineAndAdvisor ? (
                <>
                  <FormField label="Disciplina">
                    <Input
                      value={trabalho.discipline}
                      onChange={(event) => updateTrabalho({ discipline: event.target.value })}
                      placeholder="História, Gestão de Projetos..."
                    />
                  </FormField>
                  <FormField label={isAcademic ? 'Orientador(a) / professor(a)' : 'Professor(a)'}>
                    <Input
                      value={trabalho.teacherOrAdvisor}
                      onChange={(event) => updateTrabalho({ teacherOrAdvisor: event.target.value })}
                      placeholder="Nome do professor"
                    />
                  </FormField>
                </>
              ) : null}
              {trabalho.templateId === 'folha-rosto' ? (
                <FormField label="Natureza do trabalho">
                  <Textarea
                    value={trabalho.workNature}
                    onChange={(event) => updateTrabalho({ workNature: event.target.value })}
                    rows={4}
                    placeholder="Trabalho apresentado à disciplina..."
                  />
                </FormField>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Cidade">
                  <Input
                    value={trabalho.city}
                    onChange={(event) => updateTrabalho({ city: event.target.value })}
                    placeholder="Goiânia"
                  />
                </FormField>
                <FormField label="Ano">
                  <Input
                    value={trabalho.year}
                    onChange={(event) => updateTrabalho({ year: event.target.value })}
                    placeholder={String(new Date().getFullYear())}
                  />
                </FormField>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <Button variant="outline" onClick={handleManualSave} disabled={saveState === 'saving'}>
                <Save className="h-4 w-4" />
                Salvar agora
              </Button>
              {items.length > 1 ? (
                <Button variant="danger" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              ) : null}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-100/80 p-4 shadow-sm sm:p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Pré-visualização</p>
            <div className="overflow-auto rounded-2xl bg-slate-200/70 p-3 sm:p-4">
              <div ref={previewRef} className="mx-auto w-full max-w-[210mm] origin-top scale-[0.72] sm:scale-90 lg:scale-100">
                <TrabalhoPreview data={trabalho} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </AuthGate>
  );
}
