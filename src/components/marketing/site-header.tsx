'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { AuthAwareLink } from '@/components/auth/auth-aware-link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const links = [
  { href: '/busca', label: 'Busca grátis', auth: false },
  { href: '/ferramentas', label: 'Ferramentas', auth: true }
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-3.5">
        <Link href="/" className="min-w-0 shrink-0" aria-label="Página inicial Resolva Jato">
          <Logo variant="marketing" className="h-12 sm:h-14 lg:h-[4.25rem]" />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const className = cn(
              'rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors',
              pathname === link.href || pathname.startsWith(`${link.href}/`)
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            );
            if (link.auth) {
              return (
                <AuthAwareLink key={link.href} href={link.href} className={className}>
                  {link.label}
                </AuthAwareLink>
              );
            }
            return (
              <Link key={link.href} href={link.href} className={className}>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button asChild className="hidden sm:inline-flex">
              <Link href="/ferramentas">Minhas ferramentas</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link href="/cadastro">Criar conta grátis</Link>
              </Button>
            </>
          )}
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden"
            onClick={() => setMobileOpen((current) => !current)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="mx-auto grid max-w-6xl gap-2">
            {links.map((link) => {
              const className =
                'rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100';
              if (link.auth) {
                return (
                  <AuthAwareLink
                    key={link.href}
                    href={link.href}
                    className={className}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </AuthAwareLink>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={className}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            {isAuthenticated ? (
              <Button asChild className="mt-2">
                <Link href="/ferramentas" onClick={() => setMobileOpen(false)}>
                  Minhas ferramentas
                </Link>
              </Button>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button asChild variant="outline">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    Entrar
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/cadastro" onClick={() => setMobileOpen(false)}>
                    Criar conta
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
