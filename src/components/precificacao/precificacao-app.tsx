"use client";

import { useMemo, useState } from "react";
import { Copy, MessageCircle, Sparkles, Tag } from "lucide-react";
import { AuthGate } from "@/components/auth/auth-gate";
import { PageHero } from "@/components/shared/page-hero";
import { ToolsBackButton } from "@/components/shared/tools-back-button";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  formatCurrency,
  formatCurrencyInput,
  parseCurrency,
} from "@/lib/formatters";
import { calcularPrecificacao } from "@/lib/precificacao/calc";
import { cn } from "@/lib/utils";

export function PrecificacaoApp() {
  const { toast } = useToast();
  const [custoDiretoInput, setCustoDiretoInput] = useState("");
  const [custosFixosInput, setCustosFixosInput] = useState("");
  const [vendasMensais, setVendasMensais] = useState(30);
  const [horas, setHoras] = useState(1);
  const [valorHoraInput, setValorHoraInput] = useState("");
  const [taxaCartao, setTaxaCartao] = useState(4.99);
  const [imposto, setImposto] = useState(6);
  const [margem, setMargem] = useState(20);

  const custoDireto = parseCurrency(custoDiretoInput);
  const custosFixos = parseCurrency(custosFixosInput);
  const valorHora = parseCurrency(valorHoraInput);

  const resultado = useMemo(() => {
    const temBase =
      custoDireto > 0 || custosFixos > 0 || (horas > 0 && valorHora > 0);
    if (!temBase) return null;
    return calcularPrecificacao({
      custoDireto,
      custosFixosMensais: custosFixos,
      vendasMensaisEstimadas: vendasMensais,
      horasTrabalhadas: horas,
      valorHora,
      taxasCartaoPercentual: taxaCartao,
      impostoPercentual: imposto,
      margemLucroDesejadaPercentual: margem,
    });
  }, [
    custoDireto,
    custosFixos,
    vendasMensais,
    horas,
    valorHora,
    taxaCartao,
    imposto,
    margem,
  ]);

  function resumoTexto() {
    if (!resultado) return "";
    return [
      "*Precificação — Resolva Jato*",
      `Custo total (material + mão de obra + rateio fixo): ${formatCurrency(resultado.custoTotal)}`,
      `Preço de venda sugerido: ${formatCurrency(resultado.precoFinal)}`,
      `Lucro líquido estimado por venda: ${formatCurrency(resultado.lucroLiquidoPorVenda)} (${resultado.margemLiquidaReal.toFixed(1)}%)`,
      `Markup sobre custo direto: ${resultado.markup.toFixed(2)}x`,
      "",
      "Estimativa educativa. Ajuste conforme concorrência e percepção de valor do seu público.",
    ].join("\n");
  }

  function handleCopy() {
    navigator.clipboard.writeText(resumoTexto());
    toast("Resultado copiado!");
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
      title="Calculadora de Precificação"
      description="Cadastre-se gratuitamente para calcular seu preço ideal."
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <ToolsBackButton />
        </div>

        <PageHero
          title="Quanto cobrar pelo seu produto ou serviço?"
          subtitle="Informe custos, tempo e margem desejada para chegar num preço que cobre tudo e ainda dá lucro de verdade."
          icon={Tag}
        />

        <div className="grid gap-2 sm:grid-cols-3">
          <Insight
            label="1"
            text="Comece pelo custo real, não pelo preço do concorrente."
          />
          <Insight
            label="2"
            text="Inclua hora trabalhada, taxa de cartão e imposto."
          />
          <Insight label="3" text="Use o preço sugerido como piso de venda." />
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <FormField
              label="Custo direto (material/insumos)"
              htmlFor="custo-direto"
              required
            >
              <Input
                id="custo-direto"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={custoDiretoInput}
                onChange={(e) =>
                  setCustoDiretoInput(formatCurrencyInput(e.target.value))
                }
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Horas para produzir/entregar" htmlFor="horas">
                <Input
                  id="horas"
                  type="number"
                  min={0}
                  step={0.5}
                  value={horas}
                  onChange={(e) =>
                    setHoras(Math.max(0, Number(e.target.value) || 0))
                  }
                />
              </FormField>
              <FormField
                label="Quanto quer ganhar por hora"
                htmlFor="valor-hora"
              >
                <Input
                  id="valor-hora"
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  value={valorHoraInput}
                  onChange={(e) =>
                    setValorHoraInput(formatCurrencyInput(e.target.value))
                  }
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Custos fixos mensais"
                htmlFor="custos-fixos"
                hint="Aluguel, internet, ferramentas, etc."
              >
                <Input
                  id="custos-fixos"
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  value={custosFixosInput}
                  onChange={(e) =>
                    setCustosFixosInput(formatCurrencyInput(e.target.value))
                  }
                />
              </FormField>
              <FormField
                label="Vendas estimadas por mês"
                htmlFor="vendas-mensais"
              >
                <Input
                  id="vendas-mensais"
                  type="number"
                  min={1}
                  value={vendasMensais}
                  onChange={(e) =>
                    setVendasMensais(Math.max(1, Number(e.target.value) || 1))
                  }
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <SliderField
                label="Taxa do cartão (%)"
                value={taxaCartao}
                onChange={setTaxaCartao}
                max={15}
                step={0.1}
              />
              <SliderField
                label="Imposto (%)"
                value={imposto}
                onChange={setImposto}
                max={30}
                step={0.5}
              />
              <SliderField
                label="Margem de lucro desejada (%)"
                value={margem}
                onChange={setMargem}
                max={80}
                step={1}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
            <h2 className="rj-display mb-3 text-base font-bold text-slate-900">
              Resultado em tempo real
            </h2>
            {!resultado ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-800">
                  Preencha pelo menos uma base de custo.
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Use custo direto, custos fixos ou hora trabalhada com
                  valor/hora para liberar o preço sugerido.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
                  <Row
                    label="Rateio de custo fixo"
                    value={resultado.custoFixoRateado}
                  />
                  <Row
                    label="Custo da mão de obra"
                    value={resultado.custoMaoDeObra}
                  />
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
                    <span>Custo total por unidade</span>
                    <span>{formatCurrency(resultado.custoTotal)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
                  <span className="text-sm font-semibold">
                    Preço de venda sugerido
                  </span>
                  <span className="rj-display text-lg font-bold">
                    {formatCurrency(resultado.precoFinal)}
                  </span>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-3 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Lucro líquido/venda
                    </p>
                    <p className="rj-display mt-1 text-lg font-bold text-emerald-700">
                      {formatCurrency(resultado.lucroLiquidoPorVenda)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {resultado.margemLiquidaReal.toFixed(1)}% de margem real
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Markup
                    </p>
                    <p className="rj-display mt-1 text-lg font-bold text-slate-900">
                      {resultado.markup.toFixed(2)}x
                    </p>
                    <p className="text-xs text-slate-500">
                      sobre o custo direto
                    </p>
                  </div>
                </div>

                <p className="text-xs leading-5 text-slate-500">
                  Estimativa educativa — ajuste conforme concorrência,
                  elasticidade de preço e posicionamento da sua marca.
                </p>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={handleCopy}
                    icon={Copy}
                  >
                    Copiar resultado
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
    </AuthGate>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-medium text-slate-700">{label}</span>
      <span className="font-bold text-slate-900">{formatCurrency(value)}</span>
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max: number;
  step: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
        {label}: <span className="text-sky-700">{value}%</span>
      </label>
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-sky-600",
        )}
      />
    </div>
  );
}

function Insight({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-sky-100 bg-sky-50/70 p-3 text-xs font-semibold leading-5 text-slate-700">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-600 text-white">
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
