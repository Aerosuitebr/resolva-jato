'use client';

import { useMemo, useState } from 'react';
import { Copy, MessageCircle, Plus, Trash2, Users } from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { PageHero } from '@/components/shared/page-hero';
import { ToolsBackButton } from '@/components/shared/tools-back-button';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { formatCurrency, formatCurrencyInput, parseCurrency } from '@/lib/formatters';
import { calcularDivisao } from '@/lib/divisor-conta/calc';
import { cn } from '@/lib/utils';

interface PessoaForm {
  nome: string;
  consumoExtraInput: string;
}

export function DivisorContaApp() {
  const { toast } = useToast();
  const [valorTotalInput, setValorTotalInput] = useState('');
  const [taxaServico, setTaxaServico] = useState(10);
  const [dividirIgualmente, setDividirIgualmente] = useState(true);
  const [pessoas, setPessoas] = useState<PessoaForm[]>([
    { nome: 'Pessoa 1', consumoExtraInput: '' },
    { nome: 'Pessoa 2', consumoExtraInput: '' }
  ]);

  const valorTotal = parseCurrency(valorTotalInput);

  function addPessoa() {
    setPessoas((prev) => [...prev, { nome: `Pessoa ${prev.length + 1}`, consumoExtraInput: '' }]);
  }

  function removerPessoa(idx: number) {
    setPessoas((prev) => prev.filter((_, i) => i !== idx));
  }

  function atualizarNome(idx: number, nome: string) {
    setPessoas((prev) => prev.map((p, i) => (i === idx ? { ...p, nome } : p)));
  }

  function atualizarConsumo(idx: number, value: string) {
    setPessoas((prev) => prev.map((p, i) => (i === idx ? { ...p, consumoExtraInput: formatCurrencyInput(value) } : p)));
  }

  const resultado = useMemo(() => {
    if (valorTotal <= 0 || pessoas.length === 0) return null;
    return calcularDivisao({
      valorTotal,
      pessoas: pessoas.map((p) => ({ nome: p.nome || 'Sem nome', consumoExtra: parseCurrency(p.consumoExtraInput) })),
      taxaServicoPercentual: taxaServico,
      dividirIgualmente
    });
  }, [valorTotal, pessoas, taxaServico, dividirIgualmente]);

  function resumoTexto() {
    if (!resultado) return '';
    const linhas = resultado.porPessoa.map((p) => `• ${p.nome}: ${formatCurrency(p.total)}`).join('\n');
    return [
      '*Divisão da conta — Resolva Jato*',
      `Valor total (com taxa de serviço): ${formatCurrency(resultado.totalComTaxa)}`,
      '',
      linhas,
      '',
      'Divisão automática — confira antes de pagar.'
    ].join('\n');
  }

  function handleCopy() {
    navigator.clipboard.writeText(resumoTexto());
    toast('Divisão copiada!');
  }

  function handleWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(resumoTexto())}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <AuthGate title="Divisor de Conta em Grupo" description="Cadastre-se gratuitamente para dividir a conta.">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <ToolsBackButton />
        </div>

        <PageHero
          title="Divisor de Conta em Grupo"
          subtitle="Rateie o churrasco, o restaurante, a viagem ou o aluguel entre amigos — com ou sem consumo individual e taxa de serviço."
          icon={Users}
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Valor total da conta" htmlFor="valor-total" required>
                <Input
                  id="valor-total"
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  value={valorTotalInput}
                  onChange={(e) => setValorTotalInput(formatCurrencyInput(e.target.value))}
                />
              </FormField>
              <FormField label="Taxa de serviço (%)" htmlFor="taxa">
                <Input
                  id="taxa"
                  type="number"
                  min={0}
                  max={30}
                  value={taxaServico}
                  onChange={(e) => setTaxaServico(Math.max(0, Number(e.target.value) || 0))}
                />
              </FormField>
            </div>

            <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                checked={dividirIgualmente}
                onChange={(e) => setDividirIgualmente(e.target.checked)}
              />
              Dividir tudo igualmente (ignora consumo individual)
            </label>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">Participantes</p>
              <div className="space-y-2">
                {pessoas.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={p.nome}
                      onChange={(e) => atualizarNome(idx, e.target.value)}
                      placeholder={`Pessoa ${idx + 1}`}
                      className="flex-1"
                    />
                    {!dividirIgualmente ? (
                      <Input
                        inputMode="numeric"
                        placeholder="Consumo extra"
                        value={p.consumoExtraInput}
                        onChange={(e) => atualizarConsumo(idx, e.target.value)}
                        className="w-36"
                      />
                    ) : null}
                    <button
                      type="button"
                      onClick={() => removerPessoa(idx)}
                      disabled={pessoas.length <= 1}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                      aria-label={`Remover ${p.nome}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-2" onClick={addPessoa} icon={Plus}>
                Adicionar pessoa
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="rj-display mb-3 text-base font-bold text-slate-900">Quanto cada um paga</h2>
            {!resultado ? (
              <p className="text-sm font-medium text-slate-500">Informe o valor total e os participantes.</p>
            ) : (
              <div className="space-y-3">
                <ul className="space-y-2">
                  {resultado.porPessoa.map((p) => (
                    <li key={p.nome} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900">{p.nome}</p>
                        <span className="rj-display text-base font-bold text-sky-700">{formatCurrency(p.total)}</span>
                      </div>
                      {!dividirIgualmente ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Comum: {formatCurrency(p.parteComum)} · Individual: {formatCurrency(p.consumoExtra)} · Taxa:{' '}
                          {formatCurrency(p.taxaServico)}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
                  <span className="text-sm font-semibold">Total com taxa de serviço</span>
                  <span className="rj-display text-lg font-bold">{formatCurrency(resultado.totalComTaxa)}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy} icon={Copy}>
                    Copiar divisão
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
