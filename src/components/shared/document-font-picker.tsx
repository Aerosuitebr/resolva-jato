'use client';

import { Type } from 'lucide-react';
import {
  DOCUMENT_FONT_PRESETS,
  getDocumentFontOptions,
  resolveDocumentFontId,
  type DocumentFontId,
  type DocumentFontKind
} from '@/lib/documents/fonts';
import { cn } from '@/lib/utils';

interface DocumentFontPickerProps {
  kind: DocumentFontKind;
  value?: string | null;
  onChange: (fontId: DocumentFontId) => void;
  className?: string;
  /** Compacto: só chips, sem card. */
  compact?: boolean;
}

export function DocumentFontPicker({
  kind,
  value,
  onChange,
  className,
  compact = false
}: DocumentFontPickerProps) {
  const preset = DOCUMENT_FONT_PRESETS[kind];
  const options = getDocumentFontOptions(kind);
  const selected = resolveDocumentFontId(kind, value);

  const body = (
    <>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
          <Type className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">{preset.label}</p>
          <p className="mt-0.5 text-xs leading-5 text-slate-600">{preset.hint}</p>
        </div>
      </div>

      <div
        className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
        role="radiogroup"
        aria-label={preset.label}
      >
        {options.map((font) => {
          const active = font.id === selected;
          return (
            <button
              key={font.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(font.id)}
              className={cn(
                'rounded-2xl border px-3.5 py-3 text-left transition',
                active
                  ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-100'
                  : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50'
              )}
            >
              <p
                className="text-lg font-semibold leading-none text-slate-950"
                style={{ fontFamily: font.stack }}
              >
                Aa
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900" style={{ fontFamily: font.stack }}>
                {font.name}
              </p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                {font.category === 'serif' ? 'Serifada' : 'Sem serifa'}
              </p>
              <p className="mt-1.5 text-xs leading-5 text-slate-600">{font.blurb}</p>
            </button>
          );
        })}
      </div>
    </>
  );

  if (compact) {
    return <div className={cn('space-y-3', className)}>{body}</div>;
  }

  return (
    <section
      className={cn(
        'rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6',
        className
      )}
    >
      {body}
    </section>
  );
}
