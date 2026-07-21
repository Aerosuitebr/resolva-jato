import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calculator,
  CalendarClock,
  Check,
  ClipboardList,
  FileText,
  Gavel,
  GraduationCap,
  Receipt,
  Scale,
  Search,
  Wallet
} from 'lucide-react';
import { AuthAwareLink } from '@/components/auth/auth-aware-link';
import { Logo } from '@/components/brand/logo';
import { PromoVideoPlayer } from '@/components/marketing/promo-video-section';
import { TestimonialsSection } from '@/components/marketing/testimonials-section';
import { TrustSeals } from '@/components/marketing/trust-seals';
import { ToolsWatermark } from '@/components/brand/tools-watermark';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const primaryCtaClass =
  'h-12 bg-amber-400 px-6 text-base font-bold text-slate-950 hover:bg-amber-300';

function FeatureChecks({
  items,
  iconClass = 'text-sky-600',
  textClass = 'text-slate-700'
}: {
  items: string[];
  iconClass?: string;
  textClass?: string;
}) {
  return (
    <ul className="mt-5 space-y-2.5">
      {items.map((item) => (
        <li key={item} className={cn('flex items-start gap-3 text-sm leading-6', textClass)}>
          <Check className={cn('mt-0.5 h-4 w-4 shrink-0', iconClass)} />
          {item}
        </li>
      ))}
    </ul>
  );
}

function CurriculoMock() {
  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-800 shadow-2xl shadow-slate-950/40">
      <div className="bg-slate-900 px-5 py-4 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">Currículo profissional</p>
        <p className="mt-1 text-lg font-bold">Ana Ribeiro</p>
        <p className="text-xs text-slate-300">Design de produto · São Paulo</p>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">Resumo</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Experiência em interfaces, pesquisa com usuários e entrega de produtos digitais.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 px-3 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Experiência</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">4 anos</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Modelos</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">3 layouts</p>
          </div>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div className="h-2 w-4/5 rounded-full bg-sky-500" />
        </div>
      </div>
    </div>
  );
}

function PropostaMock() {
  return (
    <div className="relative mx-auto flex w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl shadow-slate-900/15">
      <aside className="hidden w-28 shrink-0 bg-slate-900 p-4 text-white sm:block">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Proposta</p>
        <p className="mt-3 text-sm font-bold leading-tight">Studio Norte</p>
        <p className="mt-auto pt-10 text-[10px] text-slate-400">PROP-2026</p>
      </aside>
      <div className="min-w-0 flex-1 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-700">Proposta comercial</p>
        <p className="mt-2 text-xl font-bold text-slate-900">Identidade visual completa</p>
        <p className="mt-1 text-sm text-slate-600">Para Mercado Central Ltda</p>
        <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Investimento</p>
          <p className="mt-1 text-2xl font-black text-slate-900">R$ 3.145,00</p>
        </div>
        <div className="mt-4 space-y-2">
          {['Criação de marca', 'Kit redes sociais'].map((item) => (
            <div key={item} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
              <span className="font-medium text-slate-800">{item}</span>
              <span className="text-slate-500">incluso</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContratoMock() {
  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-800 shadow-2xl shadow-slate-950/40">
      <div className="h-1.5 bg-gradient-to-r from-slate-900 to-sky-700" />
      <div className="px-5 py-5">
        <p className="text-center text-[9px] font-bold uppercase tracking-[0.28em] text-slate-400">
          Instrumento particular
        </p>
        <p className="mt-2 text-center text-sm font-bold tracking-wide text-slate-950">
          CONTRATO DE PRESTAÇÃO DE SERVIÇOS
        </p>
        <div className="mt-4 space-y-3 text-[11px] leading-5 text-slate-600">
          <p>
            <span className="font-bold text-slate-900">CLÁUSULA 1ª · DO OBJETO</span>
            <br />
            Prestação de serviços de design e identidade visual conforme escopo acordado.
          </p>
          <p>
            <span className="font-bold text-slate-900">CLÁUSULA 2ª · DO PREÇO</span>
            <br />
            Valor de R$ 4.800,00, pago em duas parcelas.
          </p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-center text-[10px]">
          <div>
            <div className="mx-auto mb-1 h-px w-16 bg-slate-400" />
            Contratante
          </div>
          <div>
            <div className="mx-auto mb-1 h-px w-16 bg-slate-400" />
            Contratado
          </div>
        </div>
      </div>
    </div>
  );
}

function ReciboMock() {
  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-800 shadow-2xl shadow-slate-950/40">
      <div className="p-5">
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-700 p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/70">Recibo de pagamento</p>
              <p className="mt-1 text-2xl font-bold">R$ 1.250,00</p>
            </div>
            <div className="text-right text-xs">
              <p className="font-semibold">Nº 0042</p>
              <p className="text-white/80">21 jul 2026</p>
            </div>
          </div>
        </div>
        <div className="mt-5 space-y-3 text-[12px] leading-6 text-slate-600">
          <p>
            Recebi de <strong className="text-slate-900">Marina Duarte Consultoria</strong> a importância de{' '}
            <strong className="text-slate-900">R$ 1.250,00</strong> (
            <span className="italic">um mil, duzentos e cinquenta reais</span>), referente a{' '}
            <strong>serviços de manutenção elétrica</strong>.
          </p>
          <p>
            Forma de pagamento <strong className="text-slate-800">Pix</strong>
          </p>
        </div>
        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-[10px]">
          <div className="mx-auto mb-1 h-px w-24 bg-slate-400" />
          Assinatura de quem recebeu
        </div>
      </div>
    </div>
  );
}

function LattesMock() {
  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-800 shadow-2xl shadow-slate-950/40">
      <div className="bg-slate-900 px-5 py-4 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">Lattes Inteligente</p>
        <p className="mt-1 text-lg font-bold">Prof. Dr. Rafael Nogueira</p>
        <p className="text-xs text-slate-300">Ciência da Computação · UFMG</p>
      </div>
      <div className="space-y-3 p-5 text-[12px]">
        {[
          ['Formação acadêmica', 'Doutorado, Mestrado, Graduação'],
          ['Produção bibliográfica', '18 artigos · 4 capítulos de livro'],
          ['Projetos de pesquisa', '3 projetos financiados (CNPq)']
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-slate-50 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-0.5 font-semibold text-slate-900">{value}</p>
          </div>
        ))}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {['IA', 'Redes', 'Educação'].map((tag) => (
            <span key={tag} className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function JuridicoMock() {
  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-800 shadow-2xl shadow-slate-950/40">
      <div className="h-1.5 bg-gradient-to-r from-indigo-700 to-slate-900" />
      <div className="px-5 py-5">
        <p className="text-center text-[9px] font-bold uppercase tracking-[0.28em] text-slate-400">
          Instrumento particular
        </p>
        <p className="mt-2 text-center text-sm font-bold tracking-wide text-slate-950">PROCURAÇÃO AD JUDICIA</p>
        <div className="mt-4 space-y-3 text-[11px] leading-5 text-slate-600">
          <p>
            <span className="font-bold text-slate-900">OUTORGANTE</span>
            <br />
            Camila Ferreira Santos nomeia e constitui seu bastante procurador para representá-la em juízo.
          </p>
          <p>
            <span className="font-bold text-slate-900">PODERES</span>
            <br />
            Ampla defesa, com poderes para transigir, desistir e receber valores.
          </p>
        </div>
        <div className="mt-5 border-t border-slate-100 pt-4 text-center text-[10px]">
          <div className="mx-auto mb-1 h-px w-24 bg-slate-400" />
          Outorgante
        </div>
      </div>
    </div>
  );
}

function ContabilMock() {
  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-800 shadow-2xl shadow-slate-950/40">
      <div className="h-1.5 bg-gradient-to-r from-sky-700 to-emerald-600" />
      <div className="px-5 py-5">
        <p className="text-center text-sm font-bold uppercase tracking-wide text-slate-950">
          Declaração de Prestação de Serviços Contábeis
        </p>
        <div className="mt-4 space-y-3 text-[11px] leading-5 text-slate-600">
          <p>
            <span className="font-bold text-slate-900">1. DO OBJETO</span>
            <br />
            Escrituração contábil e fiscal mensal, apuração de impostos e entrega de obrigações.
          </p>
          <p>
            <span className="font-bold text-slate-900">2. DA RESPONSABILIDADE</span>
            <br />
            O contratado responde pela exatidão das informações prestadas ao Fisco.
          </p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-[10px]">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="font-bold uppercase text-slate-500">CRC</p>
            <p className="font-semibold text-slate-900">SP-034521/O</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="font-bold uppercase text-slate-500">Regime</p>
            <p className="font-semibold text-slate-900">Simples Nacional</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgendaMock() {
  const weekLabels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  const dotDays = [6, 9, 14, 19];
  return (
    <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl shadow-slate-900/15">
      <div className="flex items-center justify-between bg-slate-900 px-5 py-4 text-white">
        <p className="text-sm font-bold">Julho 2026</p>
        <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold">Hoje</span>
      </div>
      <div className="grid grid-cols-7 gap-1 px-5 pt-4 text-center text-[10px] font-semibold text-slate-400">
        {weekLabels.map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 px-5 pb-4 pt-2 text-center text-[11px]">
        {Array.from({ length: 21 }).map((_, i) => {
          const day = i + 1;
          const active = day === 14;
          const dot = dotDays.includes(day) && !active;
          return (
            <div
              key={day}
              className={cn(
                'relative rounded-lg py-1.5',
                active ? 'bg-sky-600 font-bold text-white' : 'text-slate-600'
              )}
            >
              {day}
              {dot ? (
                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-sky-500" />
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="space-y-2 border-t border-slate-100 px-5 py-4">
        {[
          { time: '09:00', title: 'Reunião com cliente', tag: 'Confirmado', tagClass: 'bg-emerald-100 text-emerald-700' },
          { time: '14:30', title: 'Entrega da proposta', tag: 'Urgente', tagClass: 'bg-rose-100 text-rose-700' }
        ].map((item) => (
          <div key={item.title} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-[11px]">
            <p className="font-bold text-slate-900">
              {item.time} · {item.title}
            </p>
            <span className={cn('rounded-full px-2 py-1 text-[10px] font-bold', item.tagClass)}>{item.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="bg-[image:var(--rj-page-bg)]">
      {/* Hero: marca + CTAs + vídeo no fluxo de conversão */}
      <section className="relative overflow-hidden bg-[linear-gradient(145deg,#020617_0%,#0f172a_42%,#0c4a6e_100%)] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl rj-animate-drift" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.06)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <ToolsWatermark className="opacity-80" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:py-16">
          <div className="max-w-xl">
            <div className="rj-animate-fade-up">
              <Logo variant="hero" />
            </div>
            <h1 className="rj-display rj-animate-fade-up-delay mt-6 text-[clamp(1.9rem,4.2vw,3.25rem)] font-extrabold leading-[1.08] tracking-tight text-white">
              Currículos, contratos, recibos e propostas profissionais.
              <span className="mt-1 block">Tudo isso grátis.</span>
            </h1>
            <p className="rj-animate-fade-up-delay-2 mt-4 max-w-lg text-base leading-7 text-slate-200 sm:text-lg">
              Crie documentos com cara de profissional em minutos, sem cartão e sem pegadinha.
            </p>
            <ul className="rj-animate-fade-up-delay-2 mt-5 space-y-2 text-sm text-slate-200">
              {[
                'Busca de recursos sempre gratuita',
                'Layouts profissionais em todas as ferramentas',
                'PDF pronto em minutos'
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-amber-300" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button asChild size="lg" className={primaryCtaClass}>
                <Link href="/cadastro">
                  Criar conta e testar
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-white/25 bg-white/5 px-6 text-base text-white hover:bg-white/10"
              >
                <Link href="/busca">
                  Explorar busca grátis
                  <Search className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative rj-animate-fade-up-delay-2">
            <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-sky-400/20 via-transparent to-amber-300/10 blur-2xl" />
            <PromoVideoPlayer compact className="relative" />
            <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-sky-200/90">
              Veja o fluxo em 60 segundos
            </p>
          </div>
        </div>
      </section>

      {/* Capas */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16">
          <div className="relative max-lg:order-2">
            <div className="absolute -inset-4 rounded-[2rem] bg-white shadow-sm" />
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-700">Universidade Federal</p>
              <p className="mt-10 text-xs font-semibold uppercase tracking-wide text-slate-700">Ana Clara Mendes</p>
              <p className="mt-8 text-base font-bold uppercase leading-snug text-slate-900">
                Planejamento estratégico em pequenas empresas
              </p>
              <p className="mt-16 text-sm font-semibold text-slate-700">Goiânia · 2026</p>
            </div>
          </div>
          <div className="max-lg:order-1">
            <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">Para estudantes</p>
            <h2 className="rj-display mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Capa de trabalho pronta em minutos.
            </h2>
            <FeatureChecks
              items={[
                'Escolar (fundamental e médio)',
                'Universitária no padrão ABNT',
                'Folha de rosto com orientador'
              ]}
            />
            <Button asChild className={cn('mt-8', primaryCtaClass)} size="lg">
              <AuthAwareLink href="/ferramentas/trabalhos">
                <BookOpen className="h-4 w-4" />
                Gerar capa agora
              </AuthAwareLink>
            </Button>
          </div>
        </div>
      </section>

      {/* Currículos */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">Currículos</p>
            <h2 className="rj-display mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Currículo pronto para impressionar.
            </h2>
            <FeatureChecks
              items={[
                'Layouts com tipografia profissional',
                'Pré-visualização ao vivo',
                'PDF com um clique'
              ]}
            />
            <Button asChild className={cn('mt-8', primaryCtaClass)} size="lg">
              <AuthAwareLink href="/ferramentas/curriculo">
                <GraduationCap className="h-4 w-4" />
                Abrir gerador de currículos
              </AuthAwareLink>
            </Button>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-sky-100/80" />
            <div className="relative p-4 sm:p-6">
              <CurriculoMock />
            </div>
          </div>
        </div>
      </section>

      {/* Propostas */}
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16">
          <div className="relative max-lg:order-2">
            <div className="absolute -inset-4 rounded-[2rem] bg-sky-500/10" />
            <div className="relative p-2 sm:p-4">
              <PropostaMock />
            </div>
          </div>
          <div className="max-lg:order-1">
            <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-amber-300">Propostas comerciais</p>
            <h2 className="rj-display mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Propostas que vendem, cara de agência.
            </h2>
            <FeatureChecks
              items={[
                '3 layouts (corporativa, executiva, criativa)',
                'Totais e validade organizados',
                'PDF pronto para enviar'
              ]}
              iconClass="text-amber-300"
              textClass="text-slate-200"
            />
            <Button asChild size="lg" className={cn('mt-8', primaryCtaClass)}>
              <AuthAwareLink href="/ferramentas/propostas">
                <FileText className="h-4 w-4" />
                Montar proposta agora
              </AuthAwareLink>
            </Button>
          </div>
        </div>
      </section>

      {/* Orçamentos + Pix */}
      <section className="border-b border-slate-200 bg-emerald-50/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">Novidade</p>
          <h2 className="rj-display mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Orçamento com aprovação e Pix na hora.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-emerald-200 bg-white p-6">
              <ClipboardList className="h-5 w-5 text-emerald-700" />
              <p className="mt-3 text-lg font-bold text-slate-900">Orçamentos com link</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  Cliente aprova no celular
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  Página limpa, sem app
                </li>
              </ul>
            </div>
            <div className="rounded-[24px] border border-emerald-200 bg-white p-6">
              <Wallet className="h-5 w-5 text-emerald-700" />
              <p className="mt-3 text-lg font-bold text-slate-900">Cobrança Pix</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  QR Code e Copia e Cola
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  Pronto para WhatsApp
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className={primaryCtaClass}>
              <AuthAwareLink href="/ferramentas/orcamentos">
                <ClipboardList className="h-4 w-4" />
                Criar orçamento grátis
              </AuthAwareLink>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-emerald-300 bg-white px-6 font-bold text-emerald-900 hover:bg-emerald-50"
            >
              <AuthAwareLink href="/ferramentas/pix">
                <Wallet className="h-4 w-4" />
                Gerar Pix agora
              </AuthAwareLink>
            </Button>
          </div>
        </div>
      </section>

      {/* Contratos */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">Contratos</p>
            <h2 className="rj-display mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Sem fila na papelaria.
            </h2>
            <FeatureChecks
              items={[
                '6 tipos prontos e editáveis',
                'Cláusulas com os seus dados',
                'Assinaturas e testemunhas no PDF'
              ]}
            />
            <Button asChild className={cn('mt-8', primaryCtaClass)} size="lg">
              <AuthAwareLink href="/ferramentas/contratos">
                <Scale className="h-4 w-4" />
                Criar contrato agora
              </AuthAwareLink>
            </Button>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-sky-100/80" />
            <div className="relative p-4 sm:p-6">
              <ContratoMock />
            </div>
          </div>
        </div>
      </section>

      {/* Recibos */}
      <section className="border-b border-slate-200 bg-emerald-50/60">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">Recibos</p>
            <h2 className="rj-display mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Recibo profissional em segundos.
            </h2>
            <FeatureChecks
              items={[
                '3 modelos prontos (profissional, moderno, compacto)',
                'Valor por extenso calculado automaticamente',
                'PDF com assinatura digital do recebedor'
              ]}
            />
            <Button asChild className={cn('mt-8', primaryCtaClass)} size="lg">
              <AuthAwareLink href="/ferramentas/recibos">
                <Receipt className="h-4 w-4" />
                Emitir recibo agora
              </AuthAwareLink>
            </Button>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-white/80" />
            <div className="relative p-4 sm:p-6">
              <ReciboMock />
            </div>
          </div>
        </div>
      </section>

      {/* Currículo Lattes */}
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16">
          <div className="relative max-lg:order-2">
            <div className="absolute -inset-4 rounded-[2rem] bg-amber-400/10" />
            <div className="relative p-2 sm:p-4">
              <LattesMock />
            </div>
          </div>
          <div className="max-lg:order-1">
            <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-amber-300">Lattes Inteligente</p>
            <h2 className="rj-display mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Trajetória acadêmica organizada, com revisão por IA.
            </h2>
            <FeatureChecks
              items={[
                'Todas as seções do padrão CNPq',
                'Sugestões de texto por inteligência artificial',
                'PDF pronto para editais e processos seletivos'
              ]}
              iconClass="text-amber-300"
              textClass="text-slate-200"
            />
            <Button asChild size="lg" className={cn('mt-8', primaryCtaClass)}>
              <AuthAwareLink href="/ferramentas/curriculo-lattes">
                <Award className="h-4 w-4" />
                Criar currículo acadêmico
              </AuthAwareLink>
            </Button>
          </div>
        </div>
      </section>

      {/* Documentos jurídicos */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">Documentos jurídicos</p>
            <h2 className="rj-display mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Petições e procurações sem sair de casa.
            </h2>
            <FeatureChecks
              items={[
                'Procurações, notificações e petições simples',
                'Linguagem jurídica correta e clara',
                'Assinaturas e testemunhas organizadas no PDF'
              ]}
            />
            <Button asChild className={cn('mt-8', primaryCtaClass)} size="lg">
              <AuthAwareLink href="/ferramentas/juridicos">
                <Gavel className="h-4 w-4" />
                Gerar documento jurídico
              </AuthAwareLink>
            </Button>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-sky-100/80" />
            <div className="relative p-4 sm:p-6">
              <JuridicoMock />
            </div>
          </div>
        </div>
      </section>

      {/* Documentos contábeis */}
      <section className="border-b border-slate-200 bg-sky-50/70">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16">
          <div className="relative max-lg:order-2">
            <div className="absolute -inset-4 rounded-[2rem] bg-white" />
            <div className="relative overflow-hidden rounded-2xl shadow-lg">
              <ContabilMock />
            </div>
          </div>
          <div className="max-lg:order-1">
            <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">Docs contábeis e despacho</p>
            <h2 className="rj-display mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Rotina fiscal sem correria no fim do mês.
            </h2>
            <FeatureChecks
              items={[
                'Procuração, e-CAC, residência e cartas para o Fisco',
                'Cláusulas de responsabilidade fiscal inclusas',
                'CRC e regime tributário organizados no documento'
              ]}
            />
            <Button asChild className={cn('mt-8', primaryCtaClass)} size="lg">
              <AuthAwareLink href="/ferramentas/contabeis">
                <Calculator className="h-4 w-4" />
                Criar documento contábil
              </AuthAwareLink>
            </Button>
          </div>
        </div>
      </section>

      {/* Agenda */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">Agenda Premium</p>
            <h2 className="rj-display mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Compromissos e prazos, sempre à mão.
            </h2>
            <FeatureChecks
              items={[
                'Visão mensal com feriados brasileiros',
                'Alertas antes de cada compromisso',
                'Busca rápida por cliente ou tarefa'
              ]}
            />
            <Button asChild className={cn('mt-8', primaryCtaClass)} size="lg">
              <AuthAwareLink href="/ferramentas/agenda">
                <CalendarClock className="h-4 w-4" />
                Abrir agenda
              </AuthAwareLink>
            </Button>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-sky-50" />
            <div className="relative p-4 sm:p-6">
              <AgendaMock />
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection />

      {/* Grátis e profissional */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="overflow-hidden rounded-[28px] border border-sky-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-700">Tudo grátis pra começar</p>
          <h2 className="rj-display mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Documentos profissionais, sem custo e sem pegadinha.
          </h2>
          <ul className="mt-5 grid gap-2.5 text-sm text-slate-700 sm:grid-cols-2">
            {[
              'Currículos, contratos, recibos e propostas',
              'Layouts com cara de escritório',
              'Busca de recursos sempre gratuita',
              'Sem cartão de crédito'
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <Check className="h-4 w-4 shrink-0 text-sky-600" />
                {item}
              </li>
            ))}
          </ul>
          <TrustSeals className="mt-8" />
          <Button asChild size="lg" className={cn('mt-6', primaryCtaClass)}>
            <Link href="/cadastro">
              Criar conta grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Busca gratuita */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">Busca gratuita</p>
            <h2 className="rj-display mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Busca 100% grátis e sem limite.
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                Centenas de links úteis, sem cadastro
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                Ferramentas profissionais liberadas com sua conta grátis
              </li>
            </ul>
          </div>
          <Button asChild size="lg" variant="outline" className="h-12 shrink-0">
            <Link href="/busca">
              Abrir busca gratuita
              <Search className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="relative overflow-hidden rounded-[32px] bg-slate-950 px-6 py-12 text-white sm:px-12">
          <div className="pointer-events-none absolute -right-10 top-0 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <h2 className="rj-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Pronto para resolver mais rápido?
              </h2>
              <ul className="mt-5 space-y-2 text-sm text-slate-300">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  Conta grátis em segundos
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  Ferramentas profissionais desde o primeiro acesso
                </li>
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className={cn('h-12', primaryCtaClass)}>
                  <Link href="/cadastro">Criar conta grátis</Link>
                </Button>
                <AuthAwareLink
                  href="/ferramentas"
                  className="text-center text-sm font-semibold text-slate-300 underline-offset-4 transition hover:text-white hover:underline sm:text-left"
                >
                  Ver todas as ferramentas
                </AuthAwareLink>
              </div>
              <TrustSeals tone="dark" className="mt-8" />
            </div>
            <PromoVideoPlayer compact />
          </div>
        </div>
      </section>
    </div>
  );
}
