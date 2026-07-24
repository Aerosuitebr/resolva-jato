"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckSquare,
  Copy,
  Download,
  FileStack,
  FileUp,
  Loader2,
  Lock,
  RotateCcw,
  RotateCw,
  ScissorsSquare,
  Sparkles,
  Square,
  StickyNote,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import { AuthGate } from "@/components/auth/auth-gate";
import { PageHero } from "@/components/shared/page-hero";
import { ToolsBackButton } from "@/components/shared/tools-back-button";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  blankPageThumbnail,
  buildFinalPdf,
  downloadBytes,
  loadPdfIntoPages,
  nextId,
  type PageItem,
  type SourceFile,
} from "@/lib/editor-pdf/pdf-engine";

const MAX_FILE_MB = 40;

export function EditorPdfApp() {
  const { toast } = useToast();
  const [sources, setSources] = useState<Map<string, SourceFile>>(new Map());
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [building, setBuilding] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pageNumbers, setPageNumbers] = useState(false);
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.18);
  const [outputName, setOutputName] = useState("documento-editado");
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCount = useMemo(
    () => pages.filter((p) => p.selected).length,
    [pages],
  );
  const allSelected = pages.length > 0 && selectedCount === pages.length;

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter(
        (f) =>
          f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
      );
      if (files.length === 0) {
        toast("Selecione arquivos PDF válidos.");
        return;
      }
      const tooBig = files.find((f) => f.size > MAX_FILE_MB * 1024 * 1024);
      if (tooBig) {
        toast(`"${tooBig.name}" excede ${MAX_FILE_MB}MB.`);
        return;
      }
      setLoading(true);
      try {
        for (const file of files) {
          const { source, pages: newPages } = await loadPdfIntoPages(file);
          setSources((prev) => new Map(prev).set(source.id, source));
          setPages((prev) => [...prev, ...newPages]);
        }
        if (!outputName || outputName === "documento-editado") {
          const base = files[0].name.replace(/\.pdf$/i, "");
          setOutputName(files.length > 1 ? `${base}-mesclado` : base);
        }
        toast(
          files.length > 1
            ? `${files.length} PDFs carregados e mesclados.`
            : "PDF carregado.",
        );
      } catch (err) {
        console.error(err);
        toast(
          "Não foi possível ler um dos PDFs. Verifique se não está protegido por senha.",
        );
      } finally {
        setLoading(false);
      }
    },
    [outputName, toast],
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files);
  }

  function toggleSelectAll() {
    setPages((prev) => prev.map((p) => ({ ...p, selected: !allSelected })));
  }

  function toggleSelect(id: string) {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)),
    );
  }

  function rotate(id: string, delta: number) {
    setPages((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, rotation: (p.rotation + delta + 360) % 360 } : p,
      ),
    );
  }

  function rotateSelected(delta: number) {
    setPages((prev) =>
      prev.map((p) =>
        p.selected ? { ...p, rotation: (p.rotation + delta + 360) % 360 } : p,
      ),
    );
  }

  function removePage(id: string) {
    setPages((prev) => prev.filter((p) => p.id !== id));
  }

  function removeSelected() {
    if (selectedCount === 0) return;
    setPages((prev) => prev.filter((p) => !p.selected));
    toast(`${selectedCount} página(s) removida(s).`);
  }

  function duplicatePage(id: string) {
    setPages((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const clone: PageItem = {
        ...prev[idx],
        id: nextId("page"),
        selected: false,
      };
      const copy = [...prev];
      copy.splice(idx + 1, 0, clone);
      return copy;
    });
  }

  function insertBlankPage() {
    const blank: PageItem = {
      id: nextId("blank"),
      sourceId: "blank",
      sourcePageIndex: 0,
      rotation: 0,
      thumbnail: blankPageThumbnail(),
      selected: false,
      isBlank: true,
      originalWidth: 595.28,
      originalHeight: 841.89,
    };
    setPages((prev) => [...prev, blank]);
  }

  function move(id: string, direction: -1 | 1) {
    setPages((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      const target = idx + direction;
      if (idx === -1 || target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[target]] = [copy[target], copy[idx]];
      return copy;
    });
  }

  async function handleDownload(onlySelected: boolean) {
    const list = onlySelected ? pages.filter((p) => p.selected) : pages;
    if (list.length === 0) {
      toast(
        onlySelected
          ? "Selecione ao menos uma página."
          : "Adicione um PDF primeiro.",
      );
      return;
    }
    setBuilding(true);
    try {
      const bytes = await buildFinalPdf(list, sources, {
        pageNumbers,
        watermarkText,
        watermarkOpacity,
      });
      const name = `${(outputName || "documento").trim().replace(/\.pdf$/i, "")}${onlySelected ? "-extrato" : ""}.pdf`;
      downloadBytes(bytes as Uint8Array, name);
      toast("PDF gerado com sucesso!");
    } catch (err) {
      console.error(err);
      toast("Erro ao gerar o PDF. Tente novamente.");
    } finally {
      setBuilding(false);
    }
  }

  function resetAll() {
    setSources(new Map());
    setPages([]);
    setWatermarkText("");
    setPageNumbers(false);
    setOutputName("documento-editado");
  }

  return (
    <AuthGate
      title="Editor de PDF"
      description="Cadastre-se gratuitamente para editar seus PDFs."
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <ToolsBackButton />
        </div>

        <PageHero
          title="Editor de PDF"
          subtitle="Junte, reordene, gire, remova, extraia páginas, adicione numeração e marca d'água — tudo no seu navegador, sem enviar o arquivo para nenhum servidor."
          icon={FileStack}
        />

        <div className="grid gap-2 sm:grid-cols-3">
          <Insight
            icon={Lock}
            text="100% local: seus arquivos nunca saem do navegador."
          />
          <Insight
            icon={Wand2}
            text="Reordene, gire, duplique e exclua página por página."
          />
          <Insight
            icon={ScissorsSquare}
            text="Extraia só as páginas selecionadas em um novo PDF."
          />
        </div>

        {pages.length === 0 ? (
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
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={(e) =>
                e.target.files && void handleFiles(e.target.files)
              }
            />
            {loading ? (
              <Loader2
                className="h-10 w-10 animate-spin text-sky-600"
                aria-hidden
              />
            ) : (
              <Upload className="h-10 w-10 text-sky-600" aria-hidden />
            )}
            <p className="text-base font-bold text-slate-900">
              {loading
                ? "Carregando páginas…"
                : "Arraste seus PDFs aqui ou clique para selecionar"}
            </p>
            <p className="max-w-md text-sm leading-6 text-slate-500">
              Envie um ou vários arquivos de uma vez — eles são mesclados
              automaticamente na ordem escolhida. Máx. {MAX_FILE_MB}MB por
              arquivo.
            </p>
            <Button
              variant="outline"
              size="sm"
              icon={FileUp}
              disabled={loading}
            >
              Selecionar arquivos
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <Button
                variant="outline"
                size="sm"
                icon={FileUp}
                onClick={() => inputRef.current?.click()}
                disabled={loading}
              >
                Adicionar PDF
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={(e) =>
                  e.target.files && void handleFiles(e.target.files)
                }
              />
              <Button
                variant="outline"
                size="sm"
                icon={StickyNote}
                onClick={insertBlankPage}
              >
                Página em branco
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={allSelected ? Square : CheckSquare}
                onClick={toggleSelectAll}
              >
                {allSelected ? "Limpar seleção" : "Selecionar tudo"}
              </Button>
              <div className="mx-1 h-6 w-px bg-slate-200" />
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                disabled={!selectedCount}
                onClick={() => rotateSelected(-90)}
              >
                Girar selecionadas
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={RotateCw}
                disabled={!selectedCount}
                onClick={() => rotateSelected(90)}
              >
                Girar selecionadas
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={ScissorsSquare}
                disabled={!selectedCount}
                onClick={() => handleDownload(true)}
              >
                Extrair selecionadas
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                disabled={!selectedCount}
                onClick={removeSelected}
              >
                Excluir selecionadas ({selectedCount})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetAll}
                className="ml-auto"
              >
                Recomeçar
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {pages.map((p, idx) => (
                  <div
                    key={p.id}
                    className={cn(
                      "group relative rounded-xl border bg-white p-2 shadow-sm transition-all",
                      p.selected
                        ? "border-sky-500 ring-2 ring-sky-200"
                        : "border-slate-200 hover:border-slate-300",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSelect(p.id)}
                      className="absolute left-3 top-3 z-10 grid h-6 w-6 place-items-center rounded-md border border-slate-300 bg-white/90 text-sky-600 shadow-sm"
                      aria-label="Selecionar página"
                    >
                      {p.selected ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                    <span className="absolute right-3 top-3 z-10 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
                      {idx + 1}
                    </span>
                    <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.thumbnail}
                        alt={`Página ${idx + 1}`}
                        style={{ transform: `rotate(${p.rotation}deg)` }}
                        className="max-h-full max-w-full object-contain transition-transform"
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={() => rotate(p.id, -90)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                        aria-label="Girar à esquerda"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => rotate(p.id, 90)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                        aria-label="Girar à direita"
                      >
                        <RotateCw className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicatePage(p.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                        aria-label="Duplicar página"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(p.id, -1)}
                        disabled={idx === 0}
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-25"
                        aria-label="Mover para cima"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(p.id, 1)}
                        disabled={idx === pages.length - 1}
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-25"
                        aria-label="Mover para baixo"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePage(p.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-rose-500 hover:bg-rose-50"
                        aria-label="Remover página"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
                <h2 className="rj-display text-base font-bold text-slate-900">
                  Finalizar documento
                </h2>
                <FormField label="Nome do arquivo" htmlFor="output-name">
                  <Input
                    id="output-name"
                    value={outputName}
                    onChange={(e) => setOutputName(e.target.value)}
                    placeholder="documento-editado"
                  />
                </FormField>

                <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                    checked={pageNumbers}
                    onChange={(e) => setPageNumbers(e.target.checked)}
                  />
                  Numerar páginas (rodapé)
                </label>

                <FormField
                  label="Marca d'água (opcional)"
                  htmlFor="watermark"
                  hint="Texto diagonal aplicado em todas as páginas."
                >
                  <Input
                    id="watermark"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Ex.: CONFIDENCIAL"
                  />
                </FormField>

                {watermarkText.trim() ? (
                  <FormField
                    label={`Opacidade (${Math.round(watermarkOpacity * 100)}%)`}
                    htmlFor="opacity"
                  >
                    <input
                      id="opacity"
                      type="range"
                      min={0.05}
                      max={0.5}
                      step={0.01}
                      value={watermarkOpacity}
                      onChange={(e) =>
                        setWatermarkOpacity(Number(e.target.value))
                      }
                      className="w-full accent-sky-600"
                    />
                  </FormField>
                ) : null}

                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                  <span className="font-bold text-slate-700">
                    {pages.length}
                  </span>{" "}
                  página(s) no documento final
                  {sources.size > 1
                    ? ` · ${sources.size} arquivos mesclados`
                    : ""}
                  .
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  icon={Download}
                  loading={building}
                  onClick={() => handleDownload(false)}
                >
                  Baixar PDF final
                </Button>
              </div>
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
