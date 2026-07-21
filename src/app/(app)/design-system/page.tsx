'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  CheckCircle2,
  CircleHelp,
  FileText,
  Loader2,
  Save,
  Trash2
} from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { PageHero } from '@/components/shared/page-hero';
import { Button } from '@/components/ui/button';
import { FormField, fieldStateClass } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { ProgressBanner } from '@/components/ui/progress-banner';
import { SkeletonCard, SkeletonDocumentPreview } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

function Section({
  id,
  title,
  description,
  children
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[var(--rj-section-scroll-mt)] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="rj-display text-xl font-bold text-slate-900">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-600">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function isCpfShape(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits.length === 0 || digits.length === 11;
}

export default function DesignSystemPage() {
  const { toast } = useToast();
  const [cpf, setCpf] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [deletedDemo, setDeletedDemo] = useState(false);

  const cpfError = useMemo(() => {
    if (!cpf.trim()) return undefined;
    return isCpfShape(cpf) ? undefined : 'CPF inválido — use 11 dígitos.';
  }, [cpf]);

  async function simulateSave() {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSaving(false);
    toast('Contrato salvo com sucesso!');
  }

  async function simulatePdf() {
    setProgress(8);
    for (const step of [28, 52, 74, 91, 100]) {
      await new Promise((resolve) => setTimeout(resolve, 280));
      setProgress(step);
    }
    toast('PDF gerado com sucesso!');
    setTimeout(() => setProgress(null), 600);
  }

  function simulateDelete() {
    setDeletedDemo(true);
    toast('Item excluído.', {
      undoLabel: 'Desfazer',
      onUndo: () => {
        setDeletedDemo(false);
        toast('Exclusão desfeita.');
      }
    });
  }

  return (
    <AuthGate
      title="Guia de componentes"
      description="Entre para ver o guia interativo de UI do Resolva Jato."
      enforceUsageLimit={false}
    >
    <div className="space-y-5 pb-10">
      <PageHero
        title="Guia de componentes"
        subtitle="Padrões interativos do Resolva Jato — botões, formulários, modais, tooltips e feedback."
        icon={FileText}
      />

      <nav
        className="sticky top-[var(--rj-chrome-top)] z-30 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur"
        aria-label="Seções do guia"
      >
        {[
          ['botoes', 'Botões'],
          ['forms', 'Formulários'],
          ['modais', 'Modais'],
          ['tooltips', 'Tooltips'],
          ['loading', 'Carregamento'],
          ['feedback', 'Feedback']
        ].map(([href, label]) => (
          <a
            key={href}
            href={`#${href}`}
            className="rj-press h-10 shrink-0 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {label}
          </a>
        ))}
      </nav>

      <Section
        id="botoes"
        title="Botões"
        description="Estados normal, hover, clicado e desabilitado. Ícone à esquerda reforça a ação; loading bloqueia o clique."
      >
        <div className="flex flex-wrap gap-3">
          <Button icon={Save} onClick={simulateSave} loading={saving}>
            {saving ? 'Salvando…' : 'Salvar contrato'}
          </Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="outline" icon={FileText}>
            Outline
          </Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger" icon={Trash2}>
            Excluir
          </Button>
          <Button disabled>Desabilitado</Button>
          <Button size="lg" icon={CheckCircle2}>
            Grande (mobile)
          </Button>
        </div>
      </Section>

      <Section
        id="forms"
        title="Formulários"
        description="Campos com borda arredondada, sombra leve, ajuda abaixo e validação em tempo real."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="CPF"
            htmlFor="ds-cpf"
            required
            hint="Digite só números; a validação é imediata."
            error={cpfError}
            state={cpfError ? 'error' : cpf.replace(/\D/g, '').length === 11 ? 'valid' : 'idle'}
            success={!cpfError && cpf.replace(/\D/g, '').length === 11 ? 'CPF com formato ok' : undefined}
          >
            <Input
              id="ds-cpf"
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              value={cpf}
              invalid={Boolean(cpfError)}
              className={fieldStateClass(cpfError ? 'error' : cpf.replace(/\D/g, '').length === 11 ? 'valid' : 'idle')}
              onChange={(event) => setCpf(event.target.value)}
            />
          </FormField>
          <FormField label="E-mail" htmlFor="ds-email" hint="Usado só para contato do documento.">
            <Input id="ds-email" type="email" inputMode="email" placeholder="voce@email.com" />
          </FormField>
          <FormField label="Observações" htmlFor="ds-obs" className="sm:col-span-2" hint="Opcional — aparece no rodapé do PDF.">
            <Textarea id="ds-obs" placeholder="Ex.: pagamento em até 7 dias úteis…" rows={4} />
          </FormField>
        </div>
      </Section>

      <Section
        id="modais"
        title="Modais"
        description="Fundo escuro semi-transparente, fechar sempre visível, título + descrição + ação principal."
      >
        <Button onClick={() => setModalOpen(true)}>Abrir modal de exemplo</Button>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Confirmar envio"
          description="O cliente receberá o link do contrato por WhatsApp."
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                icon={CheckCircle2}
                onClick={() => {
                  setModalOpen(false);
                  toast('Contrato enviado com sucesso!');
                }}
              >
                Confirmar envio
              </Button>
            </>
          }
        >
          <p className="text-sm font-medium leading-6 text-slate-600">
            Revise os dados antes de enviar. Você poderá gerar um novo link depois, se precisar.
          </p>
        </Modal>
      </Section>

      <Section
        id="tooltips"
        title="Tooltips"
        description="Texto curto ao passar o mouse ou focar. Fundo escuro e texto branco para contraste."
      >
        <div className="flex flex-wrap items-center gap-4">
          <Tooltip label="Comodato: empréstimo gratuito de um bem, com devolução combinada.">
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm"
            >
              <CircleHelp className="h-4 w-4 text-slate-500" aria-hidden />
              Comodato
            </button>
          </Tooltip>
          <Tooltip label="Substabelecimento: transferir poderes de uma procuração a outro advogado.">
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm"
            >
              <CircleHelp className="h-4 w-4 text-slate-500" aria-hidden />
              Substabelecimento
            </button>
          </Tooltip>
        </div>
      </Section>

      <Section
        id="loading"
        title="Carregamento"
        description="Skeletons para prévias e cards; barra de progresso para ações demoradas."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" icon={Loader2} onClick={simulatePdf}>
              Simular “Gerando PDF…”
            </Button>
          </div>
          {progress !== null ? <ProgressBanner label="Gerando PDF…" value={progress} /> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <SkeletonCard />
            <SkeletonDocumentPreview />
          </div>
        </div>
      </Section>

      <Section
        id="feedback"
        title="Feedback e desfazer"
        description="Confirmações curtas e positivas. Exclusões recentes podem ser desfeitas pelo toast."
      >
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => toast('Documento salvo com sucesso!')}
          >
            Toast de sucesso
          </Button>
          <Button variant="danger" icon={Trash2} onClick={simulateDelete}>
            Excluir (com desfazer)
          </Button>
        </div>
        <p
          className={cn(
            'mt-4 rounded-xl border px-4 py-3 text-sm font-semibold',
            deletedDemo
              ? 'border-rose-200 bg-rose-50 text-rose-900'
              : 'border-emerald-200 bg-emerald-50 text-emerald-900'
          )}
        >
          {deletedDemo ? 'Demo: item marcado como excluído.' : 'Demo: item disponível na lista.'}
        </p>
      </Section>
    </div>
    </AuthGate>
  );
}
