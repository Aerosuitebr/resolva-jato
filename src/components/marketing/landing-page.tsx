import Link from 'next/link';
import { ArrowRight, Check, ClipboardCheck, FileCheck2, FileText, MessageCircle, Receipt, Scale, ShieldCheck, Wallet } from 'lucide-react';
import { ToolsWatermark } from '@/components/brand/tools-watermark';
import { CategoryExplorer } from '@/components/marketing/category-explorer';
import { IntentFinder } from '@/components/marketing/intent-finder';
import { PromoVideoPlayer } from '@/components/marketing/promo-video-section';
import { TestimonialsSection } from '@/components/marketing/testimonials-section';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const primaryCtaClass = 'h-12 bg-amber-400 px-6 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/30 ring-1 ring-amber-300/50 transition hover:bg-amber-300 hover:shadow-xl';

const POPULAR_TOOLS = [
  { href: '/orcamento-com-pix#montar', title: 'Orçamento + Pix', text: 'Cliente aprova no celular', icon: ClipboardCheck },
  { href: '/gerador-de-recibo', title: 'Recibo', text: 'PDF com valor por extenso', icon: Receipt },
  { href: '/gerador-de-contrato', title: 'Contrato', text: 'Modelos editáveis', icon: Scale },
  { href: '/gerador-de-curriculo', title: 'Currículo', text: 'Layouts profissionais', icon: FileText },
  { href: '/calculadora-de-rescisao', title: 'Rescisão', text: 'Estimativa trabalhista', icon: Wallet }
] as const;

export function LandingPage() {
  return (
    <div className="bg-[image:var(--rj-page-bg)]">
      <section className="relative overflow-hidden bg-[linear-gradient(145deg,#020617_0%,#0f172a_48%,#064e3b_100%)] text-white">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-24 top-10 hidden h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl sm:block" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <ToolsWatermark className="opacity-45" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:py-20">
          <div className="max-w-xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">Trabalho, documentos e cálculos</p>
            <h1 className="rj-display mt-3 text-[clamp(2.15rem,5vw,3.8rem)] font-extrabold leading-[1.04] tracking-tight text-white">Crie, calcule e envie. Resolva já.</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-200 sm:text-lg">Orçamento com aprovação e Pix, recibos, contratos, currículo e calculadoras grátis — direto no navegador, sem burocracia.</p>
            <ul className="mt-6 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
              {['Experimente sem cadastro', 'Pronto para o WhatsApp', 'Cliente não instala app', 'PDF profissional em minutos'].map((item) => (
                <li key={item} className="flex items-center gap-2.5"><Check className="h-4 w-4 shrink-0 text-amber-300" aria-hidden />{item}</li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className={cn(primaryCtaClass, 'w-full sm:w-auto')}><Link href="/orcamento-com-pix#montar">Criar orçamento grátis <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild size="lg" variant="outline" className="h-12 w-full border-white/25 bg-white/5 px-6 text-base font-bold text-white hover:bg-white/10 sm:w-auto"><Link href="#ferramentas-populares">Ver ferramentas</Link></Button>
            </div>
          </div>
          <IntentFinder />
        </div>
      </section>

      <section id="ferramentas-populares" className="scroll-mt-28 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Mais usadas</p><h2 className="rj-display mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Comece pela tarefa, não pelo menu.</h2></div>
            <Link href="/recursos" className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 hover:underline">Ver catálogo completo <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {POPULAR_TOOLS.map((tool, index) => {
              const Icon = tool.icon;
              return <li key={tool.href}><Link href={tool.href} className={cn('group flex h-full flex-col rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md', index === 0 ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-white')}><span className={cn('grid h-11 w-11 place-items-center rounded-xl', index === 0 ? 'bg-amber-400 text-slate-950' : 'bg-emerald-100 text-emerald-800')}><Icon className="h-5 w-5" /></span><span className="mt-4 font-bold text-slate-950">{tool.title}</span><span className="mt-1 text-sm leading-6 text-slate-600">{tool.text}</span><ArrowRight className="mt-4 h-4 w-4 text-emerald-700 transition group-hover:translate-x-1" /></Link></li>;
            })}
          </ul>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-emerald-50/70">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Produto âncora</p>
            <h2 className="rj-display mt-3 max-w-xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Do preço aprovado ao Pix, no mesmo link.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-700">Monte o orçamento, envie no WhatsApp e deixe o cliente aprovar ou pedir ajustes pelo próprio celular.</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li className="flex gap-3"><MessageCircle className="mt-0.5 h-5 w-5 text-emerald-700" /> Link pronto para enviar no WhatsApp</li>
              <li className="flex gap-3"><ClipboardCheck className="mt-0.5 h-5 w-5 text-emerald-700" /> Aprovação sem conta e sem instalar aplicativo</li>
              <li className="flex gap-3"><Wallet className="mt-0.5 h-5 w-5 text-emerald-700" /> QR Code e Pix Copia e Cola após o aceite</li>
            </ul>
            <Button asChild size="lg" className={cn(primaryCtaClass, 'mt-8')}><Link href="/orcamento-com-pix#montar">Experimentar sem cadastro <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
          <div id="demo-60s" className="scroll-mt-28 rounded-[28px] border border-emerald-200 bg-white p-3 shadow-xl shadow-emerald-900/10 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-4 px-1"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Veja em 60 segundos</p><p className="mt-1 text-sm text-slate-600">O fluxo completo, sem criar conta.</p></div><FileCheck2 className="h-8 w-8 text-emerald-600" /></div>
            <PromoVideoPlayer compact />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Um lugar só</p><h2 className="rj-display mt-2 max-w-2xl text-3xl font-extrabold tracking-tight text-slate-950">Encontre a ferramenta certa em segundos.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Trabalho e dinheiro primeiro; documentos, carreira e organização quando você precisar.</p></div><Button asChild size="lg" variant="outline" className="h-12 shrink-0 self-start sm:self-auto"><Link href="/recursos">Todas as ferramentas <ArrowRight className="h-4 w-4" /></Link></Button></div>
          <div className="mt-9"><CategoryExplorer /></div>
        </div>
      </section>

      <TestimonialsSection />

      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 md:grid-cols-[1fr_auto]">
          <div><p className="inline-flex items-center gap-2 text-sm font-bold text-emerald-300"><ShieldCheck className="h-5 w-5" /> Grátis para começar · sem cartão</p><h2 className="rj-display mt-3 text-3xl font-extrabold">Qual tarefa você quer tirar da frente agora?</h2><p className="mt-3 text-sm leading-7 text-slate-300">Crie um documento profissional ou encontre a calculadora certa em poucos cliques.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row"><Button asChild size="lg" className={primaryCtaClass}><Link href="/orcamento-com-pix#montar">Criar orçamento <ArrowRight className="h-4 w-4" /></Link></Button><Button asChild size="lg" variant="outline" className="h-12 border-white/25 bg-white/5 px-6 font-bold text-white hover:bg-white/10"><Link href="/recursos">Explorar ferramentas</Link></Button></div>
        </div>
      </section>
    </div>
  );
}
