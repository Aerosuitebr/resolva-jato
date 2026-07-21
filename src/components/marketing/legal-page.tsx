import Link from 'next/link';
import type { ReactNode } from 'react';
import { AuthShell } from '@/components/brand/auth-shell';

export function LegalPage({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <AuthShell subtitle={subtitle}>
      <article className="space-y-5 text-left text-sm leading-7 text-slate-700">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {children}
        <p className="border-t border-slate-200 pt-4 text-xs text-slate-500">
          Dúvidas?{' '}
          <Link href="/contato" className="font-semibold text-sky-700 hover:text-sky-800">
            Fale conosco
          </Link>
          .
        </p>
      </article>
    </AuthShell>
  );
}
