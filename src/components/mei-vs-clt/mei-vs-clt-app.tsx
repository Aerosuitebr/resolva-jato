"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Copy,
  MessageCircle,
  Scale,
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
  FAIXA_MEI_LABEL,
  simularClt,
  simularMei,
  type FaixaMei,
} from "@/lib/mei-vs-clt/calc";
import { cn } from "@/lib/utils";

const FAIXAS: FaixaMei[] = [
  "comercio-industria",
  "servicos",
  "comercio-e-servicos",
];

export function MeiVsCltApp() {
  const { toast } = useToast();
  const [salarioCltInput, setSalarioCltInput] = useState("");
  const [dependentes, setDependentes] = useState(0);
  const [vtInput, setVtInput] = useState("");
  const [planoInput, setPlanoInput] = useState("");

  const [faturamentoInput, setFaturamentoInput] = useState("");
  const [faixa, setFaixa] = useState<FaixaMei>("servicos");
  const [custosInput, setCustosInput] = useState("");

  const salarioClt = parseCurrency(salarioCltInput);
  const vt = parseCurrency(vtInput);
  const plano = parseCurrency(planoInput);
  const faturamento = parseCurrency(faturamentoInput);
  const custos = parseCurrency(custosInput);

  const resultadoClt = useMemo(() => {
    if (salarioClt <= 0) return null;
    return simularClt({
      salarioBruto: salarioClt,
      dependentes,
      valeTransporte: vt,
      planoSaude: plano,
    });
  }, [salarioClt, dependentes, vt, plano]);

  const resultadoMei = useMemo(() => {
    if (faturamento <= 0) return null;
    return simularMei({
      faturamentoMensal: faturamento,
      faixa,
      custosMensais: custos,
    });
  }, [faturamento, faixa, custos]);

  const diferenca =
    resultadoClt && resultadoMei
      ? resultadoMei.lucroLiquido - resultadoClt.liquidoMensalEquivalente
      : null;

  function resumoTexto() {
    if (!resultadoClt || !resultadoMei) return "";
    return [
      "*MEI vs CLT — Resolva Jato*",
      "",
      `CLT — líquido mensal médio (com 13º e férias diluídos): ${formatCurrency(resultadoClt.liquidoMensalEquivalente)}`,
      `MEI — lucro líquido mensal estimado: ${formatCurrency(resultadoMei.lucroLiquido)}`,
      "",
      diferenca !== null
        ? diferenca >= 0
          ? `Como MEI você ficaria ~${formatCurrency(diferenca)} melhor por mês nesse cenário.`
          : `Como CLT você ficaria ~${formatCurrency(Math.abs(diferenca))} melhor por mês nesse cenário.`
        : "",
      resultadoMei.ultrapassaLimite
        ? "⚠ Faturamento projetado ultrapassa o limite anual do MEI (R$ 81.000)."
        : "",
      "",
      "Simulação educativa, não considera FGTS, benefícios, estabilidade nem custos de formalização. Consulte um contador antes de decidir.",
    ]
      .filter(Boolean)
      .join("\n");
  }

  function handleCopy() {
    navigator.clipboard.writeText(resumoTexto());
    toast("Comparativo copiado!");
  }

  function handleWhatsApp() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(resumoTexto())}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <AuthGate
      title="Simulador MEI vs CLT"
      description="Cadastre-se gratuitamente para comparar os dois cenários."
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <ToolsBackButton />
        </div>

        <PageHero
          title="MEI vs CLT: qual compensa mais?"
          subtitle="Compare o líquido mensal como CLT com o lucro estimado como MEI para decidir com números, não com achismo."
          icon={Scale}
        />

        <div className="grid gap-2 sm:grid-cols-3">
          <Insight
            label="CLT"
            text="Mostra líquido real, descontos e média com 13º/férias."
          />
          <Insight
            label="MEI"
            text="Considera DAS, custos e limite anual do MEI."
          />
          <Insight
            label="Decisão"
            text="Compare dinheiro, risco, benefícios e estabilidade."
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="rj-display text-base font-bold text-slate-900">
              Cenário CLT
            </h2>
            <FormField
              label="Salário bruto mensal"
              htmlFor="salario-clt"
              required
            >
              <Input
                id="salario-clt"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={salarioCltInput}
                onChange={(e) =>
                  setSalarioCltInput(formatCurrencyInput(e.target.value))
                }
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Dependentes (IR)" htmlFor="dependentes">
                <Input
                  id="dependentes"
                  type="number"
                  min={0}
                  value={dependentes}
                  onChange={(e) =>
                    setDependentes(Math.max(0, Number(e.target.value) || 0))
                  }
                />
              </FormField>
              <FormField label="Vale-transporte (mensal)" htmlFor="vt">
                <Input
                  id="vt"
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  value={vtInput}
                  onChange={(e) =>
                    setVtInput(formatCurrencyInput(e.target.value))
                  }
                />
              </FormField>
            </div>
            <FormField label="Plano de saúde (desconto mensal)" htmlFor="plano">
              <Input
                id="plano"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={planoInput}
                onChange={(e) =>
                  setPlanoInput(formatCurrencyInput(e.target.value))
                }
              />
            </FormField>

            {resultadoClt ? (
              <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
                <Row label="INSS" value={resultadoClt.inss} />
                <Row label="IRRF" value={resultadoClt.irrf} />
                <Row label="Vale-transporte" value={resultadoClt.descontoVt} />
                <Row label="Plano de saúde" value={resultadoClt.planoSaude} />
                <Row
                  label="FGTS depositado (não é líquido, fica retido)"
                  value={resultadoClt.fgtsMensal}
                  muted
                />
                <div className="flex items-center justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
                  <span>Líquido mensal (mês normal)</span>
                  <span>{formatCurrency(resultadoClt.salarioLiquido)}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-emerald-700">
                  <span>Líquido médio com 13º/férias diluídos</span>
                  <span>
                    {formatCurrency(resultadoClt.liquidoMensalEquivalente)}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="rj-display text-base font-bold text-slate-900">
              Cenário MEI
            </h2>
            <FormField
              label="Faturamento mensal estimado"
              htmlFor="faturamento"
              required
            >
              <Input
                id="faturamento"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={faturamentoInput}
                onChange={(e) =>
                  setFaturamentoInput(formatCurrencyInput(e.target.value))
                }
              />
            </FormField>
            <FormField label="Atividade" htmlFor="faixa">
              <Select
                id="faixa"
                value={faixa}
                onChange={(e) => setFaixa(e.target.value as FaixaMei)}
              >
                {FAIXAS.map((f) => (
                  <option key={f} value={f}>
                    {FAIXA_MEI_LABEL[f]}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField
              label="Custos mensais do negócio"
              htmlFor="custos"
              hint="Materiais, ferramentas, transporte, aluguel, etc."
            >
              <Input
                id="custos"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={custosInput}
                onChange={(e) =>
                  setCustosInput(formatCurrencyInput(e.target.value))
                }
              />
            </FormField>

            {resultadoMei ? (
              <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
                <Row
                  label="DAS (imposto mensal MEI)"
                  value={resultadoMei.das}
                />
                <Row
                  label="Custos do negócio"
                  value={resultadoMei.custosMensais}
                />
                <div className="flex items-center justify-between border-t border-slate-200 pt-2 font-bold text-emerald-700">
                  <span>Lucro líquido mensal</span>
                  <span>{formatCurrency(resultadoMei.lucroLiquido)}</span>
                </div>
                {resultadoMei.ultrapassaLimite ? (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-xs font-semibold text-amber-900">
                    <AlertTriangle
                      className="mt-0.5 h-4 w-4 shrink-0"
                      aria-hidden
                    />
                    Faturamento anual projetado ultrapassa o limite do MEI (R$
                    81.000/ano). Considere migrar para ME/Simples Nacional.
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          {!resultadoClt || !resultadoMei ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-800">
                Comparativo liberado quando os dois cenários estiverem
                preenchidos.
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Informe salário CLT e faturamento MEI para ver quem compensa
                mais no mês.
              </p>
            </div>
          ) : (
            <>
              <h2 className="rj-display mb-3 text-base font-bold text-slate-900">
                Comparativo
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-3 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    CLT (médio/mês)
                  </p>
                  <p className="rj-display mt-1 text-xl font-bold text-slate-900">
                    {formatCurrency(resultadoClt.liquidoMensalEquivalente)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    MEI (lucro/mês)
                  </p>
                  <p className="rj-display mt-1 text-xl font-bold text-slate-900">
                    {formatCurrency(resultadoMei.lucroLiquido)}
                  </p>
                </div>
              </div>

              {diferenca !== null ? (
                <p
                  className={cn(
                    "mt-3 rounded-xl px-4 py-3 text-center text-sm font-bold",
                    diferenca >= 0
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-sky-50 text-sky-800",
                  )}
                >
                  {diferenca >= 0
                    ? `Como MEI, ~${formatCurrency(diferenca)} a mais por mês nesse cenário.`
                    : `Como CLT, ~${formatCurrency(Math.abs(diferenca))} a mais por mês nesse cenário.`}
                </p>
              ) : null}

              <p className="mt-3 text-xs leading-5 text-slate-500">
                Simulação educativa: não considera FGTS acumulado, estabilidade,
                benefícios, 13º/férias do MEI (não existem) nem custos de
                abertura/fechamento. Consulte um contador antes de decidir.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none"
                  onClick={handleCopy}
                  icon={Copy}
                >
                  Copiar comparativo
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
            </>
          )}
        </div>
      </div>
    </AuthGate>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: number;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        muted && "text-slate-500",
      )}
    >
      <span className="font-medium">{label}</span>
      <span className="font-bold">{formatCurrency(value)}</span>
    </div>
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
