import { formatAddressLine } from '@/components/shared/address-fields';
import { DigitalSignatureDisplay } from '@/components/shared/digital-signature-display';
import { getDocumentFontStack } from '@/lib/documents/fonts';
import { currencyToWords, formatCurrency } from '@/lib/formatters';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { ReceiptData } from '@/lib/recibos/types';

interface ReciboPreviewProps {
  data: ReceiptData;
}

interface LayoutContext {
  data: ReceiptData;
  amountLabel: string;
  words: string;
  addressLine: string;
  dateLabel: string;
  cityDate: string;
  inkSaver: boolean;
}

export function ReciboPreview({ data }: ReciboPreviewProps) {
  const amountLabel = data.amount > 0 ? formatCurrency(data.amount) : 'R$ 0,00';
  const words = data.amount > 0 ? currencyToWords(data.amount) : '';
  const addressLine = formatAddressLine(data.address);
  const dateLabel = data.date ? formatDate(data.date) : '';
  const cityDate = [data.city, dateLabel].filter(Boolean).join(', ');
  const inkSaver = Boolean(data.inkSaver);
  const fontFamily = getDocumentFontStack('recibo', data.fontId);

  const ctx: LayoutContext = { data, amountLabel, words, addressLine, dateLabel, cityDate, inkSaver };

  const content =
    data.templateId === 'moderno' ? (
      <ModernLayout {...ctx} />
    ) : data.templateId === 'compacto' ? (
      <CompactLayout {...ctx} />
    ) : (
      <ProfessionalLayout {...ctx} />
    );

  return <div style={{ fontFamily }}>{content}</div>;
}

function BodyStatement({
  data,
  amountLabel,
  words,
  accentClass
}: {
  data: ReceiptData;
  amountLabel: string;
  words: string;
  accentClass: string;
}) {
  return (
    <p>
      Recebi de{' '}
      <strong className={accentClass}>{data.payer.name || '________________________'}</strong>
      {data.payer.document ? ` (${data.payer.document})` : ''} a importância de{' '}
      <strong className={accentClass}>{amountLabel}</strong>
      {words ? (
        <>
          {' '}(<span className="italic">{words}</span>)
        </>
      ) : null}
      , referente a <strong>{data.reference || '________________________'}</strong>.
    </p>
  );
}

// ---------------------------------------------------------------------------
// Profissional — faixa escura, blocos de partes, assinatura centralizada
// ---------------------------------------------------------------------------
function ProfessionalLayout({ data, amountLabel, words, addressLine, dateLabel, cityDate, inkSaver }: LayoutContext) {
  return (
    <div className="flex min-h-[297mm] flex-col bg-white p-[15mm] text-slate-800">
      <div
        className={cn(
          'rounded-2xl p-6',
          inkSaver
            ? 'border-2 border-slate-900 bg-white text-slate-900'
            : 'bg-gradient-to-r from-slate-900 to-slate-700 text-white'
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className={cn(
                'text-xs font-semibold uppercase tracking-[0.24em]',
                inkSaver ? 'text-slate-500' : 'text-white/70'
              )}
            >
              Recibo de pagamento
            </p>
            <h1 className="mt-1 text-3xl font-bold">{amountLabel}</h1>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">Nº {data.number || '-'}</p>
            {dateLabel ? <p className={inkSaver ? 'text-slate-500' : 'text-white/80'}>{dateLabel}</p> : null}
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-6 text-[0.95rem] leading-7">
        <BodyStatement data={data} amountLabel={amountLabel} words={words} accentClass="text-slate-900" />

        {data.paymentMethod ? (
          <p className="text-sm text-slate-600">
            Forma de pagamento: <strong className="text-slate-800">{data.paymentMethod}</strong>
          </p>
        ) : null}

        <p className="text-sm text-slate-600">
          Para maior clareza, firmo o presente recibo dando plena e total quitação do valor acima, nada mais tendo a
          reclamar.
        </p>

        {data.notes ? <p className="text-sm text-slate-600">{data.notes}</p> : null}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6 text-sm">
        <div className={cn('rounded-xl border p-4', inkSaver ? 'border-slate-900 bg-white' : 'border-slate-200 bg-slate-50')}>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Recebedor</p>
          <p className="mt-1 font-semibold text-slate-900">{data.receiver.name || '-'}</p>
          {data.receiver.document ? <p className="text-slate-600">{data.receiver.document}</p> : null}
          {data.receiver.phone ? <p className="text-slate-600">{data.receiver.phone}</p> : null}
          {data.receiver.email ? <p className="text-slate-600">{data.receiver.email}</p> : null}
          {addressLine ? <p className="mt-1 text-xs text-slate-500">{addressLine}</p> : null}
        </div>
        <div className={cn('rounded-xl border p-4', inkSaver ? 'border-slate-900 bg-white' : 'border-slate-200 bg-slate-50')}>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Pagador</p>
          <p className="mt-1 font-semibold text-slate-900">{data.payer.name || '-'}</p>
          {data.payer.document ? <p className="text-slate-600">{data.payer.document}</p> : null}
          {data.payer.phone ? <p className="text-slate-600">{data.payer.phone}</p> : null}
          {data.payer.email ? <p className="text-slate-600">{data.payer.email}</p> : null}
        </div>
      </div>

      <div className="mt-auto pt-14">
        <DigitalSignatureDisplay signature={data.signature} subtitle={cityDate} size="lg" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Moderno — barra lateral colorida, valor em card, partes em colunas
// ---------------------------------------------------------------------------
function ModernLayout({ data, amountLabel, words, addressLine, dateLabel, cityDate, inkSaver }: LayoutContext) {
  return (
    <div className="box-border flex min-h-[297mm] bg-white p-[15mm] text-slate-800">
      <div
        className={cn(
          'w-[8mm] shrink-0 rounded-l-sm',
          inkSaver ? 'border-r-2 border-slate-900 bg-white' : 'bg-gradient-to-b from-sky-600 to-cyan-500'
        )}
      />
      <div className="flex flex-1 flex-col pl-[10mm] pr-0">
        <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'grid h-11 w-11 place-items-center rounded-2xl text-lg font-bold',
                  inkSaver
                    ? 'border-2 border-slate-900 bg-white text-slate-900'
                    : 'bg-sky-600 text-white'
                )}
              >
                {(data.receiver.name || 'R').charAt(0).toUpperCase()}
              </span>
              <div>
                <p
                  className={cn(
                    'text-xs font-semibold uppercase tracking-[0.28em]',
                    inkSaver ? 'text-slate-700' : 'text-sky-600'
                  )}
                >
                  Recibo
                </p>
                <p className="text-lg font-bold text-slate-900">{data.receiver.name || 'Recebedor'}</p>
              </div>
            </div>
          </div>
          <div
            className={cn(
              'rounded-2xl px-5 py-3 text-right',
              inkSaver ? 'border-2 border-slate-900 bg-white' : 'border-2 border-sky-100 bg-sky-50'
            )}
          >
            <p
              className={cn(
                'text-[0.7rem] font-semibold uppercase tracking-[0.18em]',
                inkSaver ? 'text-slate-700' : 'text-sky-700'
              )}
            >
              Valor
            </p>
            <p className={cn('text-2xl font-bold', inkSaver ? 'text-slate-900' : 'text-sky-700')}>{amountLabel}</p>
            <p className="mt-0.5 text-[0.7rem] text-slate-500">
              Nº {data.number || '-'}
              {dateLabel ? ` · ${dateLabel}` : ''}
            </p>
          </div>
        </div>

        <div className="mt-7 space-y-5 text-[0.95rem] leading-7">
          <BodyStatement
            data={data}
            amountLabel={amountLabel}
            words={words}
            accentClass={inkSaver ? 'text-slate-900' : 'text-sky-700'}
          />

          <div className="flex flex-wrap items-center gap-3">
            {data.paymentMethod ? (
              <span
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold',
                  inkSaver
                    ? 'border border-slate-900 bg-white text-slate-900'
                    : 'bg-sky-50 text-sky-700'
                )}
              >
                {data.paymentMethod}
              </span>
            ) : null}
          </div>

          <p className="text-sm text-slate-600">
            Para maior clareza, firmo o presente recibo dando plena e total quitação do valor acima, nada mais tendo a
            reclamar.
          </p>

          {data.notes ? <p className="text-sm text-slate-600">{data.notes}</p> : null}
        </div>

        <div className="mt-8 grid grid-cols-2 divide-x divide-slate-200 text-sm">
          <div className="pr-6">
            <p
              className={cn(
                'text-xs font-semibold uppercase tracking-[0.14em]',
                inkSaver ? 'text-slate-700' : 'text-sky-600'
              )}
            >
              Recebedor
            </p>
            <p className="mt-1 font-semibold text-slate-900">{data.receiver.name || '-'}</p>
            {data.receiver.document ? <p className="text-slate-600">{data.receiver.document}</p> : null}
            {data.receiver.phone ? <p className="text-slate-600">{data.receiver.phone}</p> : null}
            {data.receiver.email ? <p className="text-slate-600">{data.receiver.email}</p> : null}
            {addressLine ? <p className="mt-1 text-xs text-slate-500">{addressLine}</p> : null}
          </div>
          <div className="pl-6">
            <p
              className={cn(
                'text-xs font-semibold uppercase tracking-[0.14em]',
                inkSaver ? 'text-slate-700' : 'text-sky-600'
              )}
            >
              Pagador
            </p>
            <p className="mt-1 font-semibold text-slate-900">{data.payer.name || '-'}</p>
            {data.payer.document ? <p className="text-slate-600">{data.payer.document}</p> : null}
            {data.payer.phone ? <p className="text-slate-600">{data.payer.phone}</p> : null}
            {data.payer.email ? <p className="text-slate-600">{data.payer.email}</p> : null}
          </div>
        </div>

        <div className="mt-auto flex justify-end pt-12">
          <DigitalSignatureDisplay signature={data.signature} subtitle={cityDate} size="lg" className="text-right" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compacto — filete no topo, cabeçalho em linha, densidade alta
// ---------------------------------------------------------------------------
function CompactLayout({ data, amountLabel, words, addressLine, dateLabel, cityDate, inkSaver }: LayoutContext) {
  return (
    <div className="flex min-h-[297mm] flex-col bg-white p-[14mm] text-slate-800">
      <div className={cn('pt-4', inkSaver ? 'border-t-2 border-slate-900' : 'border-t-4 border-emerald-600')}>
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <p
              className={cn(
                'text-[0.7rem] font-bold uppercase tracking-[0.28em]',
                inkSaver ? 'text-slate-800' : 'text-emerald-700'
              )}
            >
              Recibo de pagamento
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Nº {data.number || '-'}
              {dateLabel ? ` · ${dateLabel}` : ''}
            </p>
          </div>
          <div className="text-right">
            <span className={cn('text-2xl font-bold', inkSaver ? 'text-slate-900' : 'text-emerald-700')}>
              {amountLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3 text-[0.9rem] leading-6">
        <BodyStatement
          data={data}
          amountLabel={amountLabel}
          words={words}
          accentClass={inkSaver ? 'text-slate-900' : 'text-emerald-700'}
        />
        {data.paymentMethod ? (
          <p className="text-sm text-slate-600">
            Forma de pagamento: <strong className="text-slate-800">{data.paymentMethod}</strong>
          </p>
        ) : null}
        {data.notes ? <p className="text-sm text-slate-600">{data.notes}</p> : null}
      </div>

      <div
        className={cn(
          'mt-5 grid grid-cols-2 gap-4 rounded-lg p-4 text-[0.82rem] leading-5',
          inkSaver ? 'border border-slate-900 bg-white' : 'bg-slate-50'
        )}
      >
        <div>
          <p
            className={cn(
              'text-[0.68rem] font-bold uppercase tracking-[0.12em]',
              inkSaver ? 'text-slate-800' : 'text-emerald-700'
            )}
          >
            Recebedor
          </p>
          <p className="font-semibold text-slate-900">{data.receiver.name || '-'}</p>
          {data.receiver.document ? <p className="text-slate-600">{data.receiver.document}</p> : null}
          {data.receiver.phone ? <p className="text-slate-600">{data.receiver.phone}</p> : null}
          {data.receiver.email ? <p className="text-slate-600">{data.receiver.email}</p> : null}
          {addressLine ? <p className="text-slate-500">{addressLine}</p> : null}
        </div>
        <div>
          <p
            className={cn(
              'text-[0.68rem] font-bold uppercase tracking-[0.12em]',
              inkSaver ? 'text-slate-800' : 'text-emerald-700'
            )}
          >
            Pagador
          </p>
          <p className="font-semibold text-slate-900">{data.payer.name || '-'}</p>
          {data.payer.document ? <p className="text-slate-600">{data.payer.document}</p> : null}
          {data.payer.phone ? <p className="text-slate-600">{data.payer.phone}</p> : null}
          {data.payer.email ? <p className="text-slate-600">{data.payer.email}</p> : null}
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Firmo o presente recibo dando plena e total quitação do valor acima, nada mais tendo a reclamar.
      </p>

      <div className="mt-auto pt-10">
        <DigitalSignatureDisplay signature={data.signature} subtitle={cityDate} size="md" />
      </div>
    </div>
  );
}
