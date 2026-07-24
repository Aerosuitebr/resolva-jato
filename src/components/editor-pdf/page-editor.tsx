'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Eraser,
  Highlighter,
  ImagePlus,
  Loader2,
  Maximize2,
  Minus,
  MousePointer2,
  Plus,
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
  EDITOR_FONTS,
  ensureFontCssLoaded,
  getFontOptionById,
  resolveFontFromPdfName
} from '@/lib/editor-pdf/fonts';
import {
  PAGE_PRESETS,
  extractPageGraphicOverlays,
  extractPageTextOverlays,
  isFromPdfPristine,
  nextId,
  renderPagePreview,
  resolvePageSize,
  sampleCoverFillsFromPreview,
  type PageFitMode,
  type PageItem,
  type PageOverlay,
  type PageSizePreset,
  type SourceFile
} from '@/lib/editor-pdf/pdf-engine';
import { cn } from '@/lib/utils';

const ZOOM_MIN = 50;
const ZOOM_MAX = 200;
const ZOOM_STEP = 10;

type Tool = 'select' | 'text' | 'image' | 'rect' | 'line' | 'highlight' | 'erase';

const TOOLS: Array<{ id: Tool; label: string; icon: typeof Type }> = [
  { id: 'select', label: 'Editar', icon: MousePointer2 },
  { id: 'text', label: 'Novo texto', icon: Type },
  { id: 'image', label: 'Imagem', icon: ImagePlus },
  { id: 'rect', label: 'Retângulo', icon: Square },
  { id: 'line', label: 'Linha', icon: Minus },
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
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState<PageItem>(page);
  const [tool, setTool] = useState<Tool>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState(page.thumbnail);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingText, setLoadingText] = useState(false);
  const [boardHeight, setBoardHeight] = useState(800);
  const [zoom, setZoom] = useState(100);
  const [fontStatus, setFontStatus] = useState('');
  const [drag, setDrag] = useState<{
    mode: 'move' | 'resize' | 'create' | 'pending';
    id?: string;
    startX: number;
    startY: number;
    orig?: PageOverlay;
  } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const movedDuringDrag = useRef(false);
  const replaceImageIdRef = useRef<string | null>(null);
  const [imageSlot, setImageSlot] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
    coverX?: number;
    coverY?: number;
    coverW?: number;
    coverH?: number;
    coverFill?: string;
  } | null>(null);

  const size = resolvePageSize(draft);
  const aspect = size.width / Math.max(size.height, 1);
  const selected = draft.overlays.find((o) => o.id === selectedId) || null;
  const textCount = draft.overlays.filter((o) => o.kind === 'text' && o.fromPdf).length;
  const graphicCount = draft.overlays.filter(
    (o) => o.fromPdf && (o.kind === 'image' || o.kind === 'line' || o.kind === 'rect')
  ).length;

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (draft.isBlank || !source) {
        setPreviewUrl(page.thumbnail);
        return;
      }

      setLoadingPreview(true);
      let preview = page.thumbnail;
      try {
        preview = await renderPagePreview(source, draft.sourcePageIndex, draft.rotation);
        if (!cancelled) setPreviewUrl(preview);
      } catch {
        if (!cancelled) setPreviewUrl(page.thumbnail);
      } finally {
        if (!cancelled) setLoadingPreview(false);
      }

      if (!page.textLayerReady) {
        setLoadingText(true);
        try {
          const [texts, graphics] = await Promise.all([
            extractPageTextOverlays(source, draft.sourcePageIndex, draft.rotation),
            extractPageGraphicOverlays(source, draft.sourcePageIndex, draft.rotation)
          ]);
          if (cancelled) return;
          const textsWithFill = await sampleCoverFillsFromPreview(preview, texts);
          for (const t of textsWithFill) {
            const opt = getFontOptionById(t.fontId || 'inter');
            ensureFontCssLoaded(opt);
          }
          setDraft((prev) => {
            const manual = prev.overlays.filter((o) => !o.fromPdf);
            const lines = graphics.filter((o) => o.kind === 'line');
            const otherGraphics = graphics.filter((o) => o.kind !== 'line');
            return {
              ...prev,
              // Texto por cima de imagens para não perder clique; linhas no topo.
              overlays: [...otherGraphics, ...textsWithFill, ...lines, ...manual],
              textLayerReady: true
            };
          });
          const names = Array.from(
            new Set(textsWithFill.map((t) => t.fontLabel || t.pdfFontName).filter(Boolean))
          ).slice(0, 3);
          const bits: string[] = [];
          if (names.length) bits.push(`Fontes: ${names.join(', ')}`);
          if (graphics.length) {
            bits.push(`${graphics.length} objeto(s) gráfico(s) (imagem/linha)`);
          }
          setFontStatus(bits.join(' · '));
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
  }, [loadingPreview, loadingText, mounted]);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.select?.();
    }
  }, [editingId]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!selectedId) return;

      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === 'TEXTAREA' ||
          target.tagName === 'INPUT' ||
          target.isContentEditable);

      if ((e.key === 'Delete' || e.key === 'Backspace') && !typing) {
        e.preventDefault();
        removeOverlay(selectedId);
        return;
      }

      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

      // Em edição de texto, use Alt+setas para mover a caixa (setas sozinhas navegam o cursor).
      if (typing && !e.altKey) return;

      e.preventDefault();
      e.stopPropagation();
      const step = e.shiftKey ? 0.28 : 0.08;
      let dx = 0;
      let dy = 0;
      if (e.key === 'ArrowLeft') dx = -step;
      if (e.key === 'ArrowRight') dx = step;
      if (e.key === 'ArrowUp') dy = -step;
      if (e.key === 'ArrowDown') dy = step;

      setDraft((prev) => {
        const ov = prev.overlays.find((o) => o.id === selectedId);
        if (!ov) return prev;
        const x = Math.min(100 - ov.w, Math.max(0, ov.x + dx));
        const y = Math.min(100 - ov.h, Math.max(0, ov.y + dy));
        if (x === ov.x && y === ov.y) return prev;
        return {
          ...prev,
          overlays: prev.overlays.map((o) =>
            o.id === selectedId
              ? { ...o, x, y, ...(o.fromPdf ? { dirty: true } : {}) }
              : o
          )
        };
      });
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId]);

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
      overlays: prev.overlays.map((o) =>
        o.id === id ? { ...o, ...patch, ...(o.fromPdf ? { dirty: true } : {}) } : o
      )
    }));
  }

  function removeOverlay(id: string) {
    const ov = draft.overlays.find((o) => o.id === id);
    if (ov?.kind === 'image') {
      setImageSlot({
        x: ov.x,
        y: ov.y,
        w: ov.w,
        h: ov.h,
        coverX: ov.coverX,
        coverY: ov.coverY,
        coverW: ov.coverW,
        coverH: ov.coverH,
        coverFill: ov.coverFill
      });
    }

    setDraft((prev) => {
      const target = prev.overlays.find((o) => o.id === id);
      let next = prev.overlays.filter((o) => o.id !== id);
      // Cobre o raster original ao remover imagem do PDF.
      if (
        target?.kind === 'image' &&
        target.fromPdf &&
        target.coverX != null &&
        target.coverY != null &&
        target.coverW != null &&
        target.coverH != null
      ) {
        next = [
          ...next,
          {
            id: nextId('erase'),
            kind: 'erase',
            x: target.coverX,
            y: target.coverY,
            w: target.coverW,
            h: target.coverH,
            fill: target.coverFill || '#ffffff',
            opacity: 1
          }
        ];
      }
      return { ...prev, overlays: next };
    });
    if (selectedId === id) setSelectedId(null);
    if (editingId === id) setEditingId(null);
  }

  function startReplaceImage() {
    if (!selected || selected.kind !== 'image') return;
    replaceImageIdRef.current = selected.id;
    imageInputRef.current?.click();
  }

  async function onImagePicked(file: File | null) {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    const replaceId = replaceImageIdRef.current;
    replaceImageIdRef.current = null;

    if (replaceId) {
      updateOverlay(replaceId, { imageDataUrl: dataUrl });
      setSelectedId(replaceId);
      setTool('select');
      setImageSlot(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
      return;
    }

    const slot = imageSlot;
    setImageSlot(null);
    const id = nextId('ov');

    if (slot) {
      setDraft((prev) => {
        const withoutHole = prev.overlays.filter(
          (o) =>
            !(
              o.kind === 'erase' &&
              slot.coverX != null &&
              Math.abs(o.x - slot.coverX) < 0.35 &&
              Math.abs(o.y - (slot.coverY || 0)) < 0.35
            )
        );
        return {
          ...prev,
          overlays: [
            ...withoutHole,
            {
              id,
              kind: 'image' as const,
              x: slot.x,
              y: slot.y,
              w: slot.w,
              h: slot.h,
              coverX: slot.coverX,
              coverY: slot.coverY,
              coverW: slot.coverW,
              coverH: slot.coverH,
              coverFill: slot.coverFill,
              imageDataUrl: dataUrl,
              fromPdf: slot.coverX != null,
              dirty: true,
              coverBackground: true,
              opacity: 1
            }
          ]
        };
      });
    } else {
      setDraft((prev) => ({
        ...prev,
        overlays: [
          ...prev.overlays,
          {
            id,
            kind: 'image',
            x: 20,
            y: 20,
            w: 40,
            h: 28,
            imageDataUrl: dataUrl
          }
        ]
      }));
    }

    setSelectedId(id);
    setTool('select');
    if (imageInputRef.current) imageInputRef.current.value = '';
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
    const ov = draft.overlays.find((o) => o.id === id);
    if (ov?.fontId) ensureFontCssLoaded(getFontOptionById(ov.fontId));
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

    if (tool === 'line') {
      const id = nextId('ov');
      const overlay: PageOverlay = {
        id,
        kind: 'line',
        x: pt.x,
        y: pt.y,
        w: 1,
        h: 0.45,
        stroke: '#0f172a',
        fill: '#0f172a',
        strokeWidth: 0.45,
        opacity: 1
      };
      setDraft((prev) => ({ ...prev, overlays: [...prev.overlays, overlay] }));
      setSelectedId(id);
      setDrag({ mode: 'create', id, startX: pt.x, startY: pt.y, orig: overlay });
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
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

    if (drag.mode === 'pending' && drag.id && drag.orig) {
      const dist = Math.abs(pt.x - drag.startX) + Math.abs(pt.y - drag.startY);
      if (dist < 0.9) return;
      movedDuringDrag.current = true;
      setDrag({ ...drag, mode: 'move' });
      const dx = pt.x - drag.startX;
      const dy = pt.y - drag.startY;
      updateOverlay(drag.id, {
        x: Math.min(100 - drag.orig.w, Math.max(0, drag.orig.x + dx)),
        y: Math.min(100 - drag.orig.h, Math.max(0, drag.orig.y + dy))
      });
      return;
    }

    if (drag.mode === 'create' && drag.id && drag.orig) {
      const x = Math.min(drag.startX, pt.x);
      const y = Math.min(drag.startY, pt.y);
      if (drag.orig.kind === 'line') {
        const dx = Math.abs(pt.x - drag.startX);
        const dy = Math.abs(pt.y - drag.startY);
        const horizontal = dx >= dy;
        if (horizontal) {
          updateOverlay(drag.id, {
            x,
            y: drag.startY,
            w: Math.max(1, dx),
            h: Math.max(0.35, drag.orig.h || 0.45)
          });
        } else {
          updateOverlay(drag.id, {
            x: drag.startX,
            y,
            w: Math.max(0.35, drag.orig.w || 0.45),
            h: Math.max(1, dy)
          });
        }
        return;
      }
      const w = Math.max(1, Math.abs(pt.x - drag.startX));
      const h = Math.max(1, Math.abs(pt.y - drag.startY));
      updateOverlay(drag.id, { x, y, w, h });
      return;
    }

    if (drag.mode === 'move' && drag.id && drag.orig) {
      const dx = pt.x - drag.startX;
      const dy = pt.y - drag.startY;
      if (Math.abs(dx) + Math.abs(dy) > 0.35) movedDuringDrag.current = true;
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
    if (drag?.mode === 'pending' && drag.id && drag.orig?.kind === 'text' && !movedDuringDrag.current) {
      beginEditText(drag.id);
    }
    setDrag(null);
  }

  function startMove(e: React.PointerEvent, overlay: PageOverlay) {
    if (editingId === overlay.id) return;
    e.stopPropagation();
    setSelectedId(overlay.id);
    if (tool !== 'select') return;
    movedDuringDrag.current = false;
    const pt = relativePoint(e.clientX, e.clientY);
    // Texto: clique edita; só vira arraste depois de mover de verdade.
    setDrag({
      mode: overlay.kind === 'text' ? 'pending' : 'move',
      id: overlay.id,
      startX: pt.x,
      startY: pt.y,
      orig: overlay
    });
    boardRef.current?.setPointerCapture(e.pointerId);
  }

  function startResize(e: React.PointerEvent, overlay: PageOverlay) {
    e.stopPropagation();
    setSelectedId(overlay.id);
    const pt = relativePoint(e.clientX, e.clientY);
    setDrag({ mode: 'resize', id: overlay.id, startX: pt.x, startY: pt.y, orig: overlay });
    boardRef.current?.setPointerCapture(e.pointerId);
  }

  function fontPx(overlay: PageOverlay) {
    if (overlay.fontSize && boardHeight > 0 && size.height > 0) {
      return Math.max(5, (overlay.fontSize / size.height) * boardHeight);
    }
    return Math.max(5, (overlay.h / 100) * boardHeight * 0.88);
  }

  function cssFontFamily(overlay: PageOverlay) {
    const opt = getFontOptionById(overlay.fontId || 'inter');
    return `"${opt.family}", ${
      opt.standard === 'TimesRoman' ? 'Georgia, serif' : opt.standard === 'Courier' ? 'monospace' : 'Arial, Helvetica, sans-serif'
    }`;
  }

  function fitOverlayWidthToText(overlay: PageOverlay, text: string) {
    const family = cssFontFamily(overlay);
    const sizePx = fontPx(overlay);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let measured = Math.max((text || ' ').length, 1) * sizePx * 0.52;
    if (ctx) {
      ctx.font = `${overlay.bold ? 700 : 400} ${sizePx}px ${family}`;
      measured = ctx.measureText(text || ' ').width;
    }
    const boardWidth = boardHeight * aspect;
    if (boardWidth <= 0) return overlay.w;
    const nextW = (measured / boardWidth) * 100 + 0.5;
    return Math.max(0.8, Math.min(100 - overlay.x, nextW));
  }

  function updateTextContent(id: string, text: string) {
    const ov = draft.overlays.find((o) => o.id === id);
    if (!ov) {
      updateOverlay(id, { text });
      return;
    }
    updateOverlay(id, {
      text,
      w: fitOverlayWidthToText({ ...ov, text }, text)
    });
  }

  function applyFontToSelected(fontId: string) {
    if (!selectedId) return;
    const opt = getFontOptionById(fontId);
    ensureFontCssLoaded(opt);
    updateOverlay(selectedId, {
      fontId: opt.id,
      fontLabel: opt.family
    });
    setFontStatus(`Fonte do bloco: ${opt.family} (carregada para edição)`);
  }

  function bumpZoom(delta: number) {
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + delta)));
  }

  const ui = (
    <div
      className="fixed inset-0 z-[400] flex items-stretch justify-center bg-slate-950/75 p-3 backdrop-blur-sm sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Editor de página PDF"
    >
      <div className="flex h-full w-full max-w-[1400px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl">
        <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">Editor de página</p>
              <h2 className="rj-display truncate text-base font-bold text-slate-900">
                Clique para editar · setas movem a caixa
              </h2>
            {fontStatus ? (
              <p className="mt-0.5 truncate text-[0.7rem] font-medium text-slate-500">{fontStatus}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-700 hover:bg-white"
              onClick={() => bumpZoom(-ZOOM_STEP)}
              aria-label="Diminuir zoom"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[3.25rem] text-center text-xs font-bold text-slate-800">{zoom}%</span>
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-700 hover:bg-white"
              onClick={() => bumpZoom(ZOOM_STEP)}
              aria-label="Aumentar zoom"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-[0.65rem] font-bold text-sky-700 hover:bg-white"
              onClick={() => setZoom(100)}
            >
              100%
            </button>
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

        <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[7.5rem_minmax(0,1fr)_19rem]">
          <aside className="flex shrink-0 flex-row gap-1.5 overflow-x-auto border-b border-slate-200 bg-white p-3 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto lg:border-b-0 lg:border-r">
            {TOOLS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  onClick={() => setTool(item.id)}
                  className={cn(
                    'flex w-full min-w-[5.5rem] shrink-0 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-[0.68rem] font-bold transition lg:min-w-0',
                    tool === item.id ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="text-center leading-tight">{item.label}</span>
                </button>
              );
            })}
          </aside>

          <div className="min-h-0 min-w-0 overflow-auto bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0] p-4 sm:p-5">
            <div
              className="mx-auto origin-top"
              style={{
                width: `min(100%, ${680 * (zoom / 100)}px)`,
                maxWidth: '100%'
              }}
            >
            <div
              ref={boardRef}
              onPointerDown={onBoardPointerDown}
              onPointerMove={onBoardPointerMove}
              onPointerUp={onBoardPointerUp}
              className={cn(
                'relative w-full touch-none overflow-hidden rounded-md bg-white shadow-xl ring-1 ring-slate-300',
                tool === 'select' ? 'cursor-default' : 'cursor-crosshair'
              )}
              style={{
                aspectRatio: `${aspect}`
              }}
              role="application"
              aria-label="Área de edição da página"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full object-fill"
              />

              {(loadingPreview || loadingText) && (
                <div className="absolute inset-0 z-30 grid place-items-center bg-white/70 text-sm font-semibold text-slate-700">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
                    {loadingText ? 'Lendo texto, imagens e linhas…' : 'Carregando página…'}
                  </span>
                </div>
              )}

              {draft.overlays.map((overlay) => {
                if (
                  !overlay.fromPdf ||
                  isFromPdfPristine(overlay) ||
                  overlay.coverX == null ||
                  overlay.coverY == null ||
                  overlay.coverW == null ||
                  overlay.coverH == null
                ) {
                  return null;
                }
                return (
                  <div
                    key={`cover-${overlay.id}`}
                    aria-hidden
                    className="pointer-events-none absolute z-[5]"
                    style={{
                      left: `${overlay.coverX}%`,
                      top: `${overlay.coverY}%`,
                      width: `${overlay.coverW}%`,
                      height: `${overlay.coverH}%`,
                      backgroundColor: overlay.coverFill || '#ffffff'
                    }}
                  />
                );
              })}

              {draft.overlays.map((overlay) => {
                const isSelected = selectedId === overlay.id;
                const isEditing = editingId === overlay.id;
                const pristine = isFromPdfPristine(overlay);
                const changed =
                  overlay.kind === 'text' &&
                  overlay.fromPdf &&
                  overlay.text !== overlay.originalText;
                const showPaintedContent = !pristine || isEditing;

                return (
                  <div
                    key={overlay.id}
                    data-overlay
                    onPointerDown={(e) => startMove(e, overlay)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(overlay.id);
                      // Edição de texto principal no pointerUp (pending→edit);
                      // fallback se o click chegar sem drag.
                      if (
                        overlay.kind === 'text' &&
                        tool === 'select' &&
                        !movedDuringDrag.current &&
                        editingId !== overlay.id
                      ) {
                        beginEditText(overlay.id);
                      }
                    }}
                    className={cn(
                      'absolute box-border bg-transparent',
                      overlay.kind === 'image' || overlay.kind === 'line'
                        ? isSelected
                          ? 'z-30'
                          : 'z-[18]'
                        : isSelected || isEditing
                          ? 'z-20'
                          : 'z-10',
                      overlay.kind === 'text' && !isEditing && 'cursor-text hover:ring-1 hover:ring-sky-400/70',
                      overlay.kind === 'line' &&
                        tool === 'select' &&
                        'cursor-ns-resize hover:bg-sky-400/25 hover:ring-1 hover:ring-sky-500/80',
                      overlay.kind !== 'text' &&
                        overlay.kind !== 'line' &&
                        tool === 'select' &&
                        'cursor-move hover:ring-1 hover:ring-sky-400/70',
                      (isSelected || isEditing) && 'ring-2 ring-sky-500',
                      changed && 'ring-emerald-400',
                      !pristine && overlay.kind === 'erase' && 'bg-white',
                      !pristine && overlay.kind === 'rect' && 'border border-sky-700/40',
                      !pristine && overlay.kind === 'highlight' && 'mix-blend-multiply',
                      !pristine && overlay.kind === 'line' && 'rounded-[1px]'
                    )}
                    style={{
                      left: `${overlay.x}%`,
                      top: `${overlay.y}%`,
                      width: `${overlay.w}%`,
                      height: `${overlay.h}%`,
                      backgroundColor: !showPaintedContent
                        ? 'transparent'
                        : overlay.kind === 'rect' ||
                            overlay.kind === 'highlight' ||
                            overlay.kind === 'erase' ||
                            overlay.kind === 'line'
                          ? overlay.fill || overlay.stroke || '#0f172a'
                          : overlay.kind === 'text'
                            ? overlay.coverFill || '#ffffff'
                            : undefined,
                      opacity: !showPaintedContent
                        ? 1
                        : overlay.kind === 'highlight'
                          ? overlay.opacity ?? 0.35
                          : overlay.opacity ?? 1
                    }}
                  >
                    {overlay.kind === 'text' && showPaintedContent ? (
                      isEditing ? (
                        <textarea
                          ref={(node) => {
                            editRef.current = node;
                          }}
                          value={overlay.text || ''}
                          onChange={(e) => updateTextContent(overlay.id, e.target.value)}
                          onBlur={() => setEditingId(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              e.preventDefault();
                              setEditingId(null);
                            }
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          className="h-full w-full resize-none border-0 px-0.5 py-0 outline-none"
                          style={{
                            backgroundColor: overlay.coverFill || '#ffffff',
                            color: overlay.color || '#0f172a',
                            fontSize: `${fontPx(overlay)}px`,
                            fontFamily: cssFontFamily(overlay),
                            fontWeight: overlay.bold ? 700 : 400,
                            fontSynthesis: 'none',
                            letterSpacing: 'normal',
                            textAlign: overlay.align || 'left',
                            lineHeight: 1
                          }}
                          aria-label="Editar texto"
                        />
                      ) : (
                        <div
                          className="h-full w-full overflow-hidden whitespace-pre px-0.5 py-0"
                          style={{
                            color: overlay.color || '#0f172a',
                            fontSize: `${fontPx(overlay)}px`,
                            fontFamily: cssFontFamily(overlay),
                            fontWeight: overlay.bold ? 700 : 400,
                            fontSynthesis: 'none',
                            letterSpacing: 'normal',
                            textAlign: overlay.align || 'left',
                            lineHeight: 1
                          }}
                        >
                          {overlay.text}
                        </div>
                      )
                    ) : null}

                    {overlay.kind === 'line' && isSelected ? (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-1 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-sky-500 shadow-sm"
                      />
                    ) : null}

                    {overlay.kind === 'image' && showPaintedContent && overlay.imageDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={overlay.imageDataUrl}
                        alt=""
                        className="pointer-events-none h-full w-full object-fill"
                        draggable={false}
                      />
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
            </div>
            <p className="mx-auto mt-3 max-w-xl text-center text-xs leading-5 text-slate-600">
              {textCount > 0 || graphicCount > 0
                ? `${textCount} texto(s)${graphicCount ? ` · ${graphicCount} imagem/linha` : ''}. Clique para editar; setas (ou Alt+setas) movem a caixa.`
                : 'Clique em um texto para editar. Setas movem a seleção. Use as ferramentas para adicionar objetos.'}
            </p>
          </div>

          <aside className="min-h-0 space-y-3 overflow-y-auto border-t border-slate-200 bg-white p-4 lg:border-l lg:border-t-0">
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
              <h3 className="mb-2 text-sm font-bold text-slate-900">
                {selected?.kind === 'image'
                  ? 'Imagem selecionada'
                  : selected?.kind === 'line'
                    ? 'Linha selecionada'
                    : selected && selected.kind !== 'text'
                      ? 'Forma selecionada'
                      : 'Texto selecionado'}
              </h3>
              {!selected ? (
                <p className="text-xs leading-5 text-slate-500">
                  Clique em texto, imagem ou linha. Setas movem com precisão; Delete remove.
                  {imageSlot
                    ? ' Espaço de imagem guardado — use “Imagem” na barra para inserir outra no mesmo tamanho.'
                    : ''}
                </p>
              ) : selected.kind !== 'text' ? (
                <div className="space-y-2">
                  <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                    {selected.kind === 'image'
                      ? 'Troque a imagem mantendo o tamanho, ou remova e insira outra (encaixa no espaço anterior). Delete também remove.'
                      : selected.fromPdf
                        ? 'Objeto do PDF. Arraste para mover. A posição original fica coberta no export.'
                        : 'Arraste na página para mover ou use o canto azul para redimensionar.'}
                  </p>
                  {selected.kind === 'image' && selected.imageDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selected.imageDataUrl}
                      alt=""
                      className="mx-auto max-h-24 rounded-lg border border-slate-200 object-contain"
                    />
                  ) : null}
                  {(selected.kind === 'line' || selected.kind === 'rect') && (
                    <FormField label="Cor" htmlFor="ov-shape-color">
                      <Input
                        id="ov-shape-color"
                        type="color"
                        value={selected.fill || selected.stroke || '#0f172a'}
                        onChange={(e) =>
                          updateOverlay(selected.id, {
                            fill: e.target.value,
                            stroke: e.target.value
                          })
                        }
                        className="h-11 w-full cursor-pointer p-1"
                      />
                    </FormField>
                  )}
                  {selected.kind === 'image' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      icon={ImagePlus}
                      onClick={startReplaceImage}
                    >
                      Trocar imagem (mesmo tamanho)
                    </Button>
                  ) : null}
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full"
                    icon={Trash2}
                    onClick={() => removeOverlay(selected.id)}
                  >
                    {selected.kind === 'image' ? 'Remover imagem' : 'Remover objeto'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="rounded-xl border border-sky-100 bg-sky-50/80 px-3 py-2 text-xs leading-5 text-slate-700">
                    <p className="font-bold text-sky-900">Fonte atual</p>
                    <p className="mt-0.5 font-semibold text-slate-900">
                      {getFontOptionById(selected.fontId || 'inter').family}
                    </p>
                    {selected.pdfFontName ? (
                      <p className="mt-1 break-all text-[0.65rem] text-slate-500">
                        PDF: {selected.fontLabel || resolveFontFromPdfName(selected.pdfFontName).displayName}
                        {selected.pdfFontName !== selected.fontLabel
                          ? ` (${selected.pdfFontName})`
                          : ''}
                      </p>
                    ) : null}
                  </div>

                  <FormField
                    label="Fonte do bloco"
                    htmlFor="ov-font"
                    hint="Buscamos a fonte do documento e carregamos a mais próxima."
                  >
                    <Select
                      id="ov-font"
                      value={selected.fontId || 'inter'}
                      onChange={(e) => applyFontToSelected(e.target.value)}
                    >
                      {EDITOR_FONTS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.family}
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  <FormField label="Conteúdo" htmlFor="ov-text">
                    <Textarea
                      id="ov-text"
                      rows={4}
                      value={selected.text || ''}
                      onChange={(e) => updateTextContent(selected.id, e.target.value)}
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
                  <FormField
                    label="Cor deste texto"
                    htmlFor="ov-color"
                    hint="Altera só o bloco selecionado."
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        id="ov-color"
                        type="color"
                        value={selected.color || '#0f172a'}
                        onChange={(e) => updateOverlay(selected.id, { color: e.target.value })}
                        className="h-11 w-14 cursor-pointer p-1"
                      />
                      <Input
                        value={selected.color || '#0f172a'}
                        onChange={(e) => updateOverlay(selected.id, { color: e.target.value })}
                        placeholder="#0f172a"
                      />
                    </div>
                  </FormField>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(selected.bold)}
                      onChange={(e) => {
                        const bold = e.target.checked;
                        updateOverlay(selected.id, {
                          bold,
                          w: fitOverlayWidthToText({ ...selected, bold }, selected.text || '')
                        });
                      }}
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

  if (!mounted) return null;
  return createPortal(ui, document.body);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
