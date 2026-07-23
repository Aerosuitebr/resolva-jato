'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, Copy, MessageCircle, Plus, Trash2 } from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { PageHero } from '@/components/shared/page-hero';
import { ToolsBackButton } from '@/components/shared/tools-back-button';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import {
  formatarMinutos,
  gerarCronograma,
  nomeDia,
  type Materia
} from '@/lib/cronograma-estudos/gerar';
import { cn } from '@/lib/utils';

const DIAS_LABEL = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CronogramaEstudosApp() {
  const { toast } = useToast();
  const [materias, setMaterias] = useState<Materia[]>([
    { nome: 'Matemática', peso: 4 },
    { nome: 'Português', peso: 3 },
    { nome: 'Redação', peso: 3 }
  ]);
  const [novaMateria, setNovaMateria] = useState('');
  const [diasSemana, setDiasSemana] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [horasPorDia, setHorasPorDia] = useState(2);
  const [semanas, setSemanas] = useState(4);
  const [incluirRevisao, setIncluirRevisao] = useState(true);

  const cronograma = useMemo(() => {
    if (materias.length === 0 || diasSemana.length === 0) return [];
    return gerarCronograma({ materias, diasSemana, horasPorDia, semanas, incluirRevisao });
  }, [materias, diasSemana, horasPorDia, semanas, incluirRevisao]);

  function addMateria() {
    const nome = novaMateria.trim();
    if (!nome) return;
    setMaterias((prev) => [...prev, { nome, peso: 3 }]);
    setNovaMateria('');
  }

  function removerMateria(nome: string) {
    setMaterias((prev) => prev.filter((m) => m.nome !== nome));
  }

  function atualizarPeso(nome: string, peso: number) {
    setMaterias((prev) => prev.map((m) => (m.nome === nome ? { ...m, peso } : m)));
  }

  function toggleDia(dia: number) {
    setDiasSemana((prev) => (prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia].sort()));
  }

  function resumoTexto() {
    if (cronograma.length === 0) return '';
    const primeiraSemana = cronograma.filter((d) => d.semana === 1);
    const linhas = primeiraSemana
      .map((dia) => {
        const sessoes = dia.sessoes.map((s) => `${s.materia} (${formatarMinutos(s.minutos)})`).join(', ');
        return `${nomeDia(dia.diaSemana)}: ${sessoes}`;
      })
      .join('\n');
    return [
      '*Cronograma de Estudos — Resolva Jato*',
      `${semanas} semana(s) · ${horasPorDia}h/dia · ${materias.length} matéria(s)`,
      '',
      'Semana 1 (modelo, se repete nas demais):',
      linhas,
      '',
      'Gerado automaticamente com base no peso/dificuldade de cada matéria.'
    ].join('\n');
  }

  function handleCopy() {
    navigator.clipboard.writeText(resumoTexto());
    toast('Cronograma copiado!');
  }

  function handleWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(resumoTexto())}`, '_blank', 'noopener,noreferrer');
  }

  const semana1 = cronograma.filter((d) => d.semana === 1);

  return (
    <AuthGate title="Gerador de Cronograma de Estudos" description="Cadastre-se gratuitamente para montar seu cronograma.">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <ToolsBackButton />
        </div>

        <PageHero
          title="Cronograma de Estudos personalizado"
          subtitle="Informe suas matérias, dias disponíveis e carga horária — a gente monta a distribuição semanal priorizando o que é mais difícil ou mais importante."
          icon={CalendarDays}
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">Matérias e peso (dificuldade/importância)</p>
              <div className="space-y-2">
                {materias.map((m) => (
                  <div key={m.nome} className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5">
                    <span className="flex-1 truncate text-sm font-semibold text-slate-800">{m.nome}</span>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={m.peso}
                      onChange={(e) => atualizarPeso(m.nome, Number(e.target.value))}
                      className="w-24 accent-sky-600"
                    />
                    <span className="w-5 text-center text-xs font-bold text-sky-700">{m.peso}</span>
                    <button
                      type="button"
                      onClick={() => removerMateria(m.nome)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label={`Remover ${m.nome}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Input
                  placeholder="Adicionar matéria (ex: Física)"
                  value={novaMateria}
                  onChange={(e) => setNovaMateria(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMateria()}
                />
                <Button variant="outline" size="default" onClick={addMateria} icon={Plus}>
                  Adicionar
                </Button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">Dias disponíveis</p>
              <div className="flex flex-wrap gap-1.5">
                {DIAS_LABEL.map((label, idx) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleDia(idx)}
                    className={cn(
                      'h-10 min-w-[3rem] rounded-xl px-3 text-xs font-bold transition',
                      diasSemana.includes(idx)
                        ? 'bg-sky-600 text-white'
                        : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Horas de estudo por dia" htmlFor="horas-dia">
                <Input
                  id="horas-dia"
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={horasPorDia}
                  onChange={(e) => setHorasPorDia(Math.max(0.5, Number(e.target.value) || 0.5))}
                />
              </FormField>
              <FormField label="Duração (semanas)" htmlFor="semanas">
                <Input
                  id="semanas"
                  type="number"
                  min={1}
                  max={24}
                  value={semanas}
                  onChange={(e) => setSemanas(Math.min(24, Math.max(1, Number(e.target.value) || 1)))}
                />
              </FormField>
            </div>

            <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                checked={incluirRevisao}
                onChange={(e) => setIncluirRevisao(e.target.checked)}
              />
              Reservar o último dia da semana para revisão geral
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="rj-display mb-3 text-base font-bold text-slate-900">Semana modelo (repete até a semana {semanas})</h2>
            {semana1.length === 0 ? (
              <p className="text-sm font-medium text-slate-500">Adicione matérias e selecione ao menos um dia da semana.</p>
            ) : (
              <div className="space-y-2">
                {semana1.map((dia) => (
                  <div key={dia.diaSemana} className="rounded-xl border border-slate-200 p-3">
                    <p className="text-sm font-bold text-slate-900">{nomeDia(dia.diaSemana)}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {dia.sessoes.map((s, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800"
                        >
                          {s.materia} · {formatarMinutos(s.minutos)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={handleCopy} icon={Copy}>
                    Copiar cronograma
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
