'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthGate } from '@/components/auth/auth-gate';
import { PageHero } from '@/components/shared/page-hero';
import { useAuth } from '@/hooks/use-auth';
import { toolsCatalog } from '@/lib/tools-catalog';

interface ToolWorkspaceProps {
  toolId: string;
  bullets: string[];
}

export function ToolWorkspace({ toolId, bullets }: ToolWorkspaceProps) {
  const router = useRouter();
  const { usage, plan } = useAuth();
  const [started, setStarted] = useState(false);
  const tool = toolsCatalog.find((item) => item.id === toolId);

  if (!tool) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-700">Ferramenta não encontrada.</div>;
  }

  function handleStart() {
    setStarted(true);
  }

  return (
    <AuthGate
      title={`${tool.name} exige cadastro`}
      description="Crie sua conta gratuita para liberar as ferramentas. Você ganha 5 utilizações para testar antes de assinar o Premium."
    >
      <div className="space-y-5">
        <PageHero
          title={tool.name}
          subtitle={tool.description}
          icon={tool.icon}
          actions={
            <Button variant="outline" onClick={() => router.push('/ferramentas')}>
              Voltar
            </Button>
          }
        />

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-sky-700">{tool.status}</span>
              {tool.premiumOnly ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">Premium</span>
              ) : null}
            </div>
            <h2 className="text-xl font-bold text-slate-900">Workspace em evolução</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Esta ferramenta já está posicionada no produto e pronta para receber o editor completo. Abrir o workspace não consome saldo; uma utilização será debitada somente ao salvar uma tarefa.
            </p>
            <ul className="mt-5 space-y-3">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                  {bullet}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              {!started ? (
                <Button onClick={handleStart}>
                  Iniciar utilização
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Workspace aberto
                </Button>
              )}
              <Button asChild variant="outline">
                <Link href="/conta">Ver meu plano</Link>
              </Button>
            </div>
          </article>

          <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Sparkles className="h-4 w-4 text-sky-600" />
              Seu acesso agora
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p>
                Plano atual: <strong className="text-slate-900">{plan.name}</strong>
              </p>
              <p>
                Utilizações: <strong className="text-slate-900">{usage.unlimited ? 'Ilimitadas' : `${usage.current}/${usage.limit}`}</strong>
              </p>
              <p>
                Busca de recursos: <strong className="text-slate-900">sempre gratuita</strong>
              </p>
            </div>
            {!usage.unlimited && usage.remaining !== null && usage.remaining <= 1 ? (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                Você está perto do limite do plano grátis. O Premium libera uso ilimitado por R$ 4,99/mês.
              </div>
            ) : null}
          </aside>
        </section>
      </div>
    </AuthGate>
  );
}
