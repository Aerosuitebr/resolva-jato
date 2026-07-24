"use client";

import { useMemo, useState } from "react";
import {
  Calculator,
  Copy,
  MessageCircle,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AuthGate } from "@/components/auth/auth-gate";
import { PageHero } from "@/components/shared/page-hero";
import { ToolsBackButton } from "@/components/shared/tools-back-button";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  formatCurrency,
  formatCurrencyInput,
  parseCurrency,
} from "@/lib/formatters";
import {
  calcularRescisao,
  TIPO_RESCISAO_LABEL,
  type TipoRescisao,
} from "@/lib/rescisao/calc";
import { cn } from "@/lib/utils";

const TIPOS: TipoRescisao[] = [
  "sem-justa-causa",
  "pedido-demissao",
  "justa-causa",
  "acordo-mutuo",
  "termino-contrato",
];

export function RescisaoApp() {
  const { toast } = useToast();
  const [salarioInput, setSalarioInput] = useState("");
  const [fgtsInput, setFgtsInput] = useState("");
  const [admissao, setAdmissao] = useState("");
  const [desligamento, setDesligamento] = useState("");
  const [tipo, setTipo] = useState<TipoRescisao>("sem-justa-causa");
  const [feriasVencidas, setFeriasVencidas] = useState(false);
  const [avisoIndenizado, setAvisoIndenizado] = useState(true);

  const salario = parseCurrency(salarioInput);
  const saldoFgts = parseCurrency(fgtsInput);

  const podeCalcular =
    salario > 0 &&
    Boolean(admissao) &&
    Boolean(desligamento) &&
    desligamento >= admissao;

  const resultado = useMemo(() => {
    if (!podeCalcular) return null;
    return calcularRescisao({
      salario,
      admissao,
      desligamento,
      tipo,
      feriasVencidas,
      avisoIndenizado: tipo === "sem-justa-causa" && avisoIndenizado,
      saldoFgts,
    });
  }, [
    podeCalcular,
    salario,
    admissao,
    desligamento,
    tipo,
    feriasVencidas,
    avisoIndenizado,
    saldoFgts,
  ]);

  function resumoTexto() {
    if (!resultado) return "";
    const linhas = resultado.resumoLinhas
      .map(
        (l) =>
          `• ${l.label}: ${formatCurrency(l.value)}${l.info ? ` (${l.info})` : ""}`,
      )
      .join("\n");
    return [
      `*Cálculo de Rescisão — Resolva Jato*`,
      `Modalidade: ${TIPO_RESCISAO_LABEL[tipo]}`,
      "",
      linhas,
      "",
      `*Total estimado: ${formatCurrency(resultado.totalBruto)}*`,
      "",
      resultado.temDireitoSeguroDesemprego
        ? "✔ Pode ter direito ao seguro-desemprego."
        : "✖ Sem direito automático ao seguro-desemprego nesta modalidade.",
      resultado.temDireitoSaqueFgts
        ? "✔ Pode sacar o FGTS."
        : "✖ Sem saque do FGTS nesta modalidade.",
      "",
      "Valores estimados e brutos (sem descontos de INSS/IRRF). Confirme com um contador ou advogado trabalhista.",
    ].join("\n");
  }

  function handleCopy() {
    if (!resultado) return;
    navigator.clipboard.writeText(resumoTexto());
    toast("Resumo copiado!");
  }

  function handleWhatsApp() {
    if (!resultado) return;
    const url = `https://wa.me/?text=${encodeURIComponent(resumoTexto())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <AuthGate
      title="Calculadora de Rescisão Trabalhista"
      description="Cadastre-se gratuitamente para calcular sua rescisão."
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <ToolsBackButton />
        </div>

        <PageHero
          title="Calculadora de Rescisão Trabalhista"
          subtitle="Estime saldo de salário, 13º, férias, aviso prévio e multa do FGTS em segundos. Valores aproximados — sempre confirme com um profissional."
          icon={Scale}
        />

        <div className="grid gap-2 sm:grid-cols-3">
          <Insight
            label="1"
            text="Preencha salário e datas para liberar o cálculo."
          />
          <Insight
            label="2"
            text="Escolha a modalidade: ela muda direitos e totais."
          />
          <Insight
            label="3"
            text="Copie ou envie o resumo para conferir com um profissional."
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <FormField label="Salário bruto mensal" htmlFor="salario" required>
              <Input
                id="salario"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={salarioInput}
                onChange={(e) =>
                  setSalarioInput(formatCurrencyInput(e.target.value))
                }
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Data de admissão" htmlFor="admissao" required>
                <Input
                  id="admissao"
                  type="date"
                  value={admissao}
                  onChange={(e) => setAdmissao(e.target.value)}
                />
              </FormField>
              <FormField
                label="Data de desligamento"
                htmlFor="desligamento"
                required
              >
                <Input
                  id="desligamento"
                  type="date"
                  value={desligamento}
                  onChange={(e) => setDesligamento(e.target.value)}
                />
              </FormField>
            </div>

            <FormField label="Tipo de desligamento" htmlFor="tipo" required>
              <Select
                id="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoRescisao)}
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {TIPO_RESCISAO_LABEL[t]}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField
              label="Saldo atual do FGTS"
              htmlFor="fgts"
              hint="Usado apenas para estimar a multa de 40% (ou 20% em acordo mútuo)."
            >
              <Input
                id="fgts"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={fgtsInput}
                onChange={(e) =>
                  setFgtsInput(formatCurrencyInput(e.target.value))
                }
              />
            </FormField>

            <div className="flex flex-col gap-2.5">
              <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                  checked={feriasVencidas}
                  onChange={(e) => setFeriasVencidas(e.target.checked)}
                />
                Tem férias vencidas (período completo não usufruído)
              </label>
              {tipo === "sem-justa-causa" ? (
                <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                    checked={avisoIndenizado}
                    onChange={(e) => setAvisoIndenizado(e.target.checked)}
                  />
                  Aviso prévio indenizado (empresa dispensou o cumprimento)
                </label>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
              <div className="mb-3 flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                  <Calculator className="h-4 w-4" aria-hidden />
                </span>
                <h2 className="rj-display text-base font-bold text-slate-900">
                  Resultado estimado
                </h2>
              </div>

              {!resultado ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-800">
                    Resultado aparece aqui automaticamente.
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Preencha salário, admissão, desligamento e modalidade para
                    visualizar cada verba da rescisão.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <ul className="divide-y divide-slate-100 text-sm">
                    {resultado.resumoLinhas.map((linha) => (
                      <li
                        key={linha.label}
                        className="flex items-center justify-between gap-3 py-2"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">
                            {linha.label}
                          </p>
                          {linha.info ? (
                            <p className="text-xs text-slate-500">
                              {linha.info}
                            </p>
                          ) : null}
                        </div>
                        <span className="shrink-0 font-bold text-slate-900">
                          {formatCurrency(linha.value)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
                    <span className="text-sm font-semibold">
                      Total bruto estimado
                    </span>
                    <span className="rj-display text-lg font-bold">
                      {formatCurrency(resultado.totalBruto)}
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold",
                        resultado.temDireitoSeguroDesemprego
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-slate-50 text-slate-600",
                      )}
                    >
                      <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
                      {resultado.temDireitoSeguroDesemprego
                        ? "Pode ter seguro-desemprego"
                        : "Sem seguro-desemprego automático"}
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold",
                        resultado.temDireitoSaqueFgts
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-slate-50 text-slate-600",
                      )}
                    >
                      <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
                      {resultado.temDireitoSaqueFgts
                        ? "Pode sacar o FGTS"
                        : "Sem saque do FGTS"}
                    </div>
                  </div>

                  <p className="text-xs leading-5 text-slate-500">
                    Valores brutos, sem descontos de INSS/IRRF, e não incluem
                    eventuais horas extras, comissões ou verbas variáveis.
                    Estimativa educativa — confirme com contador ou advogado
                    trabalhista.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={handleCopy}
                      icon={Copy}
                    >
                      Copiar resumo
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={handleWhatsApp}
                      icon={MessageCircle}
                    >
                      Enviar no WhatsApp
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}

function Insight({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-sky-100 bg-sky-50/70 p-3 text-xs font-semibold leading-5 text-slate-700">
      <span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full bg-sky-600 px-1.5 text-[0.68rem] text-white">
        {label}
      </span>
      <span>{text}</span>
      <Sparkles
        className="ml-auto hidden h-4 w-4 shrink-0 text-sky-500 sm:block"
        aria-hidden
      />
    </div>
  );
}
