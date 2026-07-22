import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardList,
  FileText,
  GraduationCap,
  Scale,
  Search,
  Wallet
} from 'lucide-react';
import { AuthAwareLink } from '@/components/auth/auth-aware-link';
import { Logo } from '@/components/brand/logo';
import { HeroOrcamentoDemo } from '@/components/marketing/hero-orcamento-demo';
import { PlanBenefitsList } from '@/components/marketing/plan-benefits-list';
import { PromoVideoPlayer } from '@/components/marketing/promo-video-section';
import { TestimonialsSection } from '@/components/marketing/testimonials-section';
import { TrustSeals } from '@/components/marketing/trust-seals';
import { ToolsWatermark } from '@/components/brand/tools-watermark';
import { Button } from '@/components/ui/button';
import { PLANS } from '@/lib/plans';
import { cn } from '@/lib/utils';

const primaryCtaClass =
  'h-12 bg-amber-400 px-6 text-base font-bold text-slate-950 hover:bg-amber-300';

const OTHER_TOOLS = [
  {
    href: '/ferramentas/curriculo',
    title: 'Currículo',
    text: 'Layouts profissionais e PDF em um clique.',
    icon: GraduationCap
  },
  {
    href: '/ferramentas/propostas',
    title: 'Proposta comercial',
    text: 'Cara de agência, totais e validade claros.',
    icon: FileText
  },
  {
    href: '/ferramentas/contratos',
    title: 'Contrato',
    text: 'Modelos editáveis sem fila na papelaria.',
    icon: Scale
  },
  {
    href: '/ferramentas/trabalhos',
    title: 'Capa ABNT',
    text: 'Escolar e universitária prontas em minutos.',
    icon: BookOpen
  },
  {
    href: '/ferramentas/recibos',
    title: 'Recibo',
    text: 'Valor por extenso e assinatura no PDF.',
    icon: Wallet
  },
  {
    href: '/ferramentas/pix',
    title: 'Pix avulso',
    text: 'QR Code e Copia e Cola para cobrar rápido.',
    icon: ClipboardList
  }
] as const;

function FeatureChecks({
  items,
  iconClass = 'text-emerald-600',
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

export function LandingPage() {
  const premium = PLANS.premium;
  const gratis = PLANS.gratis;

  return (
    <div className="bg-[image:var(--rj-page-bg)]">
      {/* Hero: uma cena — orçamento + Pix */}
      <section className="relative overflow-hidden bg-[linear-gradient(145deg,#020617_0%,#0f172a_42%,#064e3b_100%)] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl rj-animate-drift" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.06)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <ToolsWatermark className="opacity-70" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-start gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:py-16">
          <div className="max-w-xl">
            <div className="rj-animate-fade-up">
              <Logo variant="hero" />
            </div>
            <p className="rj-animate-fade-up mt-6 text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
              Cobrança no WhatsApp
            </p>
            <h1 className="rj-display rj-animate-fade-up-delay mt-3 text-[clamp(1.9rem,4.2vw,3.35rem)] font-extrabold leading-[1.08] tracking-tight text-white">
              Mande o orçamento. Cliente aprova. Pix na hora.
            </h1>
            <p className="rj-animate-fade-up-delay-2 mt-4 max-w-lg text-base leading-7 text-slate-200 sm:text-lg">
              Sem app, sem cartão. O cliente abre o link no celular, aprova e você cobra com QR Code
              pronto para colar no WhatsApp.
            </p>
            <ul className="rj-animate-fade-up-delay-2 mt-5 space-y-2 text-sm text-slate-200">
              {[
                'Aprovação no celular, sem instalar nada',
                'QR Pix e Copia e Cola prontos',
                `${gratis.toolUsesLimit} usos grátis para testar de verdade`
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-amber-300" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button asChild size="lg" className={primaryCtaClass}>
                <AuthAwareLink href="/ferramentas/orcamentos">
                  Montar orçamento e gerar Pix
                  <ArrowRight className="h-4 w-4" />
                </AuthAwareLink>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-white/25 bg-white/5 px-6 text-base text-white hover:bg-white/10"
              >
                <Link href="#demo-60s">Ver o fluxo em 60s</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Também tem currículo, contrato, proposta e capa ABNT — depois do primeiro Pix.
              Indique 3 amigos ativos e ganhe 1 mês Premium na sua conta.
            </p>
          </div>

          <div className="relative rj-animate-fade-up-delay-2">
            <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-emerald-400/20 via-transparent to-amber-300/10 blur-2xl" />
            <HeroOrcamentoDemo className="relative" />
          </div>
        </div>
      </section>

      {/* Vídeo curto */}
      <section id="demo-60s" className="scroll-mt-20 border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:py-16">
          <div>
            <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-300">Em 60 segundos</p>
            <h2 className="rj-display mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Do orçamento ao Pix, no WhatsApp.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Veja o fluxo completo antes de criar a conta. Se o vídeo não carregar, a demo ao vivo
              acima já mostra o produto.
            </p>
          </div>
          <PromoVideoPlayer compact />
        </div>
      </section>

      {/* Profundidade do âncora */}
      <section className="border-b border-slate-200 bg-emerald-50/70">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-emerald-800">
              Produto âncora
            </p>
            <h2 className="rj-display mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Cada link enviado vira uma chance de fechar.
            </h2>
            <FeatureChecks
              items={[
                'Cliente aprova ou pede ajuste no próprio celular',
                'Pix gerado na hora para mandar no WhatsApp',
                'Página limpa, sem instalar app'
              ]}
            />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className={cn(primaryCtaClass)} size="lg">
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
                  Só gerar Pix
                </AuthAwareLink>
              </Button>
            </div>
          </div>
          <div className="rounded-[28px] border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              Por que isso viraliza
            </p>
            <ul className="mt-4 space-y-4 text-sm leading-6 text-slate-700">
              <li className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                  1
                </span>
                Você manda o link para o cliente — ele já vê o valor profissional.
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                  2
                </span>
                Aprovar + Pix reduz a conversa interminável de “me manda o preço”.
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                  3
                </span>
                O cliente sente o produto. Muitos voltam para criar o deles.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <TestimonialsSection />

      {/* Personas */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">
            Para quem é
          </p>
          <h2 className="rj-display mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Uma entrada clara por perfil.
          </h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                href: '/para/mei',
                title: 'MEI',
                text: 'Cobrar com orçamento + Pix e emitir recibo sem burocracia.'
              },
              {
                href: '/para/freelancers',
                title: 'Freelancers',
                text: 'Proposta, contrato e cobrança com cara de agência.'
              },
              {
                href: '/para/estudantes',
                title: 'Estudantes',
                text: 'Capa ABNT e currículo antes do prazo acabar.'
              }
            ].map((persona) => (
              <li key={persona.href}>
                <Link
                  href={persona.href}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50/80 p-5 transition hover:border-emerald-300 hover:bg-white hover:shadow-sm"
                >
                  <p className="text-base font-bold text-slate-900 group-hover:text-emerald-800">
                    {persona.title}
                  </p>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{persona.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                    Ver página
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-slate-500">
            Também:{' '}
            <Link href="/orcamento-com-pix" className="font-semibold text-sky-700 hover:underline">
              orçamento com Pix
            </Link>
            ,{' '}
            <Link href="/gerador-de-curriculo" className="font-semibold text-sky-700 hover:underline">
              currículo
            </Link>
            ,{' '}
            <Link href="/gerador-de-contrato" className="font-semibold text-sky-700 hover:underline">
              contrato
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Outras ferramentas — secundárias */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">
            Também resolve
          </p>
          <h2 className="rj-display mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Depois do Pix, o restante do escritório.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Currículo, proposta, contrato e capa ABNT com a mesma qualidade — sem competir com o
            fluxo que fecha venda.
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OTHER_TOOLS.map((tool) => (
              <li key={tool.href}>
                <AuthAwareLink
                  href={tool.href}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50/80 p-5 transition hover:border-sky-300 hover:bg-white hover:shadow-sm"
                >
                  <tool.icon className="h-5 w-5 text-sky-700" />
                  <p className="mt-3 text-base font-bold text-slate-900 group-hover:text-sky-800">
                    {tool.title}
                  </p>
                  <p className="mt-1.5 flex-1 text-sm leading-6 text-slate-600">{tool.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-700">
                    Abrir
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </span>
                </AuthAwareLink>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Preço acessível */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="flex flex-col justify-center">
            <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">
              Acesso acessível
            </p>
            <h2 className="rj-display mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Comece grátis. Ilimitado por um cafezinho.
            </h2>
            <ul className="mt-5 space-y-2.5 text-sm text-slate-700">
              {[
                'Busca sempre gratuita',
                `Teste com ${gratis.toolUsesLimit} usos`,
                'Orçamento + Pix liberados desde o primeiro acesso'
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-sky-600" />
                  {item}
                </li>
              ))}
            </ul>
            <TrustSeals className="mt-8" />
          </div>

          <div className="overflow-hidden rounded-[28px] border border-slate-800 bg-[linear-gradient(135deg,#0f172a_0%,#064e3b_55%,#047857_100%)] p-8 text-white rj-price-shine bg-[length:200%_200%]">
            <p className="text-sm font-semibold text-emerald-200">Premium · 30 dias</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="rj-display text-5xl font-extrabold tracking-tight">{premium.priceLabel}</span>
              <span className="pb-2 text-sm text-slate-300">{premium.period}</span>
            </div>
            <PlanBenefitsList
              benefits={premium.benefits}
              limit={4}
              className="mt-6 sm:grid-cols-1"
              iconWrapClassName="bg-amber-300/15 text-amber-300"
              titleClassName="text-white"
              textClassName="text-slate-300"
            />
            <div className="mt-8 flex flex-col gap-3">
              <Button asChild size="lg" className="w-full bg-white font-bold text-slate-950 hover:bg-emerald-50">
                <Link href="/conta?upgrade=premium">Liberar ilimitado</Link>
              </Button>
              <Link
                href="/cadastro"
                className="text-center text-sm font-semibold text-emerald-100 underline-offset-4 transition hover:text-white hover:underline"
              >
                Ou testar {gratis.toolUsesLimit} usos gratuitos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Busca gratuita */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">
              Busca gratuita
            </p>
            <h2 className="rj-display mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Centenas de links úteis, sem cadastro.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              A busca continua 100% grátis. As ferramentas usam os {gratis.toolUsesLimit} usos do
              plano gratuito.
            </p>
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
          <div className="pointer-events-none absolute -right-10 top-0 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="rj-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Pronto para cobrar pelo WhatsApp?
            </h2>
            <ul className="mt-5 space-y-2 text-sm text-slate-300">
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                Monte o orçamento em minutos
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                Cliente aprova no celular e você gera o Pix
              </li>
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className={cn('h-12', primaryCtaClass)}>
                <AuthAwareLink href="/ferramentas/orcamentos">
                  Montar orçamento e gerar Pix
                </AuthAwareLink>
              </Button>
              <Link
                href="/cadastro"
                className="text-center text-sm font-semibold text-slate-300 underline-offset-4 transition hover:text-white hover:underline sm:text-left"
              >
                Criar conta grátis
              </Link>
            </div>
            <TrustSeals tone="dark" className="mt-8" />
          </div>
        </div>
      </section>
    </div>
  );
}
