'use client';

import { describePartiesPreamble } from '@/lib/contratos/clauses';
import { getDocumentFontStack } from '@/lib/documents/fonts';
import { DOC_MARGIN, DOC_MARGIN_COMFORT, DOC_PAGE } from '@/lib/documents/page';
import { getContractTemplate, getContractTitle } from '@/lib/contratos/templates';
import type { ContractData } from '@/lib/contratos/types';
import { cn } from '@/lib/utils';

interface ContratoPreviewProps {
  data: ContractData;
}

export function ContratoPreview({ data }: ContratoPreviewProps) {
  const meta = getContractTemplate(data.templateId);
  const title = getContractTitle(data.templateId);
  const parties = describePartiesPreamble(data);
  const ink = data.inkSaver;

  return (
    <article
      className={cn(DOC_PAGE, 'flex flex-col', ink ? DOC_MARGIN : DOC_MARGIN_COMFORT)}
      style={{
        fontFamily: getDocumentFontStack('contrato', data.fontId),
        fontVariantNumeric: 'lining-nums'
      }}
    >
      {!ink ? (
        <div className={cn('mb-8 h-1.5 w-full rounded-full bg-gradient-to-r', meta.previewClass)} />
      ) : null}

      <header className="text-center">
        <h1 className="text-xl font-bold leading-snug tracking-wide text-slate-950 sm:text-2xl">
          {title}
        </h1>
      </header>

      <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
        Pelo presente instrumento particular, de um lado {parties.partyA}; e, de outro lado{' '}
        {parties.partyB}; resolvem celebrar o presente contrato, que se regerá pelas cláusulas e
        condições seguintes:
      </p>

      <div className="mt-8 space-y-5">
        {data.clauses.map((item, index) => (
          <section key={item.id}>
            <h2 className="text-[13px] font-bold uppercase tracking-wide text-slate-950">
              CLÁUSULA {index + 1}ª · {item.title}
            </h2>
            <p className="mt-2 text-justify text-[13px] leading-7 text-slate-800 whitespace-pre-wrap">
              {item.body}
            </p>
          </section>
        ))}
      </div>

      {data.extraNotes ? (
        <p className="mt-6 text-justify text-[12px] leading-6 text-slate-600 italic">
          Observações: {data.extraNotes}
        </p>
      ) : null}

      <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
        E, por estarem assim justas e contratadas, as partes assinam o presente instrumento em 2
        (duas) vias de igual teor, na presença das testemunhas abaixo, se houver, para que produza
        seus efeitos legais.
      </p>

      <p className="mt-8 text-center text-[13px] text-slate-800">
        {data.city || 'Cidade'}
        {data.state ? `/${data.state}` : ''}, {data.signedAt || '____/____/______'}.
      </p>

      <div className="mt-14 grid gap-10 sm:grid-cols-2">
        <SignatureBlock label={meta.labels.partyA} name={data.partyA.name} />
        <SignatureBlock label={meta.labels.partyB} name={data.partyB.name} />
      </div>

      {(data.witness1 || data.witness2) && (
        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          <SignatureBlock label="Testemunha 1" name={data.witness1} />
          <SignatureBlock label="Testemunha 2" name={data.witness2} />
        </div>
      )}

      <p className="mt-auto pt-10 text-center text-[10px] leading-5 text-slate-400">
        Modelo orientativo gerado no Resolva Jato. Não substitui assessoria jurídica especializada.
        Revise os termos antes de assinar.
      </p>
    </article>
  );
}

function SignatureBlock({ label, name }: { label: string; name: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-3 h-px w-48 bg-slate-800" />
      <p className="text-[12px] font-bold text-slate-900">{name || '________________________'}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}
