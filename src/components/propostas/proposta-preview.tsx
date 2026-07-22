/* eslint-disable @next/next/no-img-element */
import { DigitalSignatureDisplay } from '@/components/shared/digital-signature-display';
import { formatAddressLine } from '@/components/shared/address-fields';
import { formatCurrency } from '@/lib/formatters';
import type { ProposalData } from '@/lib/propostas/types';
import { formatDate } from '@/lib/utils';

interface PropostaPreviewProps {
  data: ProposalData;
}

interface ProposalMetrics {
  subtotal: number;
  discount: number;
  total: number;
  companyAddress: string;
  clientAddress: string;
  validUntil: string;
}

type LayoutProps = { data: ProposalData; metrics: ProposalMetrics; ink: boolean };

function validityDate(issueDate: string, days: number) {
  if (!issueDate) return '';
  const date = new Date(`${issueDate}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function computeMetrics(data: ProposalData): ProposalMetrics {
  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = subtotal * Math.min(Math.max(data.discountPercent, 0), 100) / 100;
  const total = subtotal - discount + data.shipping;
  return {
    subtotal,
    discount,
    total,
    companyAddress: formatAddressLine(data.company.address),
    clientAddress: formatAddressLine(data.client.address),
    validUntil: validityDate(data.issueDate, data.validityDays)
  };
}

function CompanyLogo({
  data,
  className = 'h-14 w-14',
  fallbackClass = 'bg-sky-600 text-white'
}: {
  data: ProposalData;
  className?: string;
  fallbackClass?: string;
}) {
  if (data.company.logoDataUrl) {
    return (
      <img
        src={data.company.logoDataUrl}
        alt=""
        className={`shrink-0 object-contain object-left ${className}`}
      />
    );
  }
  return (
    <div className={`grid shrink-0 place-items-center rounded-2xl text-xl font-bold ${fallbackClass} ${className}`}>
      {(data.company.name || 'E').charAt(0).toUpperCase()}
    </div>
  );
}

function TotalsPanel({
  data,
  metrics,
  ink,
  accent = 'sky'
}: {
  data: ProposalData;
  metrics: ProposalMetrics;
  ink: boolean;
  accent?: 'sky' | 'slate' | 'navy';
}) {
  const accentBg = ink
    ? 'border-t-2 border-slate-900 bg-white text-slate-900'
    : accent === 'slate'
      ? 'bg-slate-800 text-white'
      : accent === 'navy'
        ? 'bg-slate-900 text-white'
        : 'bg-sky-600 text-white';
  return (
    <div className="ml-auto w-64 overflow-hidden rounded-xl border border-slate-300">
      <div className="flex justify-between px-4 py-2">
        <span>Subtotal</span>
        <strong>{formatCurrency(metrics.subtotal)}</strong>
      </div>
      {metrics.discount > 0 ? (
        <div className="flex justify-between border-t border-slate-200 px-4 py-2 text-rose-700">
          <span>Desconto ({data.discountPercent}%)</span>
          <strong>- {formatCurrency(metrics.discount)}</strong>
        </div>
      ) : null}
      {data.shipping > 0 ? (
        <div className="flex justify-between border-t border-slate-200 px-4 py-2">
          <span>Frete/adicional</span>
          <strong>{formatCurrency(data.shipping)}</strong>
        </div>
      ) : null}
      <div className={`flex justify-between px-4 py-3 text-sm font-bold ${accentBg}`}>
        <strong>Total</strong>
        <strong>{formatCurrency(metrics.total)}</strong>
      </div>
    </div>
  );
}

function ItemsTable({
  data,
  ink,
  accentText = 'text-sky-700'
}: {
  data: ProposalData;
  ink: boolean;
  accentText?: string;
}) {
  const headBg = ink ? 'bg-white' : 'bg-slate-100';
  const numberColor = ink ? 'text-slate-900' : accentText;
  return (
    <table className="mt-3 w-full table-fixed border-collapse">
      <thead>
        <tr className={`text-left text-[10px] uppercase tracking-wide text-slate-600 ${headBg}`}>
          <th className="w-8 border border-slate-300 px-2 py-2 text-center">#</th>
          <th className="border border-slate-300 px-3 py-2">Descrição</th>
          <th className="w-14 border border-slate-300 px-2 py-2 text-center">Qtd.</th>
          <th className="w-24 border border-slate-300 px-3 py-2 text-right">Unitário</th>
          <th className="w-24 border border-slate-300 px-3 py-2 text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {data.items.map((item, index) => (
          <tr key={item.id} className="align-top">
            <td className={`border border-slate-300 px-2 py-3 text-center font-semibold ${numberColor}`}>{index + 1}</td>
            <td className="border border-slate-300 px-3 py-3">
              <strong className="block text-slate-900">{item.name || 'Produto ou serviço'}</strong>
              {item.description ? <span className="mt-0.5 block text-[10px] text-slate-600">{item.description}</span> : null}
            </td>
            <td className="border border-slate-300 px-2 py-3 text-center">{item.quantity}</td>
            <td className="border border-slate-300 px-3 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
            <td className="border border-slate-300 px-3 py-3 text-right font-bold text-slate-900">
              {formatCurrency(item.quantity * item.unitPrice)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TermsSection({
  data,
  accentText = 'text-sky-700'
}: {
  data: ProposalData;
  accentText?: string;
}) {
  return (
    <section className="mt-7 grid grid-cols-2 gap-4">
      <div className="rounded-xl border border-slate-300 p-4">
        <p className={`text-[10px] font-bold uppercase tracking-[0.12em] ${accentText}`}>Pagamento</p>
        <p className="mt-1 whitespace-pre-wrap text-slate-800">{data.paymentTerms || 'A combinar'}</p>
      </div>
      <div className="rounded-xl border border-slate-300 p-4">
        <p className={`text-[10px] font-bold uppercase tracking-[0.12em] ${accentText}`}>Entrega</p>
        <p className="mt-1 whitespace-pre-wrap text-slate-800">{data.deliveryTerms || 'A combinar'}</p>
      </div>
    </section>
  );
}

function ProposalFooter({ data }: { data: ProposalData }) {
  return (
    <footer data-rj-keep className="mt-auto space-y-4 border-t border-slate-300 pt-12">
      <div className="flex items-end justify-between gap-8">
        <DigitalSignatureDisplay
          signature={{
            ...data.signature,
            text: data.signature.text.trim() || data.company.name
          }}
          subtitle={data.company.name || 'Responsável pela proposta'}
          size="md"
          className="min-w-64"
        />
        <div className="text-right text-[10px] text-slate-600">
          <p className="font-semibold text-slate-800">{data.company.name || 'Nome ou empresa'}</p>
          <p>{[data.company.email, data.company.phone].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
    </footer>
  );
}

function CorporativaLayout({ data, metrics, ink }: LayoutProps) {
  const accentBorder = ink ? 'border-slate-900' : 'border-sky-600';
  const accentText = ink ? 'text-slate-900' : 'text-sky-700';
  return (
    <article className="flex min-h-[297mm] flex-col bg-white p-[15mm] text-[12px] leading-relaxed text-slate-700">
      <header className={`flex items-start justify-between gap-8 border-b-[3px] pb-6 ${accentBorder}`}>
        <div className="flex min-w-0 items-center gap-4">
          <CompanyLogo data={data} fallbackClass={ink ? 'border-2 border-slate-900 bg-white text-slate-900' : 'bg-sky-600 text-white'} />
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold text-slate-900">{data.company.name || 'Nome ou empresa'}</h2>
            {data.company.document ? <p>{data.company.document}</p> : null}
            <p>{[data.company.email, data.company.phone].filter(Boolean).join(' · ')}</p>
            {metrics.companyAddress ? <p className="text-[10px] text-slate-600">{metrics.companyAddress}</p> : null}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${accentText}`}>Proposta comercial</p>
          <p className="mt-1 text-base font-bold text-slate-900">{data.number || '-'}</p>
          <p>Emissão: {data.issueDate ? formatDate(data.issueDate) : '—'}</p>
          <p>Válida até: {metrics.validUntil ? formatDate(metrics.validUntil) : '—'}</p>
        </div>
      </header>

      <section className="mt-7 grid grid-cols-[1fr_auto] gap-6 rounded-xl border border-slate-300 bg-slate-50 p-5">
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${accentText}`}>Preparada para</p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">{data.client.name || 'Nome do cliente'}</h3>
          {data.client.document ? <p>CPF/CNPJ: {data.client.document}</p> : null}
          {data.client.contact ? <p>A/C: {data.client.contact}</p> : null}
          <p>{[data.client.email, data.client.phone].filter(Boolean).join(' · ')}</p>
          {metrics.clientAddress ? <p className="text-[10px] text-slate-600">{metrics.clientAddress}</p> : null}
        </div>
        <div className="max-w-48 text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Investimento</p>
          <p className={`mt-1 text-2xl font-bold ${accentText}`}>{formatCurrency(metrics.total)}</p>
        </div>
      </section>

      {data.introduction ? (
        <section className="mt-6">
          <p className="whitespace-pre-wrap">{data.introduction}</p>
        </section>
      ) : null}

      <section className="mt-7">
        <h3 className={`border-b border-slate-300 pb-2 text-sm font-bold uppercase tracking-[0.12em] ${accentText}`}>
          Produtos e serviços
        </h3>
        <ItemsTable data={data} ink={ink} accentText={accentText} />
        <TotalsPanel data={data} metrics={metrics} ink={ink} accent="sky" />
      </section>

      <TermsSection data={data} accentText={accentText} />

      {data.notes ? (
        <section className={`mt-5 rounded-xl border-l-4 px-4 py-3 ${ink ? 'border-slate-900 bg-slate-50' : 'border-amber-500 bg-amber-50'}`}>
          <p className={`text-[10px] font-bold uppercase tracking-[0.12em] ${ink ? 'text-slate-900' : 'text-amber-800'}`}>Observações</p>
          <p className={`mt-1 whitespace-pre-wrap ${ink ? 'text-slate-800' : 'text-amber-950'}`}>{data.notes}</p>
        </section>
      ) : null}

      <ProposalFooter data={data} />
    </article>
  );
}

function ExecutivaLayout({ data, metrics, ink }: LayoutProps) {
  const phases = [
    { step: '01', title: 'Aprovação', detail: data.paymentTerms || 'Confirmação das condições comerciais' },
    { step: '02', title: 'Execução', detail: data.deliveryTerms || 'Início após o aceite formal' },
    { step: '03', title: 'Entrega', detail: `Validade da proposta: ${data.validityDays} dias` }
  ];
  const headerClass = ink
    ? 'border-b-2 border-slate-900 bg-white text-slate-900'
    : 'bg-gradient-to-br from-slate-900 to-slate-700 text-white';
  const headerMuted = ink ? 'text-slate-600' : 'text-white/80';
  const headerFaint = ink ? 'text-slate-500' : 'text-slate-300';
  const headerDivider = ink ? 'border-slate-200' : 'border-white/15';

  return (
    <article className="flex min-h-[297mm] flex-col bg-white text-[12px] leading-relaxed text-slate-700">
      <header className={`px-[15mm] py-8 ${headerClass}`}>
        <div className="flex items-start justify-between gap-8">
          <div className="flex min-w-0 items-center gap-4">
            <CompanyLogo data={data} fallbackClass={ink ? 'border-2 border-slate-900 bg-white text-slate-900' : 'bg-white/15 text-white'} />
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold">{data.company.name || 'Nome ou empresa'}</h2>
              {data.company.document ? <p className={headerMuted}>{data.company.document}</p> : null}
              <p className={headerMuted}>{[data.company.email, data.company.phone].filter(Boolean).join(' · ')}</p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${headerFaint}`}>Proposta executiva</p>
            <p className="mt-1 text-lg font-bold">{data.number || '-'}</p>
            <p className={headerMuted}>Emissão: {data.issueDate ? formatDate(data.issueDate) : '—'}</p>
            <p className={headerMuted}>Válida até: {metrics.validUntil ? formatDate(metrics.validUntil) : '—'}</p>
          </div>
        </div>
        <div className={`mt-6 border-t pt-5 ${headerDivider}`}>
          <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${headerFaint}`}>Cliente</p>
          <h3 className="mt-1 text-lg font-bold">{data.client.name || 'Nome do cliente'}</h3>
          {data.client.contact ? <p className={headerMuted}>A/C: {data.client.contact}</p> : null}
        </div>
      </header>

      <div className="flex flex-1 flex-col p-[15mm]">
        {data.introduction ? (
          <section className="rounded-xl border border-slate-300 bg-slate-50 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Resumo executivo</p>
            <p className="mt-2 whitespace-pre-wrap text-slate-800">{data.introduction}</p>
          </section>
        ) : null}

        <section className="mt-7">
          <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-800">Cronograma do projeto</h3>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {phases.map((phase) => (
              <div key={phase.step} className="relative rounded-xl border border-slate-300 p-4">
                <span className="text-2xl font-black text-slate-300">{phase.step}</span>
                <p className="mt-1 font-bold text-slate-900">{phase.title}</p>
                <p className="mt-1 text-[10px] leading-5 text-slate-600">{phase.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <div className="flex items-end justify-between gap-4 border-b border-slate-300 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-800">Escopo e investimento</h3>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(metrics.total)}</p>
          </div>
          <ItemsTable data={data} ink={ink} accentText="text-slate-700" />
          <TotalsPanel data={data} metrics={metrics} ink={ink} accent="slate" />
        </section>

        <TermsSection data={data} accentText="text-slate-700" />

        {data.notes ? (
          <section className="mt-5 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Observações</p>
            <p className="mt-1 whitespace-pre-wrap">{data.notes}</p>
          </section>
        ) : null}

        <div data-rj-keep className="mt-6 space-y-4">
          <div className="rounded-xl border-2 border-dashed border-slate-400 px-4 py-3 text-center text-[10px] text-slate-600">
            Aceite da proposta: _________________________ &nbsp; Data: ___/___/______
          </div>
          <ProposalFooter data={data} />
        </div>
      </div>
    </article>
  );
}

function CriativaLayout({ data, metrics, ink }: LayoutProps) {
  const sidebarClass = ink
    ? 'border-r-2 border-slate-900 bg-white text-slate-900'
    : 'bg-gradient-to-b from-slate-900 to-blue-950 text-white';
  const sidebarStrong = ink ? 'text-slate-900' : 'text-white';
  const sidebarMuted = ink ? 'text-slate-600' : 'text-slate-300';
  const sidebarFaint = ink ? 'text-slate-500' : 'text-slate-400';
  const sidebarDivider = ink ? 'border-slate-200' : 'border-white/15';
  const accentText = ink ? 'text-slate-900' : 'text-blue-900';
  const eyebrow = ink ? 'text-slate-700' : 'text-blue-900';

  const investCard = ink
    ? 'border-2 border-slate-900 bg-white'
    : 'border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50';
  const investLabel = ink ? 'text-slate-700' : 'text-blue-900';
  const investValue = ink ? 'text-slate-900' : 'text-slate-900';
  const badgeClass = ink
    ? 'border border-slate-900 bg-white text-slate-900'
    : 'bg-slate-900 text-white';
  const itemCard = ink ? 'border-slate-300 bg-white' : 'border-slate-200 bg-white';

  return (
    <article className="box-border flex min-h-[297mm] bg-white p-[15mm] text-[12px] leading-relaxed text-slate-700">
      <aside className={`flex w-[62mm] shrink-0 flex-col px-4 py-1 ${sidebarClass}`}>
        <CompanyLogo
          data={data}
          className="h-14 w-full"
          fallbackClass={ink ? 'border-2 border-slate-900 bg-white text-slate-900' : 'bg-white/15 text-white'}
        />
        <h2 className={`mt-4 text-lg font-bold leading-tight ${sidebarStrong}`}>{data.company.name || 'Nome ou empresa'}</h2>
        {data.company.document ? <p className={`mt-2 text-[10px] ${sidebarMuted}`}>{data.company.document}</p> : null}
        <p className={`mt-3 whitespace-pre-line text-[10px] leading-5 ${sidebarMuted}`}>
          {[data.company.email, data.company.phone].filter(Boolean).join('\n')}
        </p>
        {metrics.companyAddress ? (
          <p className={`mt-3 text-[10px] leading-5 ${sidebarFaint}`}>{metrics.companyAddress}</p>
        ) : null}

        <div className={`mt-auto border-t pt-5 ${sidebarDivider}`}>
          <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${sidebarFaint}`}>Proposta</p>
          <p className={`mt-1 font-bold ${sidebarStrong}`}>{data.number || '-'}</p>
          <p className={`mt-2 text-[10px] ${sidebarMuted}`}>
            {data.issueDate ? formatDate(data.issueDate) : '—'}
            {metrics.validUntil ? ` → ${formatDate(metrics.validUntil)}` : ''}
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pl-[8mm] pr-1 pt-1">
        <header>
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${eyebrow}`}>Proposta criativa</p>
          <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900">
            {data.title || 'Nova proposta comercial'}
          </h1>
          <p className="mt-3 text-sm text-slate-700">
            Para <strong className="text-slate-900">{data.client.name || 'Nome do cliente'}</strong>
            {data.client.contact ? ` · A/C ${data.client.contact}` : ''}
          </p>
        </header>

        <section className={`mt-6 rounded-2xl p-5 ${investCard}`}>
          <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${investLabel}`}>Investimento total</p>
          <p className={`mt-1 text-4xl font-black tracking-tight ${investValue}`}>{formatCurrency(metrics.total)}</p>
          {metrics.discount > 0 ? (
            <p className={`mt-1 text-[10px] ${investLabel}`}>
              Inclui {data.discountPercent}% de desconto ({formatCurrency(metrics.discount)})
            </p>
          ) : null}
        </section>

        {data.introduction ? (
          <section className="mt-5">
            <p className="whitespace-pre-wrap text-slate-700">{data.introduction}</p>
          </section>
        ) : null}

        <section className="mt-6">
          <h3 className={`text-sm font-bold uppercase tracking-[0.12em] ${accentText}`}>O que está incluso</h3>
          <div className="mt-3 space-y-3">
            {data.items.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-start justify-between gap-4 rounded-xl border p-4 shadow-sm ${itemCard}`}
              >
                <div className="min-w-0">
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${eyebrow}`}>Item {index + 1}</span>
                  <p className="mt-0.5 font-bold text-slate-900">{item.name || 'Produto ou serviço'}</p>
                  {item.description ? (
                    <p className="mt-1 text-[10px] leading-5 text-slate-600">{item.description}</p>
                  ) : null}
                  {item.quantity > 1 ? (
                    <p className="mt-1 text-[10px] text-slate-600">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  ) : null}
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${badgeClass}`}>
                  {formatCurrency(item.quantity * item.unitPrice)}
                </span>
              </div>
            ))}
          </div>

          {(metrics.discount > 0 || data.shipping > 0) && (
            <div className="ml-auto mt-4 w-56 space-y-1 text-right text-[11px]">
              <p>Subtotal: {formatCurrency(metrics.subtotal)}</p>
              {metrics.discount > 0 ? <p className="text-rose-600">Desconto: -{formatCurrency(metrics.discount)}</p> : null}
              {data.shipping > 0 ? <p>Adicional: {formatCurrency(data.shipping)}</p> : null}
            </div>
          )}
        </section>

        <TermsSection data={data} accentText={accentText} />

        {data.notes ? (
          <section className={`mt-5 rounded-xl border-l-4 px-4 py-3 ${ink ? 'border-slate-900 bg-slate-50' : 'border-slate-900 bg-slate-50'}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700">Observações</p>
            <p className="mt-1 whitespace-pre-wrap text-slate-800">{data.notes}</p>
          </section>
        ) : null}

        <ProposalFooter data={data} />
      </div>
    </article>
  );
}

export function PropostaPreview({ data }: PropostaPreviewProps) {
  const metrics = computeMetrics(data);
  const ink = data.inkSaver ?? false;
  const templateId = data.templateId ?? 'corporativa';

  if (templateId === 'executiva') {
    return <ExecutivaLayout data={data} metrics={metrics} ink={ink} />;
  }
  if (templateId === 'criativa') {
    return <CriativaLayout data={data} metrics={metrics} ink={ink} />;
  }
  return <CorporativaLayout data={data} metrics={metrics} ink={ink} />;
}
