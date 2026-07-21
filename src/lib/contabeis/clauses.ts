import { formatPartyAddressLine } from '@/lib/document-party';
import { getContabilTemplate } from './templates';
import type { ContabilClause, ContabilDocumentData, ContabilParty } from './types';

function partyLine(party: ContabilParty, role: string) {
  const name = party.name || `[Nome do ${role}]`;
  const doc = party.document || '[CPF/CNPJ]';
  const nationality = party.nationality || 'brasileiro(a)';
  const marital = party.maritalStatus || 'estado civil não informado';
  const profession = party.profession || 'profissão não informada';
  const address = formatPartyAddressLine(party);
  return `${name}, ${nationality}, ${marital}, ${profession}, inscrito(a) no CPF/CNPJ sob o nº ${doc}, residente e domiciliado(a) em ${address}, doravante denominado(a) ${role.toUpperCase()}`;
}

function clause(id: string, title: string, body: string): ContabilClause {
  return { id, title, body };
}

export function buildDefaultClauses(data: ContabilDocumentData): ContabilClause[] {
  const meta = getContabilTemplate(data.templateId);
  const a = meta.labels.partyA;
  const b = meta.labels.partyB;
  const object = data.objectDescription || `[descrição do ${meta.labels.objectLabel.toLowerCase()}]`;
  const value = data.valueLabel || '[valor]';
  const payment = data.paymentTerms || '[forma de pagamento]';
  const city = data.city || '[cidade]';
  const registry = data.professionalRegistry || '[CRC / registro profissional]';
  const period = data.periodLabel || '[período / competência]';
  const company = data.companyName || '[razão social]';
  const companyDoc = data.companyDocument || '[CNPJ/CPF]';

  switch (data.templateId) {
    case 'servicos-contabeis':
      return [
        clause(
          'c1',
          'DO OBJETO',
          `O presente contrato tem por objeto a prestação de serviços contábeis pelo(a) ${b} ao(à) ${a}, abrangendo: ${object}.`
        ),
        clause(
          'c2',
          'DOS HONORÁRIOS',
          `Pelos serviços, o(a) ${a} pagará ao(à) ${b} o valor de ${value}, nas condições: ${payment}.`
        ),
        clause(
          'c3',
          'DAS OBRIGAÇÕES DO CONTADOR',
          `Cabe ao(à) ${b}, inscrito(a) sob ${registry}, executar os serviços com zelo técnico, observar a legislação vigente e manter sigilo profissional.`
        ),
        clause(
          'c4',
          'DAS OBRIGAÇÕES DO CLIENTE',
          `Cabe ao(à) ${a} fornecer documentos e informações verdadeiras e tempestivas, bem como efetuar os pagamentos nas datas ajustadas.`
        ),
        clause(
          'c5',
          'DO PRAZO',
          `Os serviços serão prestados de forma contínua a partir da assinatura, podendo ser rescindidos por qualquer das partes mediante aviso prévio de 30 (trinta) dias.`
        ),
        clause(
          'c6',
          'DO FORO',
          `Fica eleito o foro da comarca de ${city} para dirimir dúvidas oriundas deste contrato.`
        )
      ];

    case 'procuracao-profissional':
      return [
        clause(
          'c1',
          'DO MANDATO',
          `O(A) ${a} nomeia e constitui seu bastante procurador o(a) ${b}${data.professionalRegistry ? `, inscrito(a) sob ${registry}` : ''}, a quem confere poderes para praticar os atos abaixo.`
        ),
        clause(
          'c2',
          'DOS PODERES',
          `Fica o(a) outorgado(a) autorizado(a) a: ${object}.`
        ),
        clause(
          'c3',
          'DA VIGÊNCIA',
          `A presente procuração vigorará por prazo indeterminado, podendo ser revogada a qualquer tempo mediante comunicação escrita.`
        ),
        clause(
          'c4',
          'DO FORO',
          `Fica eleito o foro da comarca de ${city} para dirimir questões relativas a este instrumento.`
        )
      ];

    case 'entrega-documentos':
      return [
        clause(
          'c1',
          'DA ENTREGA',
          `O(A) ${a} entrega ao(à) ${b} os documentos abaixo descritos, para fins de guarda, análise ou protocolo.`
        ),
        clause(
          'c2',
          'DOS DOCUMENTOS',
          `${object}${data.valueLabel ? ` Quantidade/volumes: ${value}.` : ''}${data.periodLabel ? ` Competência/período: ${period}.` : ''}`
        ),
        clause(
          'c3',
          'DO RECEBIMENTO',
          `O(A) ${b} declara ter recebido os documentos em vias/originais/cópias conforme acima, comprometendo-se a dar o tratamento adequado.`
        ),
        clause(
          'c4',
          'DA RESPONSABILIDADE',
          `A partir do recebimento, a guarda e o uso dos documentos passam à responsabilidade do(a) ${b}, sem prejuízo de devolução mediante solicitação.`
        )
      ];

    case 'autorizacao-ecac':
      return [
        clause(
          'c1',
          'DA AUTORIZAÇÃO',
          `O(A) ${a}, responsável por ${company}, inscrito(a) sob ${companyDoc}, autoriza o(a) ${b}${data.professionalRegistry ? `, ${registry}` : ''}, a acessar e operar sistemas digitais em seu nome.`
        ),
        clause(
          'c2',
          'DOS SISTEMAS E PODERES',
          `A autorização abrange: ${object}.`
        ),
        clause(
          'c3',
          'DO PRAZO',
          `A presente autorização vigora por ${value}, podendo ser revogada a qualquer tempo pelo(a) contribuinte.`
        ),
        clause(
          'c4',
          'DO SIGILO',
          `O(A) profissional autorizado(a) compromete-se a utilizar as informações exclusivamente para o cumprimento do mandato e a observar o sigilo fiscal e profissional.`
        )
      ];

    case 'declaracao-residencia':
      return [
        clause(
          'c1',
          'DA DECLARAÇÃO',
          `O(A) ${a} declara, sob as penas da lei, residir no seguinte endereço: ${object}.`
        ),
        clause(
          'c2',
          'DO TEMPO DE RESIDÊNCIA',
          `Declara residir neste endereço desde ${value}, podendo comprovar mediante documentos em seu poder.`
        ),
        clause(
          'c3',
          'DA VERACIDADE',
          `O(A) declarante assume inteira responsabilidade pela veracidade das informações, ciente das sanções legais aplicáveis à falsa declaração.`
        ),
        clause(
          'c4',
          'DO LOCAL',
          `A presente declaração é firmada em ${city}${data.state ? `/${data.state}` : ''} para que produza seus efeitos legais.`
        )
      ];

    case 'carta-responsabilidade':
      return [
        clause(
          'c1',
          'DA IDENTIFICAÇÃO',
          `A administração de ${company}, inscrita sob ${companyDoc}, neste ato representada por ${a}, dirige-se ao(à) ${b}${data.professionalRegistry ? ` (${registry})` : ''} nos termos abaixo.`
        ),
        clause(
          'c2',
          'DO OBJETO',
          `Com referência a ${object}, a administração declara ser responsável pelas informações e documentos fornecidos para elaboração das peças contábeis do período ${period || value}.`
        ),
        clause(
          'c3',
          'DA RESPONSABILIDADE',
          `A administração assume a responsabilidade pela integralidade, exatidão e legitimidade dos dados, registros e documentos disponibilizados ao profissional da contabilidade.`
        ),
        clause(
          'c4',
          'DO CONHECIMENTO',
          `Declara conhecer as normas técnicas e legais aplicáveis e que não há omissões relevantes capazes de distorcer as demonstrações ou obrigações acessórias.`
        ),
        clause(
          'c5',
          'DO LOCAL',
          `Firmada em ${city}${data.state ? `/${data.state}` : ''} para os devidos fins.`
        )
      ];
  }
}

export function describePartiesPreamble(data: ContabilDocumentData) {
  const meta = getContabilTemplate(data.templateId);
  return {
    partyA: partyLine(data.partyA, meta.labels.partyA),
    partyB: meta.labels.showPartyB ? partyLine(data.partyB, meta.labels.partyB) : ''
  };
}
