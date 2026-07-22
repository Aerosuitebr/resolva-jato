import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { AuthAwareLink } from '@/components/auth/auth-aware-link';
import { TrustSeals } from '@/components/marketing/trust-seals';
import { Button } from '@/components/ui/button';
import { PLANS } from '@/lib/plans';

export function PricingPage() {
  const premium = PLANS.premium;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">
          Teste grátis · Premium opcional
        </p>
        <h1 className="rj-display mt-3 text-4xl font-bold tracking-tight text-slate-900">
          Gere grátis. Remova a marca quando quiser.
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          No gratuito, o PDF leva o logo discreto e o rodapé do Resolva Jato — assim você avalia a
          qualidade. Com o Premium, documentos limpos e uso ilimitado por 30 dias.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
        <article className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Grátis</h2>
          <p className="mt-1 text-sm text-slate-600">Teste a eficácia do serviço</p>
          <p className="rj-display mt-6 text-4xl font-extrabold text-slate-900">R$ 0</p>
          <ul className="mt-6 space-y-2.5 text-sm text-slate-700">
            {[
              'Documentos profissionais em PDF',
              'Rodapé + logo Resolva Jato no arquivo',
              'Busca de recursos sempre aberta'
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                {item}
              </li>
            ))}
          </ul>
          <Button asChild className="mt-8 w-full" variant="outline">
            <Link href="/cadastro">Criar conta grátis</Link>
          </Button>
        </article>

        <article className="rounded-[28px] border border-slate-800 bg-[linear-gradient(135deg,#0f172a_0%,#064e3b_55%,#047857_100%)] p-8 text-white shadow-sm">
          <h2 className="text-2xl font-bold">Premium</h2>
          <p className="mt-1 text-sm text-emerald-100">Documentos sem referências ao Resolva Jato</p>
          <div className="mt-6 flex items-end gap-2">
            <span className="rj-display text-4xl font-extrabold">{premium.priceLabel}</span>
            <span className="pb-1 text-sm text-slate-300">{premium.period}</span>
          </div>
          <ul className="mt-6 space-y-2.5 text-sm text-slate-100">
            {[
              'PDF sem rodapé e sem logo',
              'Uso ilimitado por 30 dias',
              'Vigência clara na sua conta após o pagamento'
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                {item}
              </li>
            ))}
          </ul>
          <Button asChild className="mt-8 w-full bg-white font-bold text-slate-950 hover:bg-emerald-50">
            <AuthAwareLink href="/conta?upgrade=premium">
              Remover marca por {premium.priceLabel}
              <ArrowRight className="h-4 w-4" />
            </AuthAwareLink>
          </Button>
        </article>
      </div>

      <TrustSeals className="mt-10" />
    </section>
  );
}
