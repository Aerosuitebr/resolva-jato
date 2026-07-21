import Link from 'next/link';
import { AuthAwareLink } from '@/components/auth/auth-aware-link';
import { PlanBenefitsList } from '@/components/marketing/plan-benefits-list';
import { TrustSeals } from '@/components/marketing/trust-seals';
import { Button } from '@/components/ui/button';
import { PLANS, PLAN_ORDER } from '@/lib/plans';

export function PricingPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Escolha como quer usar</h1>
        <ul className="mx-auto mt-5 max-w-md space-y-2 text-left text-sm leading-6 text-slate-700 sm:text-center">
          <li>· Busca 100% gratuita, sempre</li>
          <li>· Grátis: ferramentas profissionais liberadas na hora</li>
          <li>· Premium: ilimitado quando fizer sentido pra você</li>
        </ul>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[...PLAN_ORDER].reverse().map((planId) => {
          const plan = PLANS[planId];
          const isFree = plan.id !== 'premium';
          return (
            <article
              key={plan.id}
              className={`rounded-[28px] border p-8 shadow-sm ${
                isFree ? 'border-sky-300 bg-gradient-to-b from-sky-50 to-white' : 'border-slate-200 bg-white'
              }`}
            >
              <h2 className="text-2xl font-bold text-slate-900">{plan.name}</h2>
              <p className="mt-1 text-sm text-slate-700">{plan.tagline}</p>
              <div className="mt-6 flex items-end gap-2">
                <span className="text-4xl font-bold text-slate-900">{plan.priceLabel}</span>
                <span className="pb-1 text-sm font-medium text-slate-600">{plan.period}</span>
              </div>
              <PlanBenefitsList
                benefits={plan.benefits}
                className="mt-6"
                itemClassName={
                  isFree
                    ? 'border-sky-100 bg-sky-50/60'
                    : 'border-slate-100 bg-slate-50'
                }
                iconWrapClassName={
                  isFree ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'
                }
                titleClassName="text-slate-900"
                textClassName="text-slate-600"
              />
              <Button asChild className="mt-8 w-full" variant={isFree ? 'default' : 'outline'}>
                {plan.id === 'premium' ? (
                  <AuthAwareLink href="/conta?upgrade=premium">Assinar Premium</AuthAwareLink>
                ) : (
                  <Link href="/cadastro">Criar conta grátis</Link>
                )}
              </Button>
            </article>
          );
        })}
      </div>
      <TrustSeals className="mt-10" />
    </section>
  );
}
