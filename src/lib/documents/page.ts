/** Margens seguras para impressão A4 (evita corte na borda da impressora). */
export const DOC_PAGE =
  'box-border min-h-[297mm] w-full overflow-hidden bg-white text-slate-900 [overflow-wrap:anywhere] [print-color-adjust:exact]';

/** Margem padrão ~15mm em todos os lados — padrão comercial para documentos. */
export const DOC_MARGIN = 'p-[15mm]';

/** Margem um pouco mais folgada (contratos / textos longos). */
export const DOC_MARGIN_COMFORT = 'p-[18mm]';

/** Margem compacta ainda segura (recibos densos). */
export const DOC_MARGIN_COMPACT = 'p-[14mm]';
