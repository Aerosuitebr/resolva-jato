'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Copy, GraduationCap, MessageCircle } from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { PageHero } from '@/components/shared/page-hero';
import { ToolsBackButton } from '@/components/shared/tools-back-button';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { analisarRedacao } from '@/lib/redacao-enem/analyze';
import { cn } from '@/lib/utils';

export function RedacaoEnemApp() {
  const { toast } = useToast();
  const [tema, setTema] = useState('');
  const [texto, setTexto] = useState('');

  const resultado = useMemo(() => {
    if (texto.trim().split(/\s+/).filter(Boolean).length < 20) return null;
    return analisarRedacao(texto);
  }, [texto]);

  function resumoTexto() {
    if (!resultado) return '';
    const linhas = resultado.competencias
      .map((c) => `C${c.id} - ${c.titulo}: ${c.nota}/200`)
      .join('\n');
    return [
      '*Correção estimada de redação ENEM — Resolva Jato*',
      tema ? `Tema: ${tema}` : '',
      '',
      linhas,
      '',
      `*Nota estimada total: ${resultado.notaTotalEstimada}/1000*`,
      '',
      'Estimativa automática baseada em heurísticas de estrutura, coesão e proposta de intervenção — não substitui a correção de um professor ou corretor humano do ENEM.'
    ]
      .filter(Boolean)
      .join('\n');
  }

  function handleCopy() {
    navigator.clipboard.writeText(resumoTexto());
    toast('Resultado copiado!');
  }

  function handleWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(resumoTexto())}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <AuthGate title="Corretor de Redação ENEM" description="Cadastre-se gratuitamente para receber a estimativa da sua redação.">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <ToolsBackButton />
        </div>

        <PageHero
          title="Corretor de Redação ENEM"
          subtitle="Cole sua redação e receba uma estimativa de nota por competência, com pontos fortes e alertas para revisar antes da prova."
          icon={GraduationCap}
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <FormField label="Tema da redação (opcional)" htmlFor="tema">
              <Input id="tema" placeholder="Ex: Desafios para o combate à desinformação no Brasil" value={tema} onChange={(e) => setTema(e.target.value)} />
            </FormField>

            <FormField
              label="Texto da redação"
              htmlFor="texto"
              required
              hint="Cole os 4-5 parágrafos separados por linha em branco, como no papel de prova."
            >
              <textarea
                id="texto"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Cole aqui o texto completo da sua redação..."
                rows={16}
                className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all duration-150 placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </FormField>
            <p className="text-xs text-slate-500">
              {texto.trim() ? `${texto.trim().split(/\s+/).filter(Boolean).length} palavra(s)` : 'Escreva ao menos 20 palavras para ver a estimativa.'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="rj-display mb-3 text-base font-bold text-slate-900">Estimativa</h2>
            {!resultado ? (
              <p className="text-sm font-medium text-slate-500">Cole sua redação ao lado para ver a nota estimada.</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
                  <span className="text-sm font-semibold">Nota estimada total</span>
                  <span className="rj-display text-lg font-bold">{resultado.notaTotalEstimada}/1000</span>
                </div>

                <ul className="space-y-2">
                  {resultado.competencias.map((c) => (
                    <li key={c.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-800">
                          C{c.id} · {c.titulo}
                        </p>
                        <span className="rj-display text-sm font-bold text-sky-700">{c.nota}/200</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-sky-500"
                          style={{ width: `${(c.nota / 200) * 100}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{c.comentario}</p>
                    </li>
                  ))}
                </ul>

                {resultado.pontosFortes.length > 0 ? (
                  <div className="space-y-1.5 rounded-xl bg-emerald-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Pontos fortes</p>
                    {resultado.pontosFortes.map((p, i) => (
                      <p key={i} className="flex items-start gap-1.5 text-xs font-medium text-emerald-800">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                        {p}
                      </p>
                    ))}
                  </div>
                ) : null}

                {resultado.alertas.length > 0 ? (
                  <div className="space-y-1.5 rounded-xl bg-amber-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-900">Pontos de atenção</p>
                    {resultado.alertas.map((a, i) => (
                      <p key={i} className="flex items-start gap-1.5 text-xs font-medium text-amber-900">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                        {a}
                      </p>
                    ))}
                  </div>
                ) : null}

                <p className="text-xs leading-5 text-slate-500">
                  Estimativa automática baseada em heurísticas de estrutura, coesão e proposta de intervenção. Não
                  substitui a correção humana — use como um primeiro raio-x antes de pedir revisão de um professor.
                </p>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy} icon={Copy}>
                    Copiar resultado
                  </Button>
                  <Button variant="success" size="sm" onClick={handleWhatsApp} icon={MessageCircle}>
                    Enviar no WhatsApp
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
