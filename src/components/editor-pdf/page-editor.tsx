'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Eraser,
  Highlighter,
  ImagePlus,
  Loader2,
  Maximize2,
  MousePointer2,
  Square,
  Trash2,
  Type,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  PAGE_PRESETS,
  extractPageTextOverlays,
  nextId,
  renderPagePreview,
  resolvePageSize,
  type PageFitMode,
  type PageItem,
  type PageOverlay,
  type PageSizePreset,
  type SourceFile
} from '@/lib/editor-pdf/pdf-engine';
import { cn } from '@/lib/utils';

type Tool = 'select' | 'text' | 'image' | 'rect' | 'highlight' | 'erase';

const TOOLS: Array<{ id: Tool; label: string; icon: typeof Type }> = [
  { id: 'select', label: 'Editar', icon: MousePointer2 },
  { id: 'text', label: 'Novo texto', icon: Type },
  { id: 'image', label: 'Imagem', icon: ImagePlus },
  { id: 'rect', label: 'Retângulo', icon: Square },
  { id: 'highlight', label: 'Marca-texto', icon: Highlighter },
  { id: 'erase', label: 'Apagar área', icon: Eraser }
];

interface PageEditorProps {
  page: PageItem;
  source?: SourceFile;
  onSave: (page: PageItem) => void;
  onClose: () => void;
}

export function PageEditor({ page, source, onSave, onClose }: PageEditorProps) {
  const [draft, setDraft] = useState<PageItem>(page);
  const [tool, setTool] = useState<Tool>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState(page.thumbnail);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingText, setLoadingText] = useState(false);
  const [boardHeight, setBoardHeight] = useState(800);
  const [drag, setDrag] = useState<{
    mode: 'move' | 'resize' | 'create';
    id?: string;
    startX: number;
    startY: number;
    orig?: PageOverlay;
  } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  const size = resolvePageSize(draft);
  const aspect = size.width / Math.max(size.height, 1);
  const selected = draft.overlays.find((o) => o.id === selectedId) || null;
  const textCount = draft.overlays.filter((o) => o.kind === 'text' && o.fromPdf).length;

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (draft.isBlank || !source) {
        setPreviewUrl(page.thumbnail);
        return;
      }

      setLoadingPreview(true);
      try {
        const url = await renderPagePreview(source, draft.sourcePageIndex, draft.rotation);
        if (!cancelled) setPreviewUrl(url);
      } catch {
        if (!cancelled) setPreviewUrl(page.thumbnail);
      } finally {
        if (!cancelled) setLoadingPreview(false);
      }

      if (!page.textLayerReady) {
        setLoadingText(true);
        try {
          const texts = await extractPageTextOverlays(
            source,
            draft.sourcePageIndex,
            draft.rotation
          );
          if (cancelled) return;
          setDraft((prev) => {
            const manual = prev.overlays.filter((o) => !o.fromPdf);
            return {
              ...prev,
              overlays: [...texts, ...manual],
              textLayerReady: true
            };
          });
        } catch (err) {
          console.error(err);
        } finally {
          if (!cancelled) setLoadingText(false);
        }
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- boot once per page open
  }, [page.id, page.textLayerReady, source]);

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const update = () => setBoardHeight(el.clientHeight || 800);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [loadingPreview, loadingText]);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.select?.();
    }
  }, [editingId]);

  const presetOptions = useMemo(
    () => [
      { value: 'original', label: 'Tamanho original' },
      ...Object.entries(PAGE_PRESETS).map(([value, meta]) => ({
        value,
        label: meta.label
      })),
      { value: 'custom', label: 'Personalizado' }
    ],
    []
  );

  function updateOverlay(id: string, patch: Partial<PageOverlay>) {
    setDraft((prev) => ({
      ...prev,
      overlays: prev.overlays.map((o) => (o.id === id ? { ...o, ...patch } : o))
    }));
  }

  function removeOverlay(id: string) {
    setDraft((prev) => ({
      ...prev,
      overlays: prev.overlays.filter((o) => o.id !== id)
    }));
    if (selectedId === id) setSelectedId(null);
    if (editingId === id) setEditingId(null);
  }

  function setPagePreset(preset: PageSizePreset) {
    setDraft((prev) => {
      if (preset === 'original') {
        return {
          ...prev,
          pageSize: {
            ...prev.pageSize,
            preset,
            width: prev.originalWidth,
            height: prev.originalHeight
          }
        };
      }
      if (preset === 'custom') {
        return { ...prev, pageSize: { ...prev.pageSize, preset: 'custom' } };
      }
      const meta = PAGE_PRESETS[preset];
      return {
        ...prev,
        pageSize: {
          ...prev.pageSize,
          preset,
          width: meta.width,
          height: meta.height
        }
      };
    });
  }

  function relativePoint(clientX: number, clientY: number) {
    const el = boardRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return {
      x: Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100))
    };
  }

  function beginEditText(id: string) {
    setTool('select');
    setSelectedId(id);
    setEditingId(id);
  }

  function onBoardPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest('[data-overlay]')) return;
    setEditingId(null);
    const pt = relativePoint(e.clientX, e.clientY);

    if (tool === 'select') {
      setSelectedId(null);
      return;
    }

    if (tool === 'text') {
      const id = nextId('ov');
      const overlay: PageOverlay = {
        id,
        kind: 'text',
        x: pt.x,
        y: pt.y,
        w: 28,
        h: 4.5,
        text: '',
        fontSize: 14,
        color: '#0f172a',
        align: 'left',
        bold: false,
        coverBackground: true
      };
      setDraft((prev) => ({ ...prev, overlays: [...prev.overlays, overlay] }));
      beginEditText(id);
      return;
    }

    if (tool === 'image') {
      imageInputRef.current?.click();
      return;
    }

    const id = nextId('ov');
    const kind = tool as 'rect' | 'highlight' | 'erase';
    const overlay: PageOverlay = {
      id,
      kind,
      x: pt.x,
      y: pt.y,
      w: 1,
      h: 1,
      fill: kind === 'erase' ? '#ffffff' : kind === 'highlight' ? '#facc15' : '#0ea5e9',
      opacity: kind === 'highlight' ? 0.35 : 1
    };
    setDraft((prev) => ({ ...prev, overlays: [...prev.overlays, overlay] }));
    setSelectedId(id);
    setDrag({ mode: 'create', id, startX: pt.x, startY: pt.y, orig: overlay });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onBoardPointerMove(e: React.PointerEvent) {
    if (!drag) return;
    const pt = relativePoint(e.clientX, e.clientY);

    if (drag.mode === 'create' && drag.id && drag.orig) {
      const x = Math.min(drag.startX, pt.x);
      const y = Math.min(drag.startY, pt.y);
      const w = Math.max(1, Math.abs(pt.x - drag.startX));
      const h = Math.max(1, Math.abs(pt.y - drag.startY));
      updateOverlay(drag.id, { x, y, w, h });
      return;
    }

    if (drag.mode === 'move' && drag.id && drag.orig) {
      const dx = pt.x - drag.startX;
      const dy = pt.y - drag.startY;
      updateOverlay(drag.id, {
        x: Math.min(100 - drag.orig.w, Math.max(0, drag.orig.x + dx)),
        y: Math.min(100 - drag.orig.h, Math.max(0, drag.orig.y + dy))
      });
      return;
    }

    if (drag.mode === 'resize' && drag.id && drag.orig) {
      const w = Math.max(2, Math.min(100 - drag.orig.x, pt.x - drag.orig.x));
      const h = Math.max(2, Math.min(100 - drag.orig.y, pt.y - drag.orig.y));
      updateOverlay(drag.id, { w, h });
    }
  }

  function onBoardPointerUp() {
    setDrag(null);
  }

  function startMove(e: React.PointerEvent, overlay: PageOverlay) {
    if (editingId === overlay.id) return;
    e.stopPropagation();
    setSelectedId(overlay.id);
    if (tool !== 'select') return;
    if (overlay.kind === 'text') return; // texto: clique edita; arrastar pelo handle/sidebar
    const pt = relativePoint(e.clientX, e.clientY);
    setDrag({ mode: 'move', id: overlay.id, startX: pt.x, startY: pt.y, orig: overlay });
    boardRef.current?.setPointerCapture(e.pointerId);
  }

  function startResize(e: React.PointerEvent, overlay: PageOverlay) {
    e.stopPropagation();
    setSelectedId(overlay.id);
    const pt = relativePoint(e.clientX, e.clientY);
    setDrag({ mode: 'resize', id: overlay.id, startX: pt.x, startY: pt.y, orig: overlay });
    boardRef.current?.setPointerCapture(e.pointerId);
  }

  async function onImagePicked(file: File | null) {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    const id = nextId('ov');
    const overlay: PageOverlay = {
      id,
      kind: 'image',
      x: 20,
      y: 20,
      w: 40,
      h: 28,
      imageDataUrl: dataUrl
    };
    setDraft((prev) => ({ ...prev, overlays: [...prev.overlays, overlay] }));
    setSelectedId(id);
    setTool('select');
  }

  function fontPx(overlay: PageOverlay) {
    if (overlay.fontSize && boardHeight > 0) {
      // fontSize está em pontos PDF ≈ % da altura da página
      return Math.max(9, (overlay.fontSize / size.height) * boardHeight);
    }
    return Math.max(9, (overlay.h / 100) * boardHeight * 0.72);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/70 p-3 backdrop-blur-sm sm:p-5">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl">
        <header className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">Editor de página</p>
            <h2 className="rj-display truncate text-base font-bold text-slate-900">
              Clique em qualquer texto para editar
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} icon={X}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={() =>
              onSave({
                ...draft,
                textLayerReady: true
              })
            }
          >
            Salvar página
          </Button>
        </header>

        <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[4.5rem_minmax(0,1fr)_17rem]">
          <aside className="flex flex-row gap-1 overflow-x-auto border-b border-slate-200 bg-white p-2 lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-r">
            {TOOLS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  onClick={() => setTool(item.id)}
                  className={cn(
                    'flex min-w-[4rem] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[0.65rem] font-bold transition',
                    tool === item.id ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </button>
              );
            })}
          </aside>

          <div className="min-h-0 overflow-auto bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0] p-4">
            <div
              ref={boardRef}
              onPointerDown={onBoardPointerDown}
              onPointerMove={onBoardPointerMove}
              onPointerUp={onBoardPointerUp}
              className={cn(
                'relative mx-auto max-w-full touch-none overflow-hidden rounded-md bg-white shadow-xl ring-1 ring-slate-300',
                tool === 'select' ? 'cursor-default' : 'cursor-crosshair'
              )}
              style={{
                width: 'min(100%, 720px)',
                aspectRatio: `${aspect}`
              }}
              role="application"
              aria-label="Área de edição da página"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full"
                style={{
                  objectFit:
                    draft.pageSize.fit === 'stretch'
                      ? 'fill'
                      : draft.pageSize.fit === 'cover'
                        ? 'cover'
                        : 'contain'
                }}
              />

              {(loadingPreview || loadingText) && (
                <div className="absolute inset-0 z-30 grid place-items-center bg-white/70 text-sm font-semibold text-slate-700">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
                    {loadingText ? 'Lendo o texto da página…' : 'Carregando página…'}
                  </span>
                </div>
              )}

              {draft.overlays.map((overlay) => {
                const isSelected = selectedId === overlay.id;
                const isEditing = editingId === overlay.id;
                const changed =
                  overlay.kind === 'text' &&
                  overlay.fromPdf &&
                  overlay.text !== overlay.originalText;

                return (
                  <div
                    key={overlay.id}
                    data-overlay
                    onPointerDown={(e) => startMove(e, overlay)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(overlay.id);
                      if (overlay.kind === 'text' && tool === 'select') {
                        beginEditText(overlay.id);
                      }
                    }}
                    className={cn(
                      'absolute box-border',
                      isSelected || isEditing ? 'z-20' : 'z-10',
                      overlay.kind === 'text' && !isEditing && 'cursor-text hover:ring-1 hover:ring-sky-400/80',
                      (isSelected || isEditing) && 'ring-2 ring-sky-500',
                      changed && 'ring-emerald-400',
                      overlay.kind === 'erase' && 'bg-white',
                      overlay.kind === 'rect' && 'border border-sky-700/40',
                      overlay.kind === 'highlight' && 'mix-blend-multiply'
                    )}
                    style={{
                      left: `${overlay.x}%`,
                      top: `${overlay.y}%`,
                      width: `${overlay.w}%`,
                      height: `${overlay.h}%`,
                      backgroundColor:
                        overlay.kind === 'rect' ||
                        overlay.kind === 'highlight' ||
                        overlay.kind === 'erase'
                          ? overlay.fill
                          : overlay.kind === 'text'
                            ? '#ffffff'
                            : undefined,
                      opacity:
                        overlay.kind === 'highlight' ? overlay.opacity ?? 0.35 : overlay.opacity ?? 1
                    }}
                  >
                    {overlay.kind === 'text' ? (
                      isEditing ? (
                        <textarea
                          ref={(node) => {
                            editRef.current = node;
                          }}
                          value={overlay.text || ''}
                          onChange={(e) => updateOverlay(overlay.id, { text: e.target.value })}
                          onBlur={() => setEditingId(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              e.preventDefault();
                              setEditingId(null);
                            }
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          className="h-full w-full resize-none border-0 bg-white px-0.5 py-0 outline-none"
                          style={{
                            color: overlay.color || '#0f172a',
                            fontSize: `${fontPx(overlay)}px`,
                            fontWeight: overlay.bold ? 700 : 500,
                            textAlign: overlay.align || 'left',
                            lineHeight: 1.15
                          }}
                          aria-label="Editar texto"
                        />
                      ) : (
                        <div
                          className="h-full w-full overflow-hidden whitespace-pre px-0.5 py-0"
                          style={{
                            color: overlay.color || '#0f172a',
                            fontSize: `${fontPx(overlay)}px`,
                            fontWeight: overlay.bold ? 700 : 500,
                            textAlign: overlay.align || 'left',
                            lineHeight: 1.15
                          }}
                        >
                          {overlay.text}
                        </div>
                      )
                    ) : null}

                    {overlay.kind === 'image' && overlay.imageDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={overlay.imageDataUrl} alt="" className="h-full w-full object-contain" />
                    ) : null}

                    {isSelected ? (
                      <button
                        type="button"
                        aria-label="Redimensionar"
                        onPointerDown={(e) => startResize(e, overlay)}
                        className="absolute -bottom-1.5 -right-1.5 h-4 w-4 cursor-se-resize rounded-sm border border-white bg-sky-600"
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
            <p className="mx-auto mt-3 max-w-xl text-center text-xs leading-5 text-slate-600">
              {textCount > 0
                ? `${textCount} trechos de texto detectados — clique em qualquer um para alterar.`
                : 'Clique em um texto da página para editar. Use Novo texto para adicionar conteúdo.'}
            </p>
          </div>

          <aside className="space-y-3 overflow-y-auto border-t border-slate-200 bg-white p-4 lg:border-l lg:border-t-0">
            <div className="flex items-center gap-2">
              <Maximize2 className="h-4 w-4 text-sky-700" aria-hidden />
              <h3 className="text-sm font-bold text-slate-900">Tamanho da página</h3>
            </div>

            <FormField label="Formato" htmlFor="page-preset">
              <Select
                id="page-preset"
                value={draft.pageSize.preset}
                onChange={(e) => setPagePreset(e.target.value as PageSizePreset)}
              >
                {presetOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </FormField>

            {draft.pageSize.preset === 'custom' ? (
              <div className="grid grid-cols-2 gap-2">
                <FormField label="Largura (pt)" htmlFor="page-w">
                  <Input
                    id="page-w"
                    type="number"
                    min={72}
                    value={Math.round(draft.pageSize.width)}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        pageSize: {
                          ...prev.pageSize,
                          width: Math.max(72, Number(e.target.value) || 72)
                        }
                      }))
                    }
                  />
                </FormField>
                <FormField label="Altura (pt)" htmlFor="page-h">
                  <Input
                    id="page-h"
                    type="number"
                    min={72}
                    value={Math.round(draft.pageSize.height)}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        pageSize: {
                          ...prev.pageSize,
                          height: Math.max(72, Number(e.target.value) || 72)
                        }
                      }))
                    }
                  />
                </FormField>
              </div>
            ) : null}

            <FormField label="Encaixe do conteúdo" htmlFor="page-fit">
              <Select
                id="page-fit"
                value={draft.pageSize.fit}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    pageSize: { ...prev.pageSize, fit: e.target.value as PageFitMode }
                  }))
                }
              >
                <option value="contain">Conter (sem cortar)</option>
                <option value="cover">Cobrir (pode cortar)</option>
                <option value="stretch">Esticar</option>
                <option value="none">Tamanho original</option>
              </Select>
            </FormField>

            <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
              Página final: {Math.round(size.width)} × {Math.round(size.height)} pt
            </p>

            <div className="border-t border-slate-200 pt-3">
              <h3 className="mb-2 text-sm font-bold text-slate-900">Texto selecionado</h3>
              {!selected || selected.kind !== 'text' ? (
                <p className="text-xs leading-5 text-slate-500">
                  Clique em um número ou palavra na página. O texto original fica editável na hora.
                </p>
              ) : (
                <div className="space-y-2">
                  <FormField label="Conteúdo" htmlFor="ov-text">
                    <Textarea
                      id="ov-text"
                      rows={4}
                      value={selected.text || ''}
                      onChange={(e) => updateOverlay(selected.id, { text: e.target.value })}
                    />
                  </FormField>
                  {selected.originalText != null && selected.text !== selected.originalText ? (
                    <p className="text-[0.7rem] font-medium text-emerald-700">
                      Original: “{selected.originalText}”
                    </p>
                  ) : null}
                  <FormField label="Tamanho da fonte" htmlFor="ov-size">
                    <Input
                      id="ov-size"
                      type="number"
                      min={6}
                      max={96}
                      value={Math.round(selected.fontSize || 14)}
                      onChange={(e) =>
                        updateOverlay(selected.id, {
                          fontSize: Math.max(6, Number(e.target.value) || 14)
                        })
                      }
                    />
                  </FormField>
                  <FormField label="Cor" htmlFor="ov-color">
                    <Input
                      id="ov-color"
                      type="color"
                      value={selected.color || '#0f172a'}
                      onChange={(e) => updateOverlay(selected.id, { color: e.target.value })}
                    />
                  </FormField>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(selected.bold)}
                      onChange={(e) => updateOverlay(selected.id, { bold: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600"
                    />
                    Negrito
                  </label>
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full"
                    icon={Trash2}
                    onClick={() => removeOverlay(selected.id)}
                  >
                    Remover este texto
                  </Button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => void onImagePicked(e.target.files?.[0] || null)}
      />
    </div>
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
