'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SeoPageFaqItem } from '@/lib/seo-pages/types';

export function ToolLandingFaq({ faq }: { faq: SeoPageFaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="border-y border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">Dúvidas frequentes</p>
        <h2 className="rj-display mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Perguntas frequentes
        </h2>
        <ul className="mt-8 divide-y divide-slate-200 rounded-[24px] border border-slate-200 bg-white shadow-sm">
          {faq.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <li key={item.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-bold text-slate-900 sm:text-base">{item.question}</span>
                  <ChevronDown
                    className={cn('h-4 w-4 shrink-0 text-slate-500 transition-transform', isOpen && 'rotate-180')}
                    aria-hidden
                  />
                </button>
                {isOpen && (
                  <p className="px-5 pb-4 text-sm leading-6 text-slate-600">{item.answer}</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
