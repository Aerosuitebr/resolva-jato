'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/use-auth';
import { formatToolUsageLabel } from '@/lib/billing';

interface SidebarUserCardProps {
  collapsed: boolean;
}

export function SidebarUserCard({ collapsed }: SidebarUserCardProps) {
  const router = useRouter();
  const { session, plan, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    if (collapsed) {
      return (
        <div className="flex justify-center border-b border-white/10 px-3 py-4">
          <Tooltip label="Entrar">
            <Button variant="ghost" size="icon" className="text-slate-300 hover:bg-sky-400/20 hover:text-white" onClick={() => router.push('/login')}>
              <LogOut className="h-4 w-4 rotate-180" />
            </Button>
          </Tooltip>
        </div>
      );
    }

    return (
      <section className="border-b border-white/10 bg-black/10 px-4 py-4">
        <p className="text-sm font-bold text-white">Acesse suas ferramentas</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">Cadastro grátis com 5 utilizações. A busca continua aberta.</p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" className="flex-1" onClick={() => router.push('/cadastro')}>
            Criar conta
          </Button>
          <Button size="sm" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10" onClick={() => router.push('/login')}>
            Entrar
          </Button>
        </div>
      </section>
    );
  }

  const fallback = session?.user.name?.charAt(0).toUpperCase() || 'U';

  if (collapsed) {
    return (
      <div className="flex justify-center border-b border-white/10 px-3 py-4">
        <Tooltip label={`${session?.user.name} - ${plan.name}`}>
          <Avatar fallback={fallback} />
        </Tooltip>
      </div>
    );
  }

  return (
    <section className="border-b border-white/10 bg-black/10 px-4 py-4">
      <div className="flex items-center gap-3">
        <Avatar fallback={fallback} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">{session?.user.name}</p>
          <p className="truncate text-xs font-medium text-slate-400">
            {plan.id === 'premium' ? 'Premium · uso ilimitado' : `${plan.name} · ${formatToolUsageLabel()}`}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:bg-red-500/15 hover:text-red-200"
          aria-label="Sair"
          onClick={() => {
            logout();
            router.push('/');
          }}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
      <Button asChild size="sm" variant="outline" className="mt-3 w-full border-white/15 bg-white/5 text-white hover:bg-white/10">
        <Link href="/conta">Gerenciar plano</Link>
      </Button>
    </section>
  );
}
