'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronRight, Crown, Menu, Search, Sparkles, UserRound, X } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { formatDate } from '@/lib/billing';
import { cn } from '@/lib/utils';

const links = [
  { href: '/ferramentas', label: 'Ferramentas', icon: Sparkles },
  { href: '/busca', label: 'Busca gratuita', icon: Search },
  { href: '/planos', label: 'Planos', icon: Crown }
];

export function PremiumHeader() {
  const pathname = usePathname();
  const { session, plan, usage, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = session?.user.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase() || 'RJ';

  const planSubtitle = usage.unlimited
    ? usage.premiumExpiresAt
      ? `Premium · até ${formatDate(usage.premiumExpiresAt)}`
      : 'Premium · uso ilimitado'
    : `Plano ${plan.name}`;

  // Só mostramos números de utilização quando o saldo está realmente acabando —
  // o usuário não precisa "contar usos" pra usar a ferramenta no dia a dia.
  const usageLow = !usage.unlimited && usage.remaining !== null && usage.remaining <= 1;

  const usageSubtitle = usage.unlimited
    ? 'Uso ilimitado de ferramentas'
    : usageLow
      ? usage.remaining === 0
        ? 'Saldo de ferramentas esgotado'
        : `Restam ${usage.remaining} de ${usage.limit} usos`
      : null;

  return (
    <header className="sticky top-8 z-[100] border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0" aria-label="Página inicial">
          <Logo variant="app" />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                  active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {plan.id === 'premium' ? (
                <Link
                  href="/conta"
                  className="hidden items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-900 sm:inline-flex"
                >
                  <Crown className="h-3.5 w-3.5" />
                  Uso ilimitado
                </Link>
              ) : usageLow ? (
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <Link href="/conta?upgrade=premium">
                    <Crown className="h-3.5 w-3.5 text-amber-200" />
                    Liberar ilimitado
                  </Link>
                </Button>
              ) : null}
              <Link
                href="/conta"
                className={`hidden min-w-0 max-w-[240px] items-center gap-3 rounded-2xl border px-3 py-2 transition xl:flex ${
                  usage.unlimited
                    ? 'border-emerald-200 bg-emerald-50 hover:border-emerald-300'
                    : 'border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-sky-50'
                }`}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-xs font-black text-white">
                  {initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-900">{session?.user.name}</span>
                  <span className="block text-xs font-medium text-slate-600">{planSubtitle}</span>
                  {usageSubtitle ? (
                    <span className="block text-xs font-medium text-slate-600">{usageSubtitle}</span>
                  ) : null}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
              </Link>
              <Link
                href="/conta"
                className="hidden h-9 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-bold text-slate-800 sm:flex xl:hidden"
                aria-label={`Minha conta, plano ${plan.name}`}
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-900 text-[10px] text-white">{initials}</span>
                {usage.unlimited ? 'Premium' : usageLow && usage.remaining === 0 ? 'Esgotado' : plan.name}
              </Link>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild className="hidden sm:inline-flex">
                <Link href="/cadastro">Criar conta grátis</Link>
              </Button>
            </>
          )}

          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
            onClick={() => setMobileOpen((current) => !current)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <nav className="mx-auto grid max-w-[1600px] gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            {isAuthenticated ? (
              <>
                {plan.id === 'premium' ? (
                  <div className="mt-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">
                    Premium · uso ilimitado
                    {usage.premiumExpiresAt ? ` até ${formatDate(usage.premiumExpiresAt)}` : ''}
                  </div>
                ) : usageLow ? (
                  <Button asChild className="mt-2">
                    <Link href="/conta?upgrade=premium" onClick={() => setMobileOpen(false)}>
                      <Crown className="h-4 w-4 text-amber-200" />
                      Liberar ilimitado por 1 mês
                    </Link>
                  </Button>
                ) : null}
                <Link
                  href="/conta"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 flex items-center gap-3 rounded-2xl bg-slate-900 p-4 text-white"
                >
                  <UserRound className="h-5 w-5" />
                  <span>
                    <span className="block text-sm font-bold">{session?.user.name}</span>
                    <span className="block text-xs text-slate-300">
                      {usage.unlimited ? planSubtitle : usageLow ? usageSubtitle : `Plano ${plan.name}`}
                    </span>
                  </span>
                </Link>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button asChild variant="outline">
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link href="/cadastro">Criar conta</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
