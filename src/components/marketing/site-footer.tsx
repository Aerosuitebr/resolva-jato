'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { AuthAwareLink } from '@/components/auth/auth-aware-link';
import { useAuth } from '@/hooks/use-auth';
import { toolsCatalog } from '@/lib/tools-catalog';

const YEAR = new Date().getFullYear();

const NAV_LINKS: { href: string; label: string; authAware?: boolean }[] = [
  { href: '/', label: 'Início' },
  { href: '/orcamento-com-pix', label: 'Orçamento + Pix' },
  { href: '/busca', label: 'Busca grátis' },
  { href: '/ferramentas', label: 'Ferramentas', authAware: true }
];

const SEO_LINKS = [
  { href: '/conta', label: 'Indique e ganhe' },
  { href: '/para/mei', label: 'Para MEI' },
  { href: '/para/freelancers', label: 'Para freelancers' },
  { href: '/para/estudantes', label: 'Para estudantes' },
  { href: '/gerador-de-curriculo', label: 'Currículo' },
  { href: '/gerador-de-recibo', label: 'Recibo' }
] as const;

function FooterDisclosure({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-slate-800/80 pb-3 lg:border-0 lg:pb-0" open>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-1 text-[15px] font-bold text-white marker:content-none lg:pointer-events-none lg:cursor-default">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-300/90">{title}</span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180 lg:hidden"
          aria-hidden
        />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

export function SiteFooter() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="border-t border-sky-900/40 bg-slate-950 text-slate-300">
      <div className="h-1 bg-gradient-to-r from-sky-600 via-sky-500 to-emerald-500" aria-hidden />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.3fr_0.7fr_0.9fr] lg:gap-10">
        <div className="max-w-md">
          <Link href="/" className="inline-block" aria-label="Página inicial Resolva Jato">
            <Logo variant="footer" />
          </Link>
          <p className="mt-3 text-[15px] leading-7 text-slate-300">
            Ferramentas para autônomos, estudantes e pequenos negócios — sem burocracia.
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Documentos profissionais e busca de recursos — totalmente grátis.
          </p>
          {!isAuthenticated ? (
            <Link
              href="/cadastro"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-sky-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-500"
            >
              Criar conta grátis
            </Link>
          ) : null}
        </div>

        <FooterDisclosure title="Navegação">
          <ul className="flex flex-col gap-2.5">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                {item.authAware ? (
                  <AuthAwareLink
                    href={item.href}
                    className="text-[15px] font-semibold text-slate-200 transition-colors hover:text-sky-300"
                  >
                    {item.label}
                  </AuthAwareLink>
                ) : (
                  <Link
                    href={item.href}
                    className="text-[15px] font-semibold text-slate-200 transition-colors hover:text-sky-300"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            <li>
              {isAuthenticated ? (
                <Link
                  href="/conta"
                  className="text-[15px] font-semibold text-slate-200 transition-colors hover:text-sky-300"
                >
                  Minha conta
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-[15px] font-semibold text-slate-200 transition-colors hover:text-sky-300"
                >
                  Entrar
                </Link>
              )}
            </li>
          </ul>
        </FooterDisclosure>

        <FooterDisclosure title="Ferramentas">
          <ul className="flex flex-col gap-2.5">
            {toolsCatalog.slice(0, 5).map((tool) => (
              <li key={tool.id}>
                <AuthAwareLink
                  href={tool.href}
                  className="text-[15px] font-medium text-slate-300 transition-colors hover:text-sky-300"
                >
                  {tool.name}
                </AuthAwareLink>
              </li>
            ))}
            <li>
              <AuthAwareLink
                href="/ferramentas"
                className="text-[15px] font-semibold text-sky-300 transition-colors hover:text-sky-200"
              >
                Ver todas
              </AuthAwareLink>
            </li>
          </ul>
        </FooterDisclosure>
      </div>

      <div className="border-t border-slate-800/80">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-300/90">Guias</p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {SEO_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-slate-400 transition-colors hover:text-sky-300"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-sm leading-6 text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {YEAR} Resolva Jato</p>
          <p className="sm:text-right">Links de terceiros são de responsabilidade de seus autores.</p>
        </div>
      </div>
    </footer>
  );
}
