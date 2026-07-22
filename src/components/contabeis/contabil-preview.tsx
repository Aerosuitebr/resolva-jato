'use client';

import { describePartiesPreamble } from '@/lib/contabeis/clauses';
import { getDocumentFontStack } from '@/lib/documents/fonts';
import { DOC_MARGIN, DOC_MARGIN_COMFORT, DOC_PAGE } from '@/lib/documents/page';
import { getContabilDocumentTitle, getContabilTemplate } from '@/lib/contabeis/templates';
import type { ContabilDocumentData } from '@/lib/contabeis/types';
import { cn } from '@/lib/utils';

interface ContabilPreviewProps {
  data: ContabilDocumentData;
}

export function ContabilPreview({ data }: ContabilPreviewProps) {
  const meta = getContabilTemplate(data.templateId);
  const title = getContabilDocumentTitle(data.templateId);
  const parties = describePartiesPreamble(data);
  const ink = data.inkSaver;
  const useSimpleNumbering =
    data.templateId === 'declaracao-residencia' ||
    data.templateId === 'entrega-documentos' ||
    data.templateId === 'autorizacao-ecac' ||
    data.templateId === 'carta-responsabilidade';

  return (
    <article
      className={cn(DOC_PAGE, 'flex flex-col', ink ? DOC_MARGIN : DOC_MARGIN_COMFORT)}
      style={{
        fontFamily: getDocumentFontStack('contabil', data.fontId),
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

      <IntroParagraph data={data} parties={parties} />

      <div className="mt-8 space-y-5">
        {data.clauses.map((item, index) => (
          <section key={item.id}>
            <h2 className="text-[13px] font-bold uppercase tracking-wide text-slate-950">
              {useSimpleNumbering
                ? `${index + 1}. ${item.title}`
                : `CLÁUSULA ${index + 1}ª · ${item.title}`}
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-justify text-[13px] leading-7 text-slate-800">
              {item.body}
            </p>
          </section>
        ))}
      </div>

      {data.extraNotes ? (
        <p className="mt-6 text-justify text-[12px] italic leading-6 text-slate-600">
          Observações: {data.extraNotes}
        </p>
      ) : null}

      <ClosingParagraph data={data} />

      <p className="mt-8 text-center text-[13px] text-slate-800">
        {data.city || 'Cidade'}
        {data.state ? `/${data.state}` : ''}, {data.signedAt || '____/____/______'}.
      </p>

      <div className={cn('mt-14 grid gap-10', meta.labels.showPartyB ? 'sm:grid-cols-2' : '')}>
        <SignatureBlock label={meta.labels.partyA} name={data.partyA.name} />
        {meta.labels.showPartyB ? (
          <SignatureBlock label={meta.labels.partyB} name={data.partyB.name} />
        ) : null}
      </div>

      {(data.witness1 || data.witness2) && (
        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          <SignatureBlock label="Testemunha 1" name={data.witness1} />
          <SignatureBlock label="Testemunha 2" name={data.witness2} />
        </div>
      )}

      {/* Branding Resolva Jato via DocumentExportShell no export */}
    </article>
  );
}

function IntroParagraph({
  data,
  parties
}: {
  data: ContabilDocumentData;
  parties: { partyA: string; partyB: string };
}) {
  if (data.templateId === 'servicos-contabeis') {
    return (
      <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
        Pelo presente instrumento particular, de um lado {parties.partyA}; e, de outro lado{' '}
        {parties.partyB}
        {data.professionalRegistry ? `, inscrito(a) sob ${data.professionalRegistry}` : ''};
        resolvem celebrar o presente contrato de serviços contábeis:
      </p>
    );
  }

  if (data.templateId === 'procuracao-profissional') {
    return (
      <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
        Pelo presente instrumento particular, {parties.partyA}, nomeia e constitui seu bastante
        procurador {parties.partyB}
        {data.professionalRegistry ? `, inscrito(a) sob ${data.professionalRegistry}` : ''},
        outorgando-lhe os poderes adiante especificados:
      </p>
    );
  }

  if (data.templateId === 'entrega-documentos') {
    return (
      <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
        {parties.partyA} e {parties.partyB} firmam o presente termo para registrar a entrega e o
        recebimento de documentos, nos termos seguintes:
      </p>
    );
  }

  if (data.templateId === 'autorizacao-ecac') {
    return (
      <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
        {parties.partyA} autoriza {parties.partyB} a representar o contribuinte em sistemas digitais,
        conforme abaixo:
      </p>
    );
  }

  if (data.templateId === 'carta-responsabilidade') {
    return (
      <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
        {parties.partyA} dirige-se a {parties.partyB} para formalizar a responsabilidade da
        administração sobre as informações contábeis fornecidas:
      </p>
    );
  }

  return (
    <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
      {parties.partyA}, vem, respeitosamente, DECLARAR o que segue:
    </p>
  );
}

function ClosingParagraph({ data }: { data: ContabilDocumentData }) {
  if (data.templateId === 'declaracao-residencia') {
    return (
      <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
        Por ser expressão da verdade, firma a presente declaração para que produza seus efeitos
        legais.
      </p>
    );
  }

  if (data.templateId === 'entrega-documentos' || data.templateId === 'autorizacao-ecac') {
    return (
      <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
        E, por estarem de acordo, as partes assinam o presente instrumento em vias de igual teor.
      </p>
    );
  }

  return (
    <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
      E, por estarem assim justas e contratadas, as partes assinam o presente instrumento em 2
      (duas) vias de igual teor, na presença das testemunhas abaixo, se houver, para que produza
      seus efeitos legais.
    </p>
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
