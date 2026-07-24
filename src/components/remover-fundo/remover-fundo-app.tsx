"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  Download,
  ImageOff,
  Loader2,
  Lock,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";
import { AuthGate } from "@/components/auth/auth-gate";
import { PageHero } from "@/components/shared/page-hero";
import { ToolsBackButton } from "@/components/shared/tools-back-button";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { buildResolvaJatoDownloadName } from "@/lib/download-filename";
import { cn } from "@/lib/utils";
import {
  downloadBlob,
  removeImageBackground,
} from "@/lib/remover-fundo/process";

const MAX_FILE_MB = 15;
const PRESET_COLORS = [
  "transparent",
  "#ffffff",
  "#000000",
  "#0ea5e9",
  "#22c55e",
  "#f43f5e",
  "#eab308",
];

export function RemoverFundoApp() {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progressLabel, setProgressLabel] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [bgColor, setBgColor] = useState("transparent");
  const [compositeUrl, setCompositeUrl] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast("Selecione um arquivo de imagem (JPG, PNG ou WEBP).");
        return;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        toast(`A imagem excede ${MAX_FILE_MB}MB.`);
        return;
      }
      setOriginalUrl(URL.createObjectURL(file));
      setResultBlob(null);
      setResultUrl(null);
      setCompositeUrl(null);
      setBgColor("transparent");
      setProcessing(true);
      setProgressLabel("Preparando modelo…");
      setProgressPct(0);
      try {
        const { blob, url } = await removeImageBackground(
          file,
          (label, current, total) => {
            const pct = total > 0 ? Math.round((current / total) * 100) : 0;
            setProgressPct(pct);
            setProgressLabel(
              label.startsWith("fetch")
                ? "Baixando modelo de IA (só na primeira vez)…"
                : "Removendo o fundo…",
            );
          },
        );
        setResultBlob(blob);
        setResultUrl(url);
        toast("Fundo removido com sucesso!");
      } catch (err) {
        console.error(err);
        toast(
          "Não foi possível remover o fundo dessa imagem. Tente outro arquivo.",
        );
      } finally {
        setProcessing(false);
      }
    },
    [toast],
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  const previewUrl = useMemo(
    () => compositeUrl ?? resultUrl,
    [compositeUrl, resultUrl],
  );

  async function applyBackground(color: string) {
    setBgColor(color);
    if (!resultUrl) return;
    if (color === "transparent") {
      setCompositeUrl(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = resultUrl;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    setCompositeUrl(canvas.toDataURL("image/png"));
  }

  async function handleDownload() {
    const name = buildResolvaJatoDownloadName("picture");
    if (compositeUrl) {
      const res = await fetch(compositeUrl);
      const blob = await res.blob();
      downloadBlob(blob, name);
      return;
    }
    if (resultBlob) {
      downloadBlob(resultBlob, name);
    }
  }

  function reset() {
    setOriginalUrl(null);
    setResultBlob(null);
    setResultUrl(null);
    setCompositeUrl(null);
    setBgColor("transparent");
  }

  return (
    <AuthGate
      title="Removedor de Fundo de Imagem"
      description="Cadastre-se gratuitamente para remover fundos de imagens."
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <ToolsBackButton />
        </div>

        <PageHero
          title="Removedor de Fundo de Imagem"
          subtitle="Recorte pessoas, produtos e objetos automaticamente e baixe em PNG transparente. O processamento roda no seu navegador, a imagem não é enviada a nenhum servidor."
          icon={ImageOff}
        />

        <div className="grid gap-2 sm:grid-cols-3">
          <Insight
            icon={Lock}
            text="100% local: a imagem nunca sai do seu dispositivo."
          />
          <Insight icon={Wand2} text="Recorte automático por IA em segundos." />
          <Insight
            icon={ShieldCheck}
            text="Baixe em PNG com fundo transparente ou colorido."
          />
        </div>

        {!originalUrl ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors",
              dragOver
                ? "border-sky-500 bg-sky-50"
                : "border-slate-300 bg-white hover:border-sky-300 hover:bg-sky-50/50",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && void handleFile(e.target.files[0])
              }
            />
            <Upload className="h-10 w-10 text-sky-600" aria-hidden />
            <p className="text-base font-bold text-slate-900">
              Arraste uma imagem aqui ou clique para selecionar
            </p>
            <p className="max-w-md text-sm leading-6 text-slate-500">
              JPG, PNG ou WEBP · até {MAX_FILE_MB}MB.
            </p>
            <Button variant="outline" size="sm" icon={Upload}>
              Selecionar imagem
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Original
                  </p>
                  <div className="flex h-72 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={originalUrl}
                      alt="Imagem original"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Sem fundo
                  </p>
                  <div
                    className="flex h-72 items-center justify-center overflow-hidden rounded-xl"
                    style={{
                      backgroundImage:
                        bgColor === "transparent"
                          ? "conic-gradient(#e2e8f0 90deg, #f8fafc 90deg 180deg, #e2e8f0 180deg 270deg, #f8fafc 270deg)"
                          : undefined,
                      backgroundSize:
                        bgColor === "transparent" ? "20px 20px" : undefined,
                      backgroundColor:
                        bgColor !== "transparent" ? bgColor : undefined,
                    }}
                  >
                    {processing ? (
                      <div className="flex flex-col items-center gap-2 px-6 text-center">
                        <Loader2
                          className="h-8 w-8 animate-spin text-sky-600"
                          aria-hidden
                        />
                        <p className="text-sm font-semibold text-slate-700">
                          {progressLabel}
                        </p>
                        {progressPct > 0 ? (
                          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full bg-sky-600 transition-all"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt="Imagem sem fundo"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : null}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={RefreshCcw}
                onClick={reset}
              >
                Escolher outra imagem
              </Button>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
              <h2 className="rj-display text-base font-bold text-slate-900">
                Fundo de saída
              </h2>
              {!resultUrl ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-800">
                    Aguarde o processamento.
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Na primeira vez o modelo de IA é baixado (leva alguns
                    segundos); depois fica em cache e roda instantaneamente.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => applyBackground(color)}
                        aria-label={
                          color === "transparent"
                            ? "Fundo transparente"
                            : `Fundo ${color}`
                        }
                        className={cn(
                          "h-9 w-9 rounded-lg border-2 transition-all",
                          bgColor === color
                            ? "border-sky-600 ring-2 ring-sky-200"
                            : "border-slate-200",
                        )}
                        style={{
                          backgroundImage:
                            color === "transparent"
                              ? "conic-gradient(#e2e8f0 90deg, #f8fafc 90deg 180deg, #e2e8f0 180deg 270deg, #f8fafc 270deg)"
                              : undefined,
                          backgroundSize:
                            color === "transparent" ? "10px 10px" : undefined,
                          backgroundColor:
                            color !== "transparent" ? color : undefined,
                        }}
                      />
                    ))}
                    <label className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border-2 border-slate-200 bg-white text-slate-400">
                      <input
                        type="color"
                        className="h-0 w-0 opacity-0"
                        onChange={(e) => applyBackground(e.target.value)}
                      />
                      <Sparkles className="h-4 w-4" aria-hidden />
                    </label>
                  </div>
                  <p className="text-xs leading-5 text-slate-500">
                    Escolha um fundo sólido ou mantenha transparente para usar
                    em qualquer lugar (apresentações, editores de imagem,
                    catálogos).
                  </p>
                  <Button
                    className="w-full"
                    size="lg"
                    icon={Download}
                    onClick={handleDownload}
                  >
                    Baixar PNG
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AuthGate>
  );
}

function Insight({ icon: Icon, text }: { icon: typeof Lock; text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-sky-100 bg-sky-50/70 p-3 text-xs font-semibold leading-5 text-slate-700">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-600 text-white">
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <span>{text}</span>
      <Sparkles
        className="ml-auto hidden h-4 w-4 shrink-0 text-sky-500 sm:block"
        aria-hidden
      />
    </div>
  );
}
