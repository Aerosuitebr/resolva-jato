import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { AuthAwareLink } from '@/components/auth/auth-aware-link';
import { TrustSeals } from '@/components/marketing/trust-seals';
import { Button } from '@/components/ui/button';

export function PricingPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">
          Totalmente grátis
        </p>
        <h1 className="rj-display mt-3 text-4xl font-bold tracking-tight text-slate-900">
          Documentos profissionais sem pagar nada
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Orçamento com Pix, recibo, contrato, currículo, proposta e capa ABNT — PDF pronto para
          enviar, sem cartão.
        </p>
      </div>

      <div className="mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-slate-800 bg-[linear-gradient(135deg,#0f172a_0%,#064e3b_55%,#047857_100%)] p-8 text-white sm:p-10">
        <h2 className="rj-display text-3xl font-extrabold tracking-tight">Escritório digital gratuito</h2>
        <ul className="mt-6 space-y-3 text-sm text-slate-100">
          {[
            'Gere PDFs com cara profissional',
            'Fluxo pensado para WhatsApp',
            'Busca de recursos sempre aberta',
            'Sem cartão e sem burocracia'
          ].map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <Check className="h-4 w-4 shrink-0 text-amber-300" />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="flex-1 bg-white font-bold text-slate-950 hover:bg-emerald-50">
            <AuthAwareLink href="/ferramentas">
              Gerar documento grátis
              <ArrowRight className="h-4 w-4" />
            </AuthAwareLink>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="flex-1 border-white/25 bg-white/5 text-white hover:bg-white/10"
          >
            <Link href="/cadastro">Criar conta grátis</Link>
          </Button>
        </div>
      </div>

      <TrustSeals className="mt-10" />
    </section>
  );
}
