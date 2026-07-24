/**
 * Catálogo de fontes + resolução inteligente a partir do nome embutido no PDF.
 * Preview via Google Fonts / CSS; export tenta embutir TTF (fontsource) com fallback StandardFonts.
 */

export interface EditorFontOption {
  id: string;
  /** Nome CSS / exibição */
  family: string;
  /** IDs no Fontsource CDN (sem @) */
  fontsourceId: string;
  /** Aliases para matching do nome do PDF */
  aliases: string[];
  /** Fallback pdf-lib StandardFonts */
  standard: 'Helvetica' | 'TimesRoman' | 'Courier';
  googleQuery?: string;
}

/** Fontes disponíveis no seletor (ordem de preferência na UI). */
export const EDITOR_FONTS: EditorFontOption[] = [
  {
    id: 'inter',
    family: 'Inter',
    fontsourceId: 'inter',
    aliases: ['inter', 'helvetica', 'arial', 'sans', 'sansserif', 'segoeui', 'roboto'],
    standard: 'Helvetica',
    googleQuery: 'Inter:wght@400;600;700'
  },
  {
    id: 'roboto',
    family: 'Roboto',
    fontsourceId: 'roboto',
    aliases: ['roboto', 'droid', 'noto'],
    standard: 'Helvetica',
    googleQuery: 'Roboto:wght@400;700'
  },
  {
    id: 'open-sans',
    family: 'Open Sans',
    fontsourceId: 'open-sans',
    aliases: ['opensans', 'open sans', 'source sans', 'sourcesans', 'sourcesanspro', 'sourcesans3'],
    standard: 'Helvetica',
    googleQuery: 'Open+Sans:wght@400;700'
  },
  {
    id: 'lato',
    family: 'Lato',
    fontsourceId: 'lato',
    aliases: ['lato'],
    standard: 'Helvetica',
    googleQuery: 'Lato:wght@400;700'
  },
  {
    id: 'montserrat',
    family: 'Montserrat',
    fontsourceId: 'montserrat',
    aliases: ['montserrat'],
    standard: 'Helvetica',
    googleQuery: 'Montserrat:wght@400;700'
  },
  {
    id: 'nunito',
    family: 'Nunito',
    fontsourceId: 'nunito',
    aliases: ['nunito', 'nunito sans'],
    standard: 'Helvetica',
    googleQuery: 'Nunito:wght@400;700'
  },
  {
    id: 'source-sans-3',
    family: 'Source Sans 3',
    fontsourceId: 'source-sans-3',
    aliases: ['sourcesans3', 'source sans 3', 'sourcesanspro', 'source sans pro', 'adobe clean'],
    standard: 'Helvetica',
    googleQuery: 'Source+Sans+3:wght@400;700'
  },
  {
    id: 'pt-sans',
    family: 'PT Sans',
    fontsourceId: 'pt-sans',
    aliases: ['ptsans', 'pt sans'],
    standard: 'Helvetica',
    googleQuery: 'PT+Sans:wght@400;700'
  },
  {
    id: 'libre-baskerville',
    family: 'Libre Baskerville',
    fontsourceId: 'libre-baskerville',
    aliases: ['baskerville', 'librebaskerville', 'times', 'timesnewroman', 'georgia', 'serif', 'garamond'],
    standard: 'TimesRoman',
    googleQuery: 'Libre+Baskerville:wght@400;700'
  },
  {
    id: 'merriweather',
    family: 'Merriweather',
    fontsourceId: 'merriweather',
    aliases: ['merriweather'],
    standard: 'TimesRoman',
    googleQuery: 'Merriweather:wght@400;700'
  },
  {
    id: 'playfair-display',
    family: 'Playfair Display',
    fontsourceId: 'playfair-display',
    aliases: ['playfair', 'playfairdisplay'],
    standard: 'TimesRoman',
    googleQuery: 'Playfair+Display:wght@400;700'
  },
  {
    id: 'roboto-mono',
    family: 'Roboto Mono',
    fontsourceId: 'roboto-mono',
    aliases: ['robotomono', 'courier', 'couriernew', 'consolas', 'monaco', 'mono', 'menlo', 'sourcecodepro'],
    standard: 'Courier',
    googleQuery: 'Roboto+Mono:wght@400;700'
  },
  {
    id: 'jetbrains-mono',
    family: 'JetBrains Mono',
    fontsourceId: 'jetbrains-mono',
    aliases: ['jetbrainsmono', 'jetbrains'],
    standard: 'Courier',
    googleQuery: 'JetBrains+Mono:wght@400;700'
  },
  {
    id: 'dm-sans',
    family: 'DM Sans',
    fontsourceId: 'dm-sans',
    aliases: ['dmsans', 'dm sans'],
    standard: 'Helvetica',
    googleQuery: 'DM+Sans:wght@400;700'
  },
  {
    id: 'sora',
    family: 'Sora',
    fontsourceId: 'sora',
    aliases: ['sora'],
    standard: 'Helvetica',
    googleQuery: 'Sora:wght@400;700'
  }
];

const loadedCss = new Set<string>();
const ttfCache = new Map<string, ArrayBuffer>();

/** Remove subset prefix (ABCDEF+) e normaliza o nome da fonte do PDF. */
export function normalizePdfFontName(raw?: string | null): string {
  if (!raw) return '';
  let name = raw.trim();
  const plus = name.indexOf('+');
  if (plus > 0 && plus < 8) name = name.slice(plus + 1);
  name = name
    .replace(/[,_]/g, ' ')
    .replace(/(Bold|Italic|Oblique|Regular|Medium|Light|Black|SemiBold|ExtraBold)/gi, ' $1 ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
  return name;
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function scoreMatch(query: string, option: EditorFontOption): number {
  const q = slug(query);
  if (!q) return 0;
  const familySlug = slug(option.family);
  if (q === familySlug) return 100;
  if (familySlug.includes(q) || q.includes(familySlug)) return 80;
  for (const alias of option.aliases) {
    const a = slug(alias);
    if (q === a) return 95;
    if (q.includes(a) || a.includes(q)) return 70;
  }
  // tokens
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  let hit = 0;
  for (const t of tokens) {
    if (option.aliases.some((a) => slug(a).includes(slug(t))) || familySlug.includes(slug(t))) {
      hit += 15;
    }
  }
  return hit;
}

export function resolveFontFromPdfName(pdfFontName?: string | null): {
  option: EditorFontOption;
  displayName: string;
  matched: boolean;
  confidence: number;
} {
  const cleaned = normalizePdfFontName(pdfFontName);
  const displayName = cleaned || 'Helvetica / Arial';
  let best = EDITOR_FONTS[0];
  let bestScore = 0;
  for (const opt of EDITOR_FONTS) {
    const s = scoreMatch(cleaned || 'helvetica', opt);
    if (s > bestScore) {
      bestScore = s;
      best = opt;
    }
  }
  return {
    option: best,
    displayName,
    matched: bestScore >= 70,
    confidence: bestScore
  };
}

export function getFontOptionById(id: string): EditorFontOption {
  return EDITOR_FONTS.find((f) => f.id === id) || EDITOR_FONTS[0];
}

/** Carrega a folha CSS da fonte no documento (para preview). */
export function ensureFontCssLoaded(option: EditorFontOption) {
  if (typeof document === 'undefined') return;
  if (loadedCss.has(option.id)) return;
  loadedCss.add(option.id);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  const q = option.googleQuery || `${option.family.replace(/\s+/g, '+')}:wght@400;700`;
  link.href = `https://fonts.googleapis.com/css2?family=${q}&display=swap`;
  document.head.appendChild(link);
}

/** Busca TTF via Fontsource CDN para embutir no PDF. */
export async function fetchFontTtf(
  option: EditorFontOption,
  weight: 400 | 700 = 400
): Promise<ArrayBuffer | null> {
  const cacheKey = `${option.fontsourceId}-${weight}`;
  const cached = ttfCache.get(cacheKey);
  if (cached) return cached;

  const urls = [
    `https://cdn.jsdelivr.net/fontsource/fonts/${option.fontsourceId}@latest/latin-${weight}-normal.ttf`,
    `https://cdn.jsdelivr.net/fontsource/fonts/${option.fontsourceId}@5.0.0/latin-${weight}-normal.ttf`
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      if (buf.byteLength > 1000) {
        ttfCache.set(cacheKey, buf);
        return buf;
      }
    } catch {
      // tenta próxima URL
    }
  }
  return null;
}

export function isBoldPdfFont(pdfFontName?: string | null) {
  return /bold|black|heavy|semibold/i.test(pdfFontName || '');
}
