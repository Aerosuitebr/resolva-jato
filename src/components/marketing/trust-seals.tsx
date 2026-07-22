import { FileText, Lock, Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const SEALS = [
  { icon: FileText, label: 'Documentos profissionais', detail: 'PDF pronto para enviar' },
  { icon: Sparkles, label: 'Totalmente grátis', detail: 'Sem cartão' },
  { icon: Search, label: 'Busca gratuita', detail: 'Links úteis sem cadastro' },
  { icon: Lock, label: 'Dados protegidos', detail: 'HTTPS / SSL' }
] as const;

export function TrustSeals({
  className,
  tone = 'light'
}: {
  className?: string;
  tone?: 'light' | 'dark';
}) {
  const isDark = tone === 'dark';

  return (
    <ul
      className={cn(
        'grid gap-3 sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
      aria-label="Selos de confiança"
    >
      {SEALS.map(({ icon: Icon, label, detail }) => (
        <li
          key={label}
          className={cn(
            'flex items-center gap-3 rounded-2xl border px-4 py-3',
            isDark
              ? 'border-white/10 bg-white/5 text-white'
              : 'border-slate-200 bg-white text-slate-800 shadow-sm'
          )}
        >
          <span
            className={cn(
              'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
              isDark ? 'bg-emerald-400/15 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold leading-5">{label}</span>
            <span className={cn('block text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>{detail}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
