import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { AuthAwareLink } from '@/components/auth/auth-aware-link';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { TopEnvBanner } from '@/components/layout/top-env-banner';
import { TrustSeals } from '@/components/marketing/trust-seals';
import { Button } from '@/components/ui/button';
import type { SeoLandingContent } from '@/lib/seo/landing-content';

const primaryCtaClass =
  'h-12 bg-amber-400 px-6 text-base font-bold text-slate-950 hover:bg-amber-300';

export function SeoLandingPage({ content }: { content: SeoLandingContent }) {
  return (
    <>
      <TopEnvBanner />
      <div className="pt-8">
        <SiteHeader />
        <main>
          <section className="relative overflow-hidden bg-[linear-gradient(145deg,#020617_0%,#0f172a_45%,#064e3b_100%)] text-white">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
                {content.eyebrow}
              </p>
              <h1 className="rj-display mt-3 max-w-3xl text-[clamp(1.85rem,4vw,3.1rem)] font-extrabold leading-[1.1] tracking-tight">
                {content.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
                {content.description}
              </p>
              <ul className="mt-6 space-y-2 text-sm text-slate-200">
                {content.heroBullets.map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-amber-300" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className={primaryCtaClass}>
                  <AuthAwareLink href={content.toolHref}>
                    {content.primaryCta}
                    <ArrowRight className="h-4 w-4" />
                  </AuthAwareLink>
                </Button>
                {content.secondaryCta ? (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 border-white/25 bg-white/5 px-6 text-white hover:bg-white/10"
                  >
                    <AuthAwareLink href={content.secondaryCta.href}>
                      {content.secondaryCta.label}
                    </AuthAwareLink>
                  </Button>
                ) : null}
              </div>
              <TrustSeals tone="dark" className="mt-8" />
            </div>
          </section>

          {content.sections.map((section) => (
            <section key={section.title} className="border-b border-slate-200 bg-white">
              <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
                <h2 className="rj-display max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900">
                  {section.title}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  {section.body}
                </p>
                {section.bullets?.length ? (
                  <ul className="mt-6 max-w-xl space-y-2.5">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2.5 text-sm text-slate-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}

          <section className="border-b border-slate-200 bg-slate-50">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
              <h2 className="rj-display text-3xl font-extrabold tracking-tight text-slate-900">
                Perguntas frequentes
              </h2>
              <dl className="mt-8 space-y-5">
                {content.faqs.map((item) => (
                  <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <dt className="text-sm font-bold text-slate-900">{item.q}</dt>
                    <dd className="mt-2 text-sm leading-6 text-slate-600">{item.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section className="bg-white">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
              <h2 className="rj-display text-3xl font-extrabold tracking-tight text-slate-900">
                Continue explorando
              </h2>
              <ul className="mt-8 grid gap-4 sm:grid-cols-3">
                {content.related.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block h-full rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-sky-300 hover:bg-white"
                    >
                      <p className="font-bold text-slate-900">{item.label}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.blurb}</p>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Button asChild size="lg" className={primaryCtaClass}>
                  <AuthAwareLink href={content.toolHref}>
                    {content.primaryCta}
                    <ArrowRight className="h-4 w-4" />
                  </AuthAwareLink>
                </Button>
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
