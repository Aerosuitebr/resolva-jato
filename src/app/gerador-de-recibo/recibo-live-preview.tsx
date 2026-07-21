'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { ReciboPreview } from '@/components/recibos/recibo-preview';
import { SAMPLE_RECEIPT } from '@/lib/recibos/defaults';
import { parseCurrency } from '@/lib/formatters';
import type { ReceiptTemplateId } from '@/lib/recibos/types';

const TEMPLATES: { id: ReceiptTemplateId; name: string }[] = [
  { id: 'profissional', name: 'Profissional' },
  { id: 'moderno', name: 'Moderno' },
  { id: 'compacto', name: 'Compacto' }
];

export function ReciboLivePreview() {
  const [receiverName, setReceiverName] = useState(SAMPLE_RECEIPT.receiver.name);
  const [payerName, setPayerName] = useState(SAMPLE_RECEIPT.payer.name);
  const [amountInput, setAmountInput] = useState(SAMPLE_RECEIPT.amountInput);
  const [templateId, setTemplateId] = useState<ReceiptTemplateId>(SAMPLE_RECEIPT.templateId);

  const previewData = useMemo(() => {
    const amount = parseCurrency(amountInput) || SAMPLE_RECEIPT.amount;
    return {
      ...SAMPLE_RECEIPT,
      templateId,
      amount,
      amountInput: amountInput || SAMPLE_RECEIPT.amountInput,
      receiver: { ...SAMPLE_RECEIPT.receiver, name: receiverName || SAMPLE_RECEIPT.receiver.name },
      payer: { ...SAMPLE_RECEIPT.payer, name: payerName || SAMPLE_RECEIPT.payer.name }
    };
  }, [receiverName, payerName, amountInput, templateId]);

  const checklist = [
    { label: 'Quem recebe', done: receiverName.trim().length > 2 },
    { label: 'Quem paga', done: payerName.trim().length > 2 },
    { label: 'Valor', done: amountInput.trim().length > 2 },
    { label: 'Modelo escolhido', done: true }
  ];
  const completedCount = checklist.filter((item) => item.done).length;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-start">
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div aria-live="polite">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Seu progresso</span>
            <span className="text-xs font-bold text-sky-700">{completedCount}/{checklist.length}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-sky-600 transition-all"
              style={{ width: `${(completedCount / checklist.length) * 100}%` }}
            />
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span
                  className={`grid h-4 w-4 place-items-center rounded-full ${
                    item.done ? 'bg-emerald-500 text-white' : 'border border-slate-300 bg-white'
                  }`}
                  aria-hidden
                >
                  {item.done && <Check className="h-2.5 w-2.5" />}
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="rec-receiver">
            Quem recebe
          </label>
          <input
            id="rec-receiver"
            value={receiverName}
            onChange={(event) => setReceiverName(event.target.value)}
            placeholder="Ex: Ana Lima Design"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="rec-payer">
            Quem paga
          </label>
          <input
            id="rec-payer"
            value={payerName}
            onChange={(event) => setPayerName(event.target.value)}
            placeholder="Ex: Mercado Central Ltda"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="rec-valor">
            Valor
          </label>
          <input
            id="rec-valor"
            value={amountInput}
            onChange={(event) => setAmountInput(event.target.value)}
            placeholder="Ex: R$ 1.500,00"
            aria-describedby="rec-valor-dica"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200"
          />
          <p id="rec-valor-dica" className="mt-1 text-xs font-medium text-slate-500">
            O valor por extenso é gerado automaticamente no recibo.
          </p>
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-slate-800">
            Modelo <span className="font-normal text-slate-500">— veja a mudança em tempo real</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setTemplateId(template.id)}
                aria-pressed={templateId === template.id}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  templateId === template.id
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-sky-400 hover:text-sky-700'
                }`}
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        <Link
          href="/cadastro?next=/ferramentas/recibos"
          className="block w-full rounded-lg bg-sky-600 px-4 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
        >
          Continuar e baixar meu recibo
        </Link>
        <p className="text-center text-xs font-medium text-slate-500">Grátis para começar. Sem cartão de crédito.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-8">
        <div className="mx-auto max-w-[560px] origin-top scale-[0.85] rounded-lg bg-white shadow-lg sm:scale-100">
          <ReciboPreview data={previewData} />
        </div>
      </div>
    </div>
  );
}
