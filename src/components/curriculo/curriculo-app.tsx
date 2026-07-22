'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Download,
  Eraser,
  FilePlus2,
  GraduationCap,
  Plus,
  Save,
  Sparkles,
  Trash2
} from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { ToolsWatermark } from '@/components/brand/tools-watermark';
import { ResumePreview } from '@/components/curriculo/resume-preview';
import { DocumentFontPicker } from '@/components/shared/document-font-picker';
import { DocumentStickyActions } from '@/components/shared/document-sticky-actions';
import { EditorStepProgress } from '@/components/shared/editor-step-progress';
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
import type { DocumentFontId } from '@/lib/documents/fonts';
import {
  createCourse,
  createEducation,
  createEmptyResume,
  createExperience,
  createLanguage,
  SAMPLE_RESUME
} from '@/lib/curriculo/defaults';
import { ViralPdfShareModal, useViralPdfShare } from '@/components/marketing/viral-pdf-share';
import { exportElementToPdf } from '@/lib/curriculo/pdf';
import { deleteResume, listResumes, saveResume } from '@/lib/curriculo/storage';
import { RESUME_TEMPLATES } from '@/lib/curriculo/templates';
import type { ResumeData, ResumeTemplateId } from '@/lib/curriculo/types';
import { LANGUAGE_LEVEL_LABELS } from '@/lib/curriculo/types';
import { formatPhone } from '@/lib/formatters';
import { isValidEmail, isValidPhone } from '@/lib/validators';
import { cn } from '@/lib/utils';

type EditorTab = 'dados' | 'experiencia' | 'formacao' | 'cursos' | 'extras';

const STEPS: { id: EditorTab; label: string }[] = [
  { id: 'dados', label: 'Dados' },
  { id: 'experiencia', label: 'Experiência' },
  { id: 'formacao', label: 'Formação' },
  { id: 'cursos', label: 'Cursos' },
  { id: 'extras', label: 'Skills' }
];

function splitCommaList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function isLikelyWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  return /^(https?:\/\/)?(www\.)?[\w.-]+\.[a-z]{2,}([/?#].*)?$/i.test(trimmed) ||
    /^(linkedin\.com\/in\/|github\.com\/)/i.test(trimmed);
}

export function CurriculoApp() {
  const previewRef = useRef<HTMLDivElement>(null);
  const exportingLockRef = useRef(false);
  const { refresh: refreshAuth } = useAuth();
  const { toast } = useToast();
  const { afterPdfExport, viralShareOpen, viralShareLabel, closeViralShare } = useViralPdfShare();
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [resume, setResume] = useState<ResumeData>(createEmptyResume());
  const [tab, setTab] = useState<EditorTab>('dados');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [touchedName, setTouchedName] = useState(false);
  const [touchedWebsite, setTouchedWebsite] = useState(false);

  useEffect(() => {
    const stored = listResumes();
    if (stored.length > 0) {
      setResumes(stored);
      setActiveId(stored[0].id);
      setResume(stored[0]);
      return;
    }
    const initial = createEmptyResume();
    const saved = saveResume(initial);
    setResumes([saved]);
    setActiveId(saved.id);
    setResume(saved);
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const timeout = window.setTimeout(() => {
      setSaveState('saving');
      saveResume(resume);
      setResumes(listResumes());
      setSaveState('saved');
      window.setTimeout(() => setSaveState('idle'), 1200);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [resume, activeId]);

  const skillsValue = useMemo(() => resume.skills.join(', '), [resume.skills]);
  const emailInvalid = resume.personal.email.length > 0 && !isValidEmail(resume.personal.email);
  const phoneInvalid = resume.personal.phone.length > 0 && !isValidPhone(resume.personal.phone);
  const nameError = resume.personal.fullName.trim() ? '' : 'Nome completo obrigatório.';
  const websiteInvalid =
    resume.personal.website.length > 0 && !isLikelyWebsite(resume.personal.website);

  function updateResume(patch: Partial<ResumeData>) {
    setResume((current) => ({ ...current, ...patch }));
  }

  function handleSelectResume(resumeId: string) {
    const selected = resumes.find((item) => item.id === resumeId);
    if (!selected) return;
    setActiveId(selected.id);
    setResume(selected);
    setTouchedName(false);
    setTouchedWebsite(false);
  }

  function handleNewResume(templateId: ResumeTemplateId = resume.templateId) {
    const created = saveResume(createEmptyResume(templateId));
    const next = listResumes();
    setResumes(next);
    setActiveId(created.id);
    setResume(created);
    setTab('dados');
    toast('Novo currículo criado.');
  }

  function handleLoadSample() {
    const sample = saveResume({ ...SAMPLE_RESUME, id: resume.id, title: 'Currículo de exemplo' });
    setResume(sample);
    setResumes(listResumes());
    toast('Exemplo carregado — revise os dados.');
  }

  function handleClearForm() {
    const blank = createEmptyResume(resume.templateId);
    const cleared = saveResume({
      ...blank,
      id: resume.id,
      title: 'Novo currículo'
    });
    setResume(cleared);
    setResumes(listResumes());
    setError('');
    setTouchedName(false);
    setTouchedWebsite(false);
    toast('Formulário limpo.');
  }

  function handleDeleteResume() {
    if (resumes.length <= 1) return;
    const removed = resume;
    deleteResume(resume.id);
    const next = listResumes();
    setResumes(next);
    const first = next[0];
    setActiveId(first.id);
    setResume(first);
    toast('Currículo excluído.', {
      undoLabel: 'Desfazer',
      onUndo: () => {
        const restored = saveResume(removed);
        setResumes(listResumes());
        setActiveId(restored.id);
        setResume(restored);
        toast('Exclusão desfeita.');
      }
    });
  }

  async function handleManualSave() {
    setError('');
    setTouchedName(true);
    if (nameError) {
      setError(nameError);
      setTab('dados');
      toast(nameError);
      return;
    }
    setSaveState('saving');
    try {
      const outcome = await performBillableAction(
        { toolId: 'curriculo', artifactId: resume.id, action: 'manual_save' },
        () => saveResume(resume)
      );
      if (!outcome.allowed) {
        setError(outcome.reason || 'Seu saldo não permite salvar agora.');
        toast(outcome.reason || 'Não foi possível salvar.');
        return;
      }
      setResumes(listResumes());
      refreshAuth();
      setSaveState('saved');
      toast('Currículo salvo com sucesso!');
    } catch {
      setError('Não foi possível salvar o currículo.');
      toast('Erro ao salvar.');
    } finally {
      window.setTimeout(() => setSaveState('idle'), 1200);
    }
  }

  async function handleExportPdf() {
    setError('');
    setTouchedName(true);
    if (nameError || emailInvalid || phoneInvalid || websiteInvalid) {
      const msg =
        nameError ||
        (emailInvalid ? 'E-mail inválido.' : '') ||
        (phoneInvalid ? 'Telefone inválido.' : '') ||
        (websiteInvalid ? 'LinkedIn / site inválido.' : '');
      setError(msg);
      setTab('dados');
      toast(msg);
      return;
    }
    if (!previewRef.current || exportingLockRef.current) return;

    exportingLockRef.current = true;
    try {
      setExporting(true);
      const safeName = (resume.personal.fullName || resume.title || 'curriculo').replace(/[^\w\-]+/g, '_');
      const outcome = await performBillableAction(
        { toolId: 'curriculo', artifactId: resume.id, action: 'download' },
        () => exportElementToPdf(previewRef.current!, `${safeName}.pdf`)
      );
      if (!outcome.allowed) {
        setError(outcome.reason || 'Não foi possível exportar o PDF.');
        toast(outcome.reason || 'Não foi possível exportar o PDF.');
        return;
      }
      refreshAuth();
      afterPdfExport('currículo');
    } catch {
      setError('Não foi possível gerar o PDF. Tente novamente.');
      toast('Erro ao gerar PDF.');
    } finally {
      exportingLockRef.current = false;
      setExporting(false);
    }
  }

  return (
    <AuthGate
      title="Currículos exigem cadastro"
      description="Crie sua conta gratuita para montar, salvar e baixar currículos profissionais."
    >
      <ViralPdfShareModal open={viralShareOpen} onClose={closeViralShare} docLabel={viralShareLabel} />
      <div className="space-y-5">
        <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <ToolsWatermark />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700">
                <GraduationCap className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Editor de Currículos</h1>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  Experiência, formação, cursos e idiomas. Preview A4 com margens de impressão e PDF.
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

          <div className="relative mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={activeId ?? ''} onChange={(event) => handleSelectResume(event.target.value)} className="min-w-[220px]">
                {resumes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </Select>
              <Input
                value={resume.title}
                onChange={(event) => updateResume({ title: event.target.value })}
                placeholder="Nome do currículo"
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
          {error ? <p className="relative mt-3 text-sm font-semibold text-rose-600" role="alert">{error}</p> : null}
        </section>

        <DocumentStickyActions>
          <Button type="button" variant="outline" size="sm" icon={FilePlus2} onClick={() => handleNewResume()}>
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
            variant="success"
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
            className="bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-400"
          >
            Baixar PDF
          </Button>
          {resumes.length > 1 ? (
            <Button type="button" variant="danger" size="sm" icon={Trash2} onClick={handleDeleteResume}>
              Excluir
            </Button>
          ) : null}
        </DocumentStickyActions>

        {exporting ? <ProgressBanner label="Gerando PDF…" /> : null}

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-600">Modelos</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {RESUME_TEMPLATES.map((template) => {
              const active = resume.templateId === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => updateResume({ templateId: template.id })}
                  className={cn(
                    'rounded-2xl border p-3 text-left transition-all sm:p-4',
                    active
                      ? 'border-sky-600 bg-sky-50 shadow-sm ring-2 ring-sky-100'
                      : 'border-slate-200 bg-slate-50 hover:border-sky-300'
                  )}
                >
                  <div
                    className={cn(
                      'mb-3 overflow-hidden rounded-xl border border-white/30 bg-gradient-to-br p-2.5',
                      template.previewClass
                    )}
                  >
                    {template.id === 'professional' ? (
                      <div className="space-y-1.5 rounded-lg bg-white p-2">
                        <div className="h-2 w-1/2 rounded bg-slate-900" />
                        <div className="h-1 w-full rounded bg-slate-200" />
                        <div className="mt-2 space-y-1">
                          <div className="h-1 w-full rounded bg-slate-100" />
                          <div className="h-1 w-5/6 rounded bg-slate-100" />
                          <div className="h-1 w-4/5 rounded bg-slate-100" />
                        </div>
                      </div>
                    ) : null}
                    {template.id === 'modern' ? (
                      <div className="flex gap-1.5 rounded-lg bg-white p-2">
                        <div className="w-5 shrink-0 space-y-1 rounded bg-sky-700 p-1">
                          <div className="mx-auto h-3 w-3 rounded-full bg-sky-300" />
                          <div className="h-1 rounded bg-sky-500/80" />
                          <div className="h-1 rounded bg-sky-500/60" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="h-2 w-2/3 rounded bg-sky-800" />
                          <div className="h-1 w-full rounded bg-slate-200" />
                          <div className="h-1 w-4/5 rounded bg-slate-100" />
                        </div>
                      </div>
                    ) : null}
                    {template.id === 'academic' ? (
                      <div className="space-y-1.5 rounded-lg bg-white p-2">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded bg-indigo-600" />
                          <div className="h-2 flex-1 rounded bg-indigo-800" />
                        </div>
                        <div className="grid grid-cols-2 gap-1 pt-1">
                          <div className="h-8 rounded border border-indigo-100 bg-indigo-50/80" />
                          <div className="h-8 rounded border border-indigo-100 bg-indigo-50/80" />
                        </div>
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
          kind="curriculo"
          value={resume.fontId}
          onChange={(fontId: DocumentFontId) => updateResume({ fontId })}
        />

        <section className="grid gap-5 xl:grid-cols-[440px_1fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <EditorStepProgress
              steps={STEPS}
              currentId={tab}
              onSelect={(id) => setTab(id as EditorTab)}
            />

            <div className="mt-6 space-y-5">
            {tab === 'dados' ? (
              <div className="space-y-5">
                <FormField
                  label="Nome completo"
                  required
                  error={touchedName ? nameError || undefined : undefined}
                >
                  <Input
                    value={resume.personal.fullName}
                    onChange={(e) => {
                      setTouchedName(true);
                      updateResume({ personal: { ...resume.personal, fullName: e.target.value } });
                    }}
                    onBlur={() => setTouchedName(true)}
                    placeholder="Nome completo"
                    className={cn(
                      touchedName && nameError && 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                    )}
                  />
                </FormField>
                <FormField label="Cargo / objetivo">
                  <Input
                    value={resume.personal.headline}
                    onChange={(e) => updateResume({ personal: { ...resume.personal, headline: e.target.value } })}
                    placeholder="Ex.: Analista de Marketing Digital"
                  />
                </FormField>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    label="E-mail"
                    error={emailInvalid ? 'E-mail inválido.' : undefined}
                    success={!emailInvalid && resume.personal.email ? 'E-mail válido.' : undefined}
                  >
                    <Input
                      type="email"
                      value={resume.personal.email}
                      onChange={(e) => updateResume({ personal: { ...resume.personal, email: e.target.value } })}
                      placeholder="voce@email.com"
                      className={cn(
                        emailInvalid && 'border-rose-400 focus:border-rose-500 focus:ring-rose-100',
                        !emailInvalid && resume.personal.email && 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100'
                      )}
                    />
                  </FormField>
                  <FormField label="Telefone" error={phoneInvalid ? 'Telefone inválido.' : undefined}>
                    <MaskedInput
                      format={formatPhone}
                      value={resume.personal.phone}
                      onValueChange={(masked) => updateResume({ personal: { ...resume.personal, phone: masked } })}
                      placeholder="(11) 99999-9999"
                      invalid={phoneInvalid}
                      valid={!phoneInvalid && resume.personal.phone.length > 0}
                    />
                  </FormField>
                </div>
                <FormField label="Cidade / Estado">
                  <Input
                    value={resume.personal.location}
                    onChange={(e) => updateResume({ personal: { ...resume.personal, location: e.target.value } })}
                    placeholder="São Paulo, SP"
                  />
                </FormField>
                <FormField
                  label="LinkedIn / site / portfólio"
                  error={
                    touchedWebsite && websiteInvalid
                      ? 'Informe um link válido (ex.: linkedin.com/in/seu-perfil).'
                      : undefined
                  }
                  hint={!resume.personal.website ? 'Opcional — use linkedin.com/in/…' : undefined}
                >
                  <Input
                    value={resume.personal.website}
                    onChange={(e) => {
                      setTouchedWebsite(true);
                      updateResume({ personal: { ...resume.personal, website: e.target.value } });
                    }}
                    onBlur={() => setTouchedWebsite(true)}
                    placeholder="linkedin.com/in/seu-perfil"
                    className={cn(
                      touchedWebsite &&
                        websiteInvalid &&
                        'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                    )}
                  />
                </FormField>
                <FormField label="Resumo profissional" hint="2 a 4 frases objetivas sobre você.">
                  <Textarea
                    value={resume.personal.summary}
                    onChange={(e) => updateResume({ personal: { ...resume.personal, summary: e.target.value } })}
                    placeholder="Resumo profissional ou objetivo"
                    rows={4}
                  />
                </FormField>
              </div>
            ) : null}

            {tab === 'experiencia' ? (
              <div className="space-y-4">
                <p className="text-xs leading-5 text-slate-500">
                  Adicione quantas experiências quiser. No preview, cada linha da descrição vira um bullet.
                </p>
                {resume.experiences.map((item, index) => (
                  <article key={item.id} className="space-y-2 rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Experiência {index + 1}
                      </p>
                      {resume.experiences.length > 1 ? (
                        <button
                          type="button"
                          className="text-xs font-semibold text-rose-600 hover:underline"
                          onClick={() =>
                            updateResume({
                              experiences: resume.experiences.filter((row) => row.id !== item.id)
                            })
                          }
                        >
                          Remover
                        </button>
                      ) : null}
                    </div>
                    <FormField label="Cargo">
                      <Input
                        value={item.role}
                        onChange={(e) => {
                          const experiences = [...resume.experiences];
                          experiences[index] = { ...item, role: e.target.value };
                          updateResume({ experiences });
                        }}
                        placeholder="Ex.: Analista de Marketing Pleno"
                      />
                    </FormField>
                    <FormField label="Empresa">
                      <Input
                        value={item.company}
                        onChange={(e) => {
                          const experiences = [...resume.experiences];
                          experiences[index] = { ...item, company: e.target.value };
                          updateResume({ experiences });
                        }}
                        placeholder="Nome da empresa"
                      />
                    </FormField>
                    <FormField label="Local">
                      <Input
                        value={item.location}
                        onChange={(e) => {
                          const experiences = [...resume.experiences];
                          experiences[index] = { ...item, location: e.target.value };
                          updateResume({ experiences });
                        }}
                        placeholder="Cidade ou Remoto"
                      />
                    </FormField>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <FormField label="Início">
                        <Input
                          value={item.startDate}
                          onChange={(e) => {
                            const experiences = [...resume.experiences];
                            experiences[index] = { ...item, startDate: e.target.value };
                            updateResume({ experiences });
                          }}
                          placeholder="MM/AAAA"
                        />
                      </FormField>
                      <FormField label="Fim">
                        <Input
                          value={item.current ? '' : item.endDate}
                          disabled={item.current}
                          onChange={(e) => {
                            const experiences = [...resume.experiences];
                            experiences[index] = { ...item, endDate: e.target.value, current: false };
                            updateResume({ experiences });
                          }}
                          placeholder="MM/AAAA"
                        />
                      </FormField>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={item.current}
                        onChange={(e) => {
                          const experiences = [...resume.experiences];
                          experiences[index] = {
                            ...item,
                            current: e.target.checked,
                            endDate: e.target.checked ? '' : item.endDate
                          };
                          updateResume({ experiences });
                        }}
                      />
                      Trabalho atual
                    </label>
                    <FormField
                      label="Descrição"
                      hint="Uma responsabilidade por linha. Vira lista no PDF."
                    >
                      <Textarea
                        value={item.description}
                        onChange={(e) => {
                          const experiences = [...resume.experiences];
                          experiences[index] = { ...item, description: e.target.value };
                          updateResume({ experiences });
                        }}
                        placeholder={'Ex.:\nGestão de campanhas Google Ads\nRelatórios mensais de ROI'}
                        rows={4}
                      />
                    </FormField>
                  </article>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => updateResume({ experiences: [...resume.experiences, createExperience()] })}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar experiência
                </Button>
              </div>
            ) : null}

            {tab === 'formacao' ? (
              <div className="space-y-4">
                {resume.education.map((item, index) => (
                  <article key={item.id} className="space-y-2 rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Formação {index + 1}
                      </p>
                      {resume.education.length > 1 ? (
                        <button
                          type="button"
                          className="text-xs font-semibold text-rose-600 hover:underline"
                          onClick={() =>
                            updateResume({
                              education: resume.education.filter((row) => row.id !== item.id)
                            })
                          }
                        >
                          Remover
                        </button>
                      ) : null}
                    </div>
                    <FormField label="Curso">
                      <Input
                        value={item.course}
                        onChange={(e) => {
                          const education = [...resume.education];
                          education[index] = { ...item, course: e.target.value };
                          updateResume({ education });
                        }}
                        placeholder="Ex.: Administração"
                      />
                    </FormField>
                    <FormField label="Nível">
                      <Select
                        value={item.level}
                        onChange={(e) => {
                          const education = [...resume.education];
                          education[index] = { ...item, level: e.target.value };
                          updateResume({ education });
                        }}
                      >
                        <option value="">Selecione</option>
                        <option value="Ensino Médio">Ensino Médio</option>
                        <option value="Técnico">Técnico</option>
                        <option value="Graduação">Graduação</option>
                        <option value="Pós-graduação">Pós-graduação</option>
                        <option value="MBA">MBA</option>
                        <option value="Mestrado">Mestrado</option>
                        <option value="Doutorado">Doutorado</option>
                      </Select>
                    </FormField>
                    <FormField label="Instituição">
                      <Input
                        value={item.institution}
                        onChange={(e) => {
                          const education = [...resume.education];
                          education[index] = { ...item, institution: e.target.value };
                          updateResume({ education });
                        }}
                        placeholder="Universidade / escola"
                      />
                    </FormField>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <FormField label="Início">
                        <Input
                          value={item.startDate}
                          onChange={(e) => {
                            const education = [...resume.education];
                            education[index] = { ...item, startDate: e.target.value };
                            updateResume({ education });
                          }}
                          placeholder="AAAA"
                        />
                      </FormField>
                      <FormField label="Conclusão">
                        <Input
                          value={item.endDate}
                          onChange={(e) => {
                            const education = [...resume.education];
                            education[index] = { ...item, endDate: e.target.value };
                            updateResume({ education });
                          }}
                          placeholder="AAAA ou Cursando"
                        />
                      </FormField>
                    </div>
                    <FormField label="Detalhes">
                      <Textarea
                        value={item.details}
                        onChange={(e) => {
                          const education = [...resume.education];
                          education[index] = { ...item, details: e.target.value };
                          updateResume({ education });
                        }}
                        placeholder="Ênfase, TCC, menção honrosa..."
                        rows={2}
                      />
                    </FormField>
                  </article>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => updateResume({ education: [...resume.education, createEducation()] })}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar formação
                </Button>
              </div>
            ) : null}

            {tab === 'cursos' ? (
              <div className="space-y-4">
                <p className="text-xs leading-5 text-slate-500">
                  Cursos livres, certificações e treinamentos relevantes.
                </p>
                {resume.courses.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-500">
                    Nenhum curso ainda.
                  </p>
                ) : null}
                {resume.courses.map((item, index) => (
                  <article key={item.id} className="space-y-2 rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Curso {index + 1}
                      </p>
                      <button
                        type="button"
                        className="text-xs font-semibold text-rose-600 hover:underline"
                        onClick={() =>
                          updateResume({
                            courses: resume.courses.filter((row) => row.id !== item.id)
                          })
                        }
                      >
                        Remover
                      </button>
                    </div>
                    <FormField label="Nome do curso">
                      <Input
                        value={item.name}
                        onChange={(e) => {
                          const courses = [...resume.courses];
                          courses[index] = { ...item, name: e.target.value };
                          updateResume({ courses });
                        }}
                        placeholder="Ex.: Google Ads Certification"
                      />
                    </FormField>
                    <FormField label="Instituição">
                      <Input
                        value={item.institution}
                        onChange={(e) => {
                          const courses = [...resume.courses];
                          courses[index] = { ...item, institution: e.target.value };
                          updateResume({ courses });
                        }}
                        placeholder="Escola / plataforma"
                      />
                    </FormField>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <FormField label="Ano">
                        <Input
                          value={item.year}
                          onChange={(e) => {
                            const courses = [...resume.courses];
                            courses[index] = { ...item, year: e.target.value };
                            updateResume({ courses });
                          }}
                          placeholder="2024"
                        />
                      </FormField>
                      <FormField label="Carga horária">
                        <Input
                          value={item.hours}
                          onChange={(e) => {
                            const courses = [...resume.courses];
                            courses[index] = { ...item, hours: e.target.value };
                            updateResume({ courses });
                          }}
                          placeholder="40h"
                        />
                      </FormField>
                    </div>
                    <FormField label="Descrição (opcional)">
                      <Textarea
                        value={item.description}
                        onChange={(e) => {
                          const courses = [...resume.courses];
                          courses[index] = { ...item, description: e.target.value };
                          updateResume({ courses });
                        }}
                        rows={2}
                        placeholder="O que você aprendeu ou o foco do curso"
                      />
                    </FormField>
                  </article>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => updateResume({ courses: [...resume.courses, createCourse()] })}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar curso
                </Button>
              </div>
            ) : null}

            {tab === 'extras' ? (
              <div className="space-y-5">
                <FormField
                  label="Habilidades"
                  hint="Separe por vírgula. Ex.: Excel, Python, Comunicação"
                >
                  <Textarea
                    value={skillsValue}
                    onChange={(e) => updateResume({ skills: splitCommaList(e.target.value) })}
                    placeholder="Excel, Python, Comunicação, Vendas"
                    rows={3}
                  />
                </FormField>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-700">Idiomas</p>
                  {resume.languages.length === 0 ? (
                    <p className="text-sm text-slate-500">Nenhum idioma cadastrado.</p>
                  ) : null}
                  {resume.languages.map((item, index) => (
                    <div key={item.id} className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 p-3">
                      <FormField label="Idioma" className="min-w-[140px] flex-1">
                        <Input
                          value={item.name}
                          onChange={(e) => {
                            const languages = [...resume.languages];
                            languages[index] = { ...item, name: e.target.value };
                            updateResume({ languages });
                          }}
                          placeholder="Inglês"
                        />
                      </FormField>
                      <FormField label="Nível" className="min-w-[150px]">
                        <Select
                          value={item.level}
                          onChange={(e) => {
                            const languages = [...resume.languages];
                            languages[index] = { ...item, level: e.target.value };
                            updateResume({ languages });
                          }}
                        >
                          {Object.entries(LANGUAGE_LEVEL_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-rose-600"
                        onClick={() =>
                          updateResume({
                            languages: resume.languages.filter((row) => row.id !== item.id)
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => updateResume({ languages: [...resume.languages, createLanguage()] })}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar idioma
                  </Button>
                </div>
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
                className="bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-400"
              >
                Baixar PDF
              </Button>
              {resumes.length > 1 ? (
                <Button type="button" variant="danger" icon={Trash2} onClick={handleDeleteResume}>
                  Excluir currículo
                </Button>
              ) : null}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-100 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                Pré-visualização
              </h2>
              <span className="text-xs font-medium text-slate-500">A4 · margem 15mm</span>
            </div>
            <div className="overflow-auto rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
              <div ref={previewRef} className="mx-auto w-full max-w-[210mm]">
                <ResumePreview data={resume} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </AuthGate>
  );
}
