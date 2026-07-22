'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  Building2,
  Download,
  Droplets,
  Eraser,
  FilePlus2,
  ImagePlus,
  Layers,
  Loader2,
  PackagePlus,
  PenLine,
  Save,
  Sparkles,
  Trash2,
  UserRound
} from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { PropostaPreview } from '@/components/propostas/proposta-preview';
import { AddressFields } from '@/components/shared/address-fields';
import { DigitalSignatureDisplay } from '@/components/shared/digital-signature-display';
import { DocumentStickyActions } from '@/components/shared/document-sticky-actions';
import { SignatureStyleModal } from '@/components/shared/signature-style-modal';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { performBillableAction } from '@/lib/billing';
import { RemoveBrandingUpsell } from '@/components/billing/remove-branding-upsell';
import { DocumentExportShell } from '@/components/brand/document-export-shell';
import { ViralPdfShareModal, useViralPdfShare } from '@/components/marketing/viral-pdf-share';
import { exportElementToPdf } from '@/lib/curriculo/pdf';
import {
  formatCpfCnpj,
  formatCurrency,
  formatCurrencyInput,
  formatPhone,
  parseCurrency
} from '@/lib/formatters';
import { createEmptyProposal, createProposalItem, SAMPLE_PROPOSAL } from '@/lib/propostas/defaults';
import { deleteProposal, listProposals, saveProposal } from '@/lib/propostas/storage';
import { PROPOSAL_TEMPLATES } from '@/lib/propostas/templates';
import type { ProposalCompany, ProposalData, ProposalItem } from '@/lib/propostas/types';
import type { DigitalSignature } from '@/lib/signatures/types';
import { cn } from '@/lib/utils';

type EditorTab = 'empresa' | 'cliente' | 'itens' | 'condicoes';

const tabs: { id: EditorTab; label: string }[] = [
  { id: 'empresa', label: 'Sua empresa' },
  { id: 'cliente', label: 'Cliente' },
  { id: 'itens', label: 'Produtos e serviços' },
  { id: 'condicoes', label: 'Condições' }
];

async function optimizeLogo(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Selecione uma imagem válida.');
  if (file.size > 2 * 1024 * 1024) throw new Error('A imagem deve ter no máximo 2 MB.');

  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error('Não foi possível processar a imagem.'));
    element.src = source;
  });

  const maxSize = 600;
  const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Não foi possível processar a imagem.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png', 0.9);
}

export function PropostasApp() {
  const previewRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { refresh: refreshAuth, usage } = useAuth();
  const brandDocuments = !usage.unlimited;
  const { afterPdfExport, viralShareOpen, viralShareLabel, closeViralShare } = useViralPdfShare();
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [proposal, setProposal] = useState<ProposalData>(createEmptyProposal());
  const [tab, setTab] = useState<EditorTab>('empresa');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [exporting, setExporting] = useState(false);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [logoError, setLogoError] = useState('');

  useEffect(() => {
    const stored = listProposals();
    if (stored.length > 0) {
      setProposals(stored);
      setActiveId(stored[0].id);
      setProposal(stored[0]);
      return;
    }
    const saved = saveProposal(createEmptyProposal());
    setProposals([saved]);
    setActiveId(saved.id);
    setProposal(saved);
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const timeout = window.setTimeout(() => {
      setSaveState('saving');
      saveProposal(proposal);
      setProposals(listProposals());
      setSaveState('saved');
      window.setTimeout(() => setSaveState('idle'), 1200);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [proposal, activeId]);

  const subtotal = proposal.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = subtotal * Math.min(Math.max(proposal.discountPercent, 0), 100) / 100;
  const total = subtotal - discount + proposal.shipping;
  const templateId = proposal.templateId ?? 'corporativa';
  const showCompanyAddress = templateId !== 'executiva';
  const showFullClientBlock = templateId === 'corporativa';
  const titleAppearsOnPdf = templateId === 'criativa';

  function updateProposal(patch: Partial<ProposalData>) {
    setProposal((current) => ({ ...current, ...patch }));
  }

  function updateCompany(patch: Partial<ProposalCompany>) {
    setProposal((current) => {
      const company = { ...current.company, ...patch };
      const shouldSyncSignature = !current.signature.text.trim() || current.signature.text === current.company.name;
      return {
        ...current,
        company,
        signature: shouldSyncSignature ? { ...current.signature, text: company.name } : current.signature
      };
    });
  }

  function updateClient(patch: Partial<ProposalData['client']>) {
    setProposal((current) => ({ ...current, client: { ...current.client, ...patch } }));
  }

  function updateItem(itemId: string, patch: Partial<ProposalItem>) {
    setProposal((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item))
    }));
  }

  function addItem() {
    updateProposal({ items: [...proposal.items, createProposalItem()] });
  }

  function removeItem(itemId: string) {
    if (proposal.items.length === 1) {
      updateProposal({ items: [createProposalItem()] });
      return;
    }
    updateProposal({ items: proposal.items.filter((item) => item.id !== itemId) });
  }

  function handleSelect(proposalId: string) {
    const selected = proposals.find((item) => item.id === proposalId);
    if (!selected) return;
    setActiveId(selected.id);
    setProposal(selected);
  }

  function handleNew() {
    const created = createEmptyProposal(proposal.templateId);
    created.company = { ...proposal.company };
    created.signature = { ...proposal.signature, text: proposal.signature.text || proposal.company.name };
    const saved = saveProposal(created);
    setProposals(listProposals());
    setActiveId(saved.id);
    setProposal(saved);
    setTab('empresa');
  }

  function handleLoadSample() {
    const sample = saveProposal({
      ...SAMPLE_PROPOSAL,
      id: proposal.id,
      number: proposal.number,
      updatedAt: new Date().toISOString()
    });
    setProposal(sample);
    setProposals(listProposals());
  }

  function handleClearForm() {
    const blank = createEmptyProposal(proposal.templateId);
    const cleared = saveProposal({
      ...blank,
      id: proposal.id,
      number: proposal.number,
      title: 'Nova proposta',
      updatedAt: new Date().toISOString()
    });
    setProposal(cleared);
    setProposals(listProposals());
    setError('');
    setLogoError('');
  }

  function handleDelete() {
    if (proposals.length <= 1) return;
    deleteProposal(proposal.id);
    const next = listProposals();
    setProposals(next);
    setActiveId(next[0].id);
    setProposal(next[0]);
  }

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setLogoError('');
    try {
      const logoDataUrl = await optimizeLogo(file);
      updateCompany({ logoDataUrl });
    } catch (logoIssue) {
      setLogoError(logoIssue instanceof Error ? logoIssue.message : 'Não foi possível carregar o logo.');
    }
  }

  async function handleManualSave() {
    setError('');
    setSaveState('saving');
    try {
      const outcome = await performBillableAction(
        { toolId: 'propostas', artifactId: proposal.id, action: 'manual_save' },
        () => saveProposal(proposal)
      );
      if (!outcome.allowed) {
        setError(outcome.reason || 'Seu saldo não permite salvar agora.');
        return;
      }
      setProposals(listProposals());
      refreshAuth();
      setSaveState('saved');
    } catch {
      setError('Não foi possível salvar a proposta.');
    } finally {
      window.setTimeout(() => setSaveState('idle'), 1200);
    }
  }

  async function handleExportPdf() {
    setError('');
    if (!previewRef.current) return;
    try {
      setExporting(true);
      const safeName = (proposal.client.name || proposal.number || 'proposta').replace(/[^\w\-]+/g, '_');
      const outcome = await performBillableAction(
        { toolId: 'propostas', artifactId: proposal.id, action: 'download' },
        () => exportElementToPdf(previewRef.current!, `Proposta_${safeName}.pdf`, { branded: brandDocuments })
      );
      if (!outcome.allowed) {
        setError(outcome.reason || 'Não foi possível exportar o PDF.');
        return;
      }
      refreshAuth();
      afterPdfExport('proposta');
    } catch {
      setError('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setExporting(false);
    }
  }

  function handleApplySignature(signature: DigitalSignature) {
    updateProposal({ signature });
  }

  return (
    <AuthGate
      title="Propostas exigem cadastro"
      description="Crie sua conta gratuita para montar, salvar e baixar propostas comerciais profissionais."
    >
      <ViralPdfShareModal open={viralShareOpen} onClose={closeViralShare} docLabel={viralShareLabel} />
      <div className="space-y-5">
        <RemoveBrandingUpsell />
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700">
                <Building2 className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Propostas Comerciais</h1>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  Editor inspirado no fluxo do Aero Suite, adaptado para logo opcional e produtos cadastrados manualmente.
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
                {proposals.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} · {item.number}
                  </option>
                ))}
              </Select>
              <Input
                value={proposal.title}
                onChange={(event) => updateProposal({ title: event.target.value })}
                placeholder={titleAppearsOnPdf ? 'Título da proposta (aparece no PDF)' : 'Nome interno (só na lista)'}
                className="min-w-[240px]"
                title={titleAppearsOnPdf ? 'Aparece como título no modelo Criativa' : 'Identificação na lista (não aparece no PDF)'}
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
          <Button type="button" size="sm" onClick={handleExportPdf} disabled={exporting} className="bg-emerald-600 hover:bg-emerald-700">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Baixar PDF
          </Button>
        </DocumentStickyActions>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Modelos de proposta</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Três layouts inspirados em propostas reais de mercado. Escolha o que combina com o seu cliente.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {PROPOSAL_TEMPLATES.map((template) => {
              const active = proposal.templateId === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => updateProposal({ templateId: template.id })}
                  className={cn(
                    'rounded-2xl border p-4 text-left transition-all',
                    active ? 'border-sky-600 bg-sky-50 shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-sky-300'
                  )}
                >
                  <div className={cn('mb-3 h-16 rounded-xl bg-gradient-to-br', template.previewClass)} />
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{template.name}</p>
                    {template.recommended ? (
                      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-700">
                        Popular
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{template.description}</p>
                  <p className="mt-2 text-[10px] italic text-slate-500">{template.inspiration}</p>
                </button>
              );
            })}
          </div>

          <div
            className={cn(
              'mt-5 flex flex-col gap-3 rounded-2xl border-2 border-dashed p-4 transition-colors sm:flex-row sm:items-center sm:justify-between',
              proposal.inkSaver ? 'border-slate-800 bg-slate-50' : 'border-amber-300 bg-amber-50/60'
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
                  proposal.inkSaver ? 'bg-slate-900 text-white' : 'bg-amber-100 text-amber-700'
                )}
              >
                <Droplets className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">Economizar tinta na impressão</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-600">
                  Remove os fundos coloridos e usa fundo branco com texto escuro, mantendo o contraste legível. Ex.: na
                  Criativa, a barra lateral azul-marinho vira branca com contorno preto.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={proposal.inkSaver}
              onClick={() => updateProposal({ inkSaver: !proposal.inkSaver })}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                proposal.inkSaver
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-amber-400 bg-white text-amber-800 hover:bg-amber-50'
              )}
            >
              <span
                className={cn(
                  'relative h-5 w-9 rounded-full transition-colors',
                  proposal.inkSaver ? 'bg-white/30' : 'bg-amber-200'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
                    proposal.inkSaver ? 'left-[1.125rem]' : 'left-0.5'
                  )}
                />
              </span>
              {proposal.inkSaver ? 'Ativado' : 'Ativar'}
            </button>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[500px_1fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap gap-2">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                    tab === item.id ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  )}
                >
                  {item.label}
                  {item.id === 'itens' ? ` (${proposal.items.length})` : ''}
                </button>
              ))}
            </div>

            {tab === 'empresa' ? (
              <div className="space-y-4">
                <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/60 p-4">
                  <div className="flex items-center gap-4">
                    {proposal.company.logoDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={proposal.company.logoDataUrl} alt="Logo carregado" className="h-16 w-24 rounded-lg bg-white object-contain p-1" />
                    ) : (
                      <span className="grid h-16 w-16 place-items-center rounded-xl bg-white text-sky-700 shadow-sm">
                        <ImagePlus className="h-7 w-7" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">Logo opcional</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        PNG, JPG ou WebP até 2 MB. Sem logo, o cabeçalho usa o seu nome ou o nome da empresa.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => logoInputRef.current?.click()}>
                          <ImagePlus className="h-4 w-4" />
                          {proposal.company.logoDataUrl ? 'Trocar logo' : 'Subir logo'}
                        </Button>
                        {proposal.company.logoDataUrl ? (
                          <Button type="button" size="sm" variant="danger" onClick={() => updateCompany({ logoDataUrl: '' })}>
                            Remover
                          </Button>
                        ) : null}
                      </div>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </div>
                  </div>
                  {logoError ? <p className="mt-2 text-xs font-medium text-red-600">{logoError}</p> : null}
                </div>

                <FormField label="Seu nome ou nome da empresa" required hint="Será usado no cabeçalho quando não houver logo.">
                  <Input
                    value={proposal.company.name}
                    onChange={(event) => updateCompany({ name: event.target.value })}
                    placeholder="Ex.: Ana Lima Design"
                  />
                </FormField>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="CPF / CNPJ">
                    <MaskedInput
                      format={formatCpfCnpj}
                      value={proposal.company.document}
                      onValueChange={(document) => updateCompany({ document })}
                      placeholder="000.000.000-00"
                    />
                  </FormField>
                  <FormField label="Telefone">
                    <MaskedInput
                      format={formatPhone}
                      value={proposal.company.phone}
                      onValueChange={(phone) => updateCompany({ phone })}
                      placeholder="(11) 99999-9999"
                    />
                  </FormField>
                </div>
                <FormField label="E-mail">
                  <Input
                    type="email"
                    value={proposal.company.email}
                    onChange={(event) => updateCompany({ email: event.target.value })}
                    placeholder="contato@empresa.com.br"
                  />
                </FormField>
                {showCompanyAddress ? (
                  <div className="border-t border-slate-100 pt-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Endereço do emitente</p>
                    <AddressFields
                      value={proposal.company.address}
                      onChange={(address) => updateCompany({ address })}
                      idPrefix="proposta-empresa"
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            {tab === 'cliente' ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <UserRound className="mt-0.5 h-5 w-5 text-sky-700" />
                  <p className="text-sm leading-6 text-slate-600">
                    Os dados são preenchidos diretamente nesta proposta, sem busca em banco de clientes.
                  </p>
                </div>
                <FormField label="Nome / Razão social" required>
                  <Input
                    value={proposal.client.name}
                    onChange={(event) => updateClient({ name: event.target.value })}
                    placeholder="Cliente que receberá a proposta"
                  />
                </FormField>
                {showFullClientBlock ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <FormField label="CPF / CNPJ">
                        <MaskedInput
                          format={formatCpfCnpj}
                          value={proposal.client.document}
                          onValueChange={(document) => updateClient({ document })}
                          placeholder="00.000.000/0000-00"
                        />
                      </FormField>
                      <FormField label="Pessoa de contato">
                        <Input
                          value={proposal.client.contact}
                          onChange={(event) => updateClient({ contact: event.target.value })}
                          placeholder="Nome do responsável"
                        />
                      </FormField>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <FormField label="E-mail">
                        <Input
                          type="email"
                          value={proposal.client.email}
                          onChange={(event) => updateClient({ email: event.target.value })}
                          placeholder="cliente@email.com"
                        />
                      </FormField>
                      <FormField label="Telefone">
                        <MaskedInput
                          format={formatPhone}
                          value={proposal.client.phone}
                          onValueChange={(phone) => updateClient({ phone })}
                          placeholder="(11) 99999-9999"
                        />
                      </FormField>
                    </div>
                    <div className="border-t border-slate-100 pt-4">
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Endereço do cliente</p>
                      <AddressFields
                        value={proposal.client.address}
                        onChange={(address) => updateClient({ address })}
                        idPrefix="proposta-cliente"
                      />
                    </div>
                  </>
                ) : (
                  <FormField label="Pessoa de contato">
                    <Input
                      value={proposal.client.contact}
                      onChange={(event) => updateClient({ contact: event.target.value })}
                      placeholder="Nome do responsável"
                    />
                  </FormField>
                )}
              </div>
            ) : null}

            {tab === 'itens' ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                  <div className="flex items-start gap-3">
                    <PackagePlus className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
                    <div>
                      <p className="font-semibold text-slate-900">Cadastro manual de itens</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Digite livremente o produto ou serviço, descrição, quantidade e valor. Não há busca em catálogo ou banco.
                      </p>
                    </div>
                  </div>
                </div>

                {proposal.items.map((item, index) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">Item {index + 1}</p>
                      <Button type="button" size="sm" variant="danger" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                        Remover
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <FormField label="Produto ou serviço" required>
                        <Input
                          value={item.name}
                          onChange={(event) => updateItem(item.id, { name: event.target.value })}
                          placeholder="Ex.: Consultoria, manutenção, produto..."
                        />
                      </FormField>
                      <FormField label="Descrição">
                        <Textarea
                          value={item.description}
                          onChange={(event) => updateItem(item.id, { description: event.target.value })}
                          placeholder="Detalhes, escopo, especificações ou entregáveis"
                          rows={2}
                        />
                      </FormField>
                      <div className="grid grid-cols-[90px_1fr_1fr] gap-3">
                        <FormField label="Qtd.">
                          <Input
                            type="number"
                            min={0.01}
                            step="any"
                            value={item.quantity}
                            onChange={(event) => updateItem(item.id, { quantity: Math.max(Number(event.target.value) || 0, 0) })}
                          />
                        </FormField>
                        <FormField label="Valor unitário">
                          <MaskedInput
                            format={formatCurrencyInput}
                            value={item.unitPriceInput}
                            onValueChange={(unitPriceInput) =>
                              updateItem(item.id, { unitPriceInput, unitPrice: parseCurrency(unitPriceInput) })
                            }
                            placeholder="R$ 0,00"
                          />
                        </FormField>
                        <FormField label="Total">
                          <Input value={formatCurrency(item.quantity * item.unitPrice)} readOnly className="bg-white font-semibold" />
                        </FormField>
                      </div>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addItem} className="w-full border-dashed">
                  <PackagePlus className="h-4 w-4" />
                  Adicionar produto ou serviço
                </Button>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormField label="Desconto (%)">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={proposal.discountPercent}
                        onChange={(event) =>
                          updateProposal({ discountPercent: Math.min(Math.max(Number(event.target.value) || 0, 0), 100) })
                        }
                      />
                    </FormField>
                    <FormField label="Frete / custo adicional">
                      <MaskedInput
                        format={formatCurrencyInput}
                        value={proposal.shippingInput}
                        onValueChange={(shippingInput) =>
                          updateProposal({ shippingInput, shipping: parseCurrency(shippingInput) })
                        }
                        placeholder="R$ 0,00"
                      />
                    </FormField>
                  </div>
                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
                    <div className="flex justify-between"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
                    {discount > 0 ? <div className="flex justify-between text-rose-700"><span>Desconto</span><strong>- {formatCurrency(discount)}</strong></div> : null}
                    {proposal.shipping > 0 ? <div className="flex justify-between"><span>Frete/adicional</span><strong>{formatCurrency(proposal.shipping)}</strong></div> : null}
                    <div className="flex justify-between border-t border-slate-200 pt-2 text-base text-sky-700"><strong>Total</strong><strong>{formatCurrency(total)}</strong></div>
                  </div>
                </div>
              </div>
            ) : null}

            {tab === 'condicoes' ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Número da proposta">
                    <Input value={proposal.number} onChange={(event) => updateProposal({ number: event.target.value })} />
                  </FormField>
                  <FormField label="Status" hint="Controle interno (não aparece no PDF).">
                    <Select
                      value={proposal.status}
                      onChange={(event) => updateProposal({ status: event.target.value as ProposalData['status'] })}
                      className="w-full"
                    >
                      <option value="rascunho">Rascunho</option>
                      <option value="enviada">Enviada</option>
                      <option value="aprovada">Aprovada</option>
                    </Select>
                  </FormField>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Data de emissão">
                    <Input
                      type="date"
                      value={proposal.issueDate}
                      onChange={(event) => updateProposal({ issueDate: event.target.value })}
                    />
                  </FormField>
                  <FormField label="Validade (dias)">
                    <Input
                      type="number"
                      min={1}
                      value={proposal.validityDays}
                      onChange={(event) => updateProposal({ validityDays: Math.max(Number(event.target.value) || 1, 1) })}
                    />
                  </FormField>
                </div>
                <FormField label="Apresentação">
                  <Textarea
                    value={proposal.introduction}
                    onChange={(event) => updateProposal({ introduction: event.target.value })}
                    rows={3}
                  />
                </FormField>
                <FormField label="Condições de pagamento">
                  <Textarea
                    value={proposal.paymentTerms}
                    onChange={(event) => updateProposal({ paymentTerms: event.target.value })}
                    rows={2}
                  />
                </FormField>
                <FormField label="Prazo / condições de entrega">
                  <Textarea
                    value={proposal.deliveryTerms}
                    onChange={(event) => updateProposal({ deliveryTerms: event.target.value })}
                    rows={2}
                  />
                </FormField>
                <FormField label="Observações">
                  <Textarea
                    value={proposal.notes}
                    onChange={(event) => updateProposal({ notes: event.target.value })}
                    rows={3}
                  />
                </FormField>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">Assinatura da proposta</p>
                      <p className="mt-1 text-xs text-slate-600">Use o mesmo seletor de estilos disponível nos recibos.</p>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={() => setSignatureModalOpen(true)}>
                      <PenLine className="h-4 w-4" />
                      Personalizar
                    </Button>
                  </div>
                  <div className="mt-4 rounded-xl bg-white p-5">
                    <DigitalSignatureDisplay
                      signature={{
                        ...proposal.signature,
                        text: proposal.signature.text.trim() || proposal.company.name
                      }}
                      subtitle={proposal.company.name || 'Responsável pela proposta'}
                      size="md"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <Button variant="outline" onClick={handleManualSave} disabled={saveState === 'saving'}>
                <Save className="h-4 w-4" />
                Salvar agora
              </Button>
              {proposals.length > 1 ? (
                <Button variant="danger" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              ) : null}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-100 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Pré-visualização</h2>
              <span className="text-xs font-medium text-slate-500">A4 · atualiza em tempo real</span>
            </div>
            <div className="overflow-auto rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
              <div ref={previewRef} className="mx-auto w-full max-w-[210mm]">
                <DocumentExportShell branded={brandDocuments}>
                  <PropostaPreview data={proposal} />
                </DocumentExportShell>
              </div>
            </div>
          </div>
        </section>
      </div>

      <SignatureStyleModal
        open={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        value={proposal.signature}
        defaultName={proposal.company.name}
        onApply={handleApplySignature}
      />
    </AuthGate>
  );
}

