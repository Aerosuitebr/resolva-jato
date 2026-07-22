'use client';

import { describePartiesPreamble } from '@/lib/juridicos/clauses';
import { getDocumentFontStack } from '@/lib/documents/fonts';
import { DOC_MARGIN, DOC_MARGIN_COMFORT, DOC_PAGE } from '@/lib/documents/page';
import { getLegalDocumentTitle, getLegalTemplate } from '@/lib/juridicos/templates';
import type { LegalDocumentData } from '@/lib/juridicos/types';
import { cn } from '@/lib/utils';

interface JuridicoPreviewProps {
  data: LegalDocumentData;
}

export function JuridicoPreview({ data }: JuridicoPreviewProps) {
  const meta = getLegalTemplate(data.templateId);
  const title = getLegalDocumentTitle(data.templateId);
  const parties = describePartiesPreamble(data);
  const ink = data.inkSaver;
  const academic = ['fichamento-jurisprudencia', 'estudo-caso', 'parecer-academico', 'relatorio-audiencia', 'roteiro-peca'].includes(data.templateId);

  return (
    <article
      className={cn(DOC_PAGE, 'flex flex-col', ink ? DOC_MARGIN : DOC_MARGIN_COMFORT)}
      style={{
        fontFamily: getDocumentFontStack('peticao', data.fontId),
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
        {data.templateId === 'substabelecimento' ? (
          <p className="mt-2 text-xs font-bold uppercase tracking-wide text-amber-800">
            {data.reservePowers ? 'Com reserva de poderes' : 'Sem reserva de poderes'}
          </p>
        ) : null}
      </header>

      <IntroParagraph data={data} parties={parties} />

      <div className="mt-8 space-y-5">
        {data.clauses.map((item, index) => (
          <section key={item.id}>
            <h2 className="text-[13px] font-bold uppercase tracking-wide text-slate-950">
              {['notificacao', 'hipossuficiencia', 'peticao-inicial', 'contestacao', 'recurso-inominado', 'declaracao-residencia', 'fichamento-jurisprudencia', 'estudo-caso', 'parecer-academico', 'relatorio-audiencia', 'roteiro-peca'].includes(data.templateId)
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

      {!academic ? (
        <div className={cn('mt-14 grid gap-10', meta.labels.showPartyB ? 'sm:grid-cols-2' : '')}>
          <SignatureBlock label={meta.labels.partyA} name={data.partyA.name} />
          {meta.labels.showPartyB ? (
            <SignatureBlock label={meta.labels.partyB} name={data.partyB.name} />
          ) : null}
        </div>
      ) : (
        <div className="mt-10 border-t border-slate-300 pt-4 text-[12px] leading-6 text-slate-600">
          <p><strong>Autor(a):</strong> {data.partyA.name || '[nome do estudante]'}</p>
          {data.partyA.email ? <p><strong>Contato:</strong> {data.partyA.email}</p> : null}
        </div>
      )}

      {(data.witness1 || data.witness2) && (
        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          <SignatureBlock label="Testemunha 1" name={data.witness1} />
          <SignatureBlock label="Testemunha 2" name={data.witness2} />
        </div>
      )}

      <p className="mt-auto pt-10 text-center text-[10px] leading-5 text-slate-400">
        Modelo orientativo gerado no Resolva Jato. Não substitui assessoria jurídica especializada.
        Revise os termos antes de assinar ou protocolar. Faça o seu em resolvajato.com.br
      </p>
    </article>
  );
}

function IntroParagraph({
  data,
  parties
}: {
  data: LegalDocumentData;
  parties: { partyA: string; partyB: string };
}) {
  if (data.templateId === 'procuracao') {
    return (
      <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
        Pelo presente instrumento particular, {parties.partyA}, nomeia e constitui seu bastante
        procurador {parties.partyB}
        {data.oabNumber ? `, inscrito(a) na ${data.oabNumber}` : ''}, outorgando-lhe os poderes
        adiante especificados:
      </p>
    );
  }

  if (data.templateId === 'honorarios') {
    return (
      <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
        Pelo presente instrumento particular, de um lado {parties.partyA}; e, de outro lado{' '}
        {parties.partyB}
        {data.oabNumber ? `, inscrito(a) na ${data.oabNumber}` : ''}; resolvem celebrar o presente
        contrato de honorários advocatícios, que se regerá pelas cláusulas seguintes:
      </p>
    );
  }

  if (data.templateId === 'substabelecimento') {
    return (
      <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
        Pelo presente instrumento, {parties.partyA}
        {data.oabNumber ? `, inscrito(a) na ${data.oabNumber}` : ''}, substabelece{' '}
        {data.reservePowers ? 'COM RESERVA' : 'SEM RESERVA'} DE PODERES a {parties.partyB}, os
        poderes que lhe foram conferidos, nos termos abaixo:
      </p>
    );
  }

  if (data.templateId === 'hipossuficiencia') {
    return (
      <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
        {parties.partyA}, vem, respeitosamente, perante quem de direito, DECLARAR o que segue:
      </p>
    );
  }

  if (data.templateId === 'declaracao-residencia') {
    return (
      <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
        {parties.partyA}, DECLARA, para os devidos fins e sob as penas da lei, o que segue:
      </p>
    );
  }

  if (['peticao-inicial', 'contestacao', 'recurso-inominado'].includes(data.templateId)) {
    return (
      <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
        Excelentíssimo(a) Senhor(a) Doutor(a) Juiz(a) de Direito de {data.court || '[juízo / comarca]'}.<br /><br />
        {parties.partyA}, por seu advogado, vem respeitosamente apresentar a presente peça em face de {parties.partyB},
        {data.caseNumber ? ` nos autos do processo nº ${data.caseNumber},` : ''} pelos fundamentos a seguir expostos:
      </p>
    );
  }

  if (data.templateId === 'acordo-extrajudicial') {
    return (
      <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
        Pelo presente instrumento particular, {parties.partyA} e {parties.partyB} resolvem celebrar o presente acordo extrajudicial, mediante as condições seguintes:
      </p>
    );
  }

  if (['fichamento-jurisprudencia', 'estudo-caso', 'parecer-academico', 'relatorio-audiencia', 'roteiro-peca'].includes(data.templateId)) {
    return (
      <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
        Material acadêmico elaborado por {data.partyA.name || '[nome do estudante]'} para fins de estudo, pesquisa e prática jurídica simulada.
      </p>
    );
  }

  return (
    <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
      {parties.partyA}, doravante NOTIFICANTE, vem notificar formalmente {parties.partyB},
      doravante NOTIFICADO(A), nos termos abaixo:
    </p>
  );
}

function ClosingParagraph({ data }: { data: LegalDocumentData }) {
  if (['fichamento-jurisprudencia', 'estudo-caso', 'parecer-academico', 'relatorio-audiencia', 'roteiro-peca'].includes(data.templateId)) {
    return (
      <p className="mt-8 text-justify text-[13px] italic leading-7 text-slate-600">
        Documento acadêmico: confira as referências, atualize a legislação e adapte a estrutura às orientações da instituição de ensino.
      </p>
    );
  }
  if (data.templateId === 'hipossuficiencia' || data.templateId === 'declaracao-residencia') {
    return (
      <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
        Por ser expressão da verdade, firma a presente declaração para que produza seus efeitos
        legais, ciente das sanções civis e penais aplicáveis à falsa declaração.
      </p>
    );
  }

  if (data.templateId === 'notificacao') {
    return (
      <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
        Nestes termos, aguarda-se o cumprimento no prazo indicado, sob pena das medidas judiciais
        cabíveis, sem prejuízo de outras cominações legais.
      </p>
    );
  }

  if (['peticao-inicial', 'contestacao', 'recurso-inominado'].includes(data.templateId)) {
    return (
      <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
        Nestes termos, pede deferimento.
      </p>
    );
  }

  if (data.templateId === 'procuracao' || data.templateId === 'substabelecimento') {
    return (
      <p className="mt-8 text-justify text-[13px] leading-7 text-slate-800">
        E, por estarem assim justos e contratados, assinam o presente instrumento em via(s) de
        igual teor, na presença das testemunhas abaixo, se houver, para que produza seus efeitos
        legais.
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
