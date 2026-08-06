'use client';

import Link from 'next/link';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { trackEvent } from '@/lib/analytics';

const INTENTS = [
  { label: 'Cobrar um cliente', href: '/orcamento-com-pix#montar', description: 'Orçamento, aprovação e Pix no WhatsApp', keywords: ['cobrar', 'cliente', 'orçamento', 'orcamento', 'pix', 'pagamento', 'preço', 'preco'] },
  { label: 'Gerar um recibo', href: '/gerador-de-recibo', description: 'Recibo profissional pronto para PDF', keywords: ['recibo', 'pagamento', 'quitação', 'quitacao', 'comprovante'] },
  { label: 'Criar um contrato', href: '/gerador-de-contrato', description: 'Modelos editáveis para serviços e negócios', keywords: ['contrato', 'aluguel', 'serviço', 'servico', 'prestação', 'prestacao'] },
  { label: 'Calcular uma rescisão', href: '/calculadora-de-rescisao', description: 'Férias, 13º, aviso e FGTS em uma estimativa', keywords: ['rescisão', 'rescisao', 'demissão', 'demissao', 'fgts', 'trabalhista', 'clt'] },
  { label: 'Montar um currículo', href: '/gerador-de-curriculo', description: 'Currículo profissional em PDF', keywords: ['currículo', 'curriculo', 'cv', 'emprego', 'vaga', 'carreira'] },
  { label: 'Corrigir uma redação', href: '/corretor-de-redacao-enem', description: 'Nota estimada por competência do ENEM', keywords: ['redação', 'redacao', 'enem', 'texto', 'nota', 'estudo'] },
  { label: 'Gerar referências ABNT', href: '/gerador-de-referencias-abnt', description: 'Sites, livros e artigos formatados', keywords: ['abnt', 'referência', 'referencia', 'bibliografia', 'tcc'] },
  { label: 'Editar um PDF', href: '/editor-de-pdf-online', description: 'Edite, junte, gire e organize páginas', keywords: ['pdf', 'editar', 'juntar', 'mesclar', 'girar', 'arquivo'] }
] as const;

const QUICK_INTENTS = INTENTS.slice(0, 5);

function normalize(value: string) {
  return value.trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function IntentFinder() {
  const [query, setQuery] = useState('');
  const normalized = normalize(query);
  const results = useMemo(() => {
    if (!normalized) return QUICK_INTENTS;
    const tokens = normalized.split(/\s+/).filter(Boolean);
    return INTENTS.filter((intent) => {
      const haystack = normalize([intent.label, intent.description, ...intent.keywords].join(' '));
      return tokens.every((token) => haystack.includes(token));
    }).slice(0, 5);
  }, [normalized]);

  return (
    <div className="rounded-[28px] border border-white/15 bg-white/10 p-4 shadow-2xl shadow-slate-950/30 backdrop-blur-md sm:p-5">
      <label htmlFor="home-intent" className="flex items-center gap-2 text-sm font-bold text-white">
        <Sparkles className="h-4 w-4 text-amber-300" aria-hidden />
        O que você precisa resolver hoje?
      </label>
      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
        <input id="home-intent" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: fazer um recibo, cobrar um cliente..." autoComplete="off" className="h-14 w-full rounded-2xl border border-white/20 bg-white pl-12 pr-4 text-base text-slate-950 shadow-sm outline-none placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-300/25" />
      </div>
      <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/35">
        {results.length ? (
          <ul aria-label={normalized ? 'Ferramentas encontradas' : 'Atalhos populares'}>
            {results.map((intent) => (
              <li key={intent.href} className="border-b border-white/10 last:border-0">
                <Link href={intent.href} onClick={() => trackEvent('home_intent_selected', { intent: intent.label, query })} className="group flex min-h-14 items-center justify-between gap-4 px-4 py-3 transition hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none">
                  <span><span className="block text-sm font-bold text-white">{intent.label}</span><span className="mt-0.5 block text-xs text-slate-300">{intent.description}</span></span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-amber-300 transition group-hover:translate-x-1" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-sm text-slate-200">Não encontramos essa tarefa. <Link href={`/recursos${query ? `?q=${encodeURIComponent(query)}` : ''}`} className="font-bold text-amber-300 hover:underline">Ver todo o catálogo</Link></div>
        )}
      </div>
    </div>
  );
}
