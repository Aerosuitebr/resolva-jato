import { formatPartyAddressLine } from '@/lib/document-party';
import { getLegalTemplate } from './templates';
import type { LegalClause, LegalDocumentData, LegalParty } from './types';

function partyLine(party: LegalParty, role: string) {
  const name = party.name || `[Nome do ${role}]`;
  const doc = party.document || '[CPF/CNPJ]';
  const nationality = party.nationality || 'brasileiro(a)';
  const marital = party.maritalStatus || 'estado civil não informado';
  const profession = party.profession || 'profissão não informada';
  const address = formatPartyAddressLine(party);
  return `${name}, ${nationality}, ${marital}, ${profession}, inscrito(a) no CPF/CNPJ sob o nº ${doc}, residente e domiciliado(a) em ${address}, doravante denominado(a) ${role.toUpperCase()}`;
}

function clause(id: string, title: string, body: string): LegalClause {
  return { id, title, body };
}

export function buildDefaultClauses(data: LegalDocumentData): LegalClause[] {
  const meta = getLegalTemplate(data.templateId);
  const a = meta.labels.partyA;
  const b = meta.labels.partyB;
  const object = data.objectDescription || `[descrição do ${meta.labels.objectLabel.toLowerCase()}]`;
  const value = data.valueLabel || '[valor]';
  const payment = data.paymentTerms || '[forma de pagamento]';
  const city = data.city || '[cidade]';
  const powers =
    data.powers ||
    'o foro em geral, com cláusulas ad judicia et extra, podendo propor ações, contestar, recorrer, desistir, transigir, firmar compromissos, receber e dar quitação, e praticar todos os atos necessários ao bom e fiel desempenho do mandato';
  const oab = data.oabNumber || '[OAB/UF nº]';
  const caseNumber = data.caseNumber || '[número do processo, se houver]';
  const court = data.court || '[juízo / comarca]';
  const deadline = data.deadline || '[prazo]';
  const facts = data.facts || '[relato dos fatos]';
  const request = data.request || '[pedido / pretensão]';

  switch (data.templateId) {
    case 'procuracao':
      return [
        clause(
          'c1',
          'DO MANDATO',
          `O(A) ${a} nomeia e constitui seu bastante procurador o(a) ${b}, inscrito(a) na ${oab}, a quem confere amplos poderes para o foro em geral.`
        ),
        clause(
          'c2',
          'DOS PODERES',
          `Além dos poderes da cláusula ad judicia, fica o(a) outorgado(a) autorizado(a) a: ${powers}.`
        ),
        clause(
          'c3',
          'DO OBJETO',
          `O mandato destina-se especialmente a: ${object}${data.caseNumber ? `, no processo nº ${caseNumber}` : ''}${data.court ? `, perante ${court}` : ''}.`
        ),
        clause(
          'c4',
          'DA VIGÊNCIA',
          `A presente procuração vigorará por prazo indeterminado, podendo ser revogada a qualquer tempo mediante comunicação escrita ao(à) outorgado(a).`
        ),
        clause(
          'c5',
          'DO FORO',
          `Fica eleito o foro da comarca de ${city} para dirimir quaisquer questões oriundas deste instrumento.`
        )
      ];

    case 'honorarios':
      return [
        clause(
          'c1',
          'DO OBJETO',
          `O presente contrato tem por objeto a prestação de serviços advocatícios pelo(a) ${b} ao(à) ${a}, consistindo em: ${object}.`
        ),
        clause(
          'c2',
          'DOS HONORÁRIOS',
          `Pelos serviços descritos, o(a) ${a} pagará ao(à) ${b} o valor de ${value}, nas seguintes condições: ${payment}.`
        ),
        clause(
          'c3',
          'DAS OBRIGAÇÕES DO ADVOGADO',
          `Cabe ao(à) ${b} atuar com zelo, ética e diligência, prestar informações sobre o andamento da causa e observar as normas do Estatuto da Advocacia e do Código de Ética e Disciplina da OAB.`
        ),
        clause(
          'c4',
          'DAS OBRIGAÇÕES DO CLIENTE',
          `Cabe ao(à) ${a} fornecer documentos e informações verdadeiras, comparecer quando solicitado e efetuar os pagamentos nas datas ajustadas.`
        ),
        clause(
          'c5',
          'DAS CUSTAS E DESPESAS',
          `Custas processuais, taxas, diligências e despesas extraordinárias correrão por conta do(a) ${a}, salvo ajuste diverso por escrito.`
        ),
        clause(
          'c6',
          'DA RESCISÃO',
          `Qualquer das partes poderá rescindir o contrato mediante comunicação escrita, observando-se a remuneração proporcional aos serviços já prestados.`
        ),
        clause(
          'c7',
          'DO FORO',
          `Fica eleito o foro da comarca de ${city} para dirimir dúvidas oriundas deste contrato.`
        )
      ];

    case 'substabelecimento':
      return [
        clause(
          'c1',
          'DO SUBSTABELECIMENTO',
          `O(A) ${a}, inscrito(a) na ${oab}, substabelece ${data.reservePowers ? 'COM RESERVA DE PODERES' : 'SEM RESERVA DE PODERES'} ao(à) ${b} os poderes que lhe foram outorgados.`
        ),
        clause(
          'c2',
          'DOS ATOS E PROCESSO',
          `O substabelecimento refere-se a: ${object}${data.caseNumber ? `, processo nº ${caseNumber}` : ''}${data.court ? `, em trâmite perante ${court}` : ''}.`
        ),
        clause(
          'c3',
          'DOS PODERES TRANSFERIDOS',
          `Ficam transferidos os seguintes poderes: ${powers}.`
        ),
        clause(
          'c4',
          'DA RESPONSABILIDADE',
          data.reservePowers
            ? `O(A) ${a} permanece com poderes concomitantes e poderá continuar a praticar atos no interesse do mandante.`
            : `Com o substabelecimento sem reserva, o(a) ${a} deixa de exercer os poderes ora transferidos, respondendo o(a) ${b} pelos atos que praticar.`
        ),
        clause(
          'c5',
          'DO FORO',
          `Fica eleito o foro da comarca de ${city} para dirimir questões relativas a este instrumento.`
        )
      ];

    case 'hipossuficiencia':
      return [
        clause(
          'c1',
          'DA DECLARAÇÃO',
          `O(A) ${a} declara, sob as penas da lei, que não possui condições financeiras de arcar com as custas processuais e honorários advocatícios sem prejuízo do próprio sustento e de sua família.`
        ),
        clause(
          'c2',
          'DA JUSTIÇA GRATUITA',
          `Por essa razão, requer os benefícios da gratuidade de justiça previstos na Constituição Federal e no Código de Processo Civil${data.caseNumber ? `, nos autos do processo nº ${caseNumber}` : ''}${data.court ? `, em trâmite perante ${court}` : ''}.`
        ),
        clause(
          'c3',
          'DA VERACIDADE',
          `O(A) declarante compromete-se a informar qualquer alteração relevante em sua situação econômico-financeira e está ciente das consequências legais de declaração falsa.`
        ),
        clause(
          'c4',
          'DO LOCAL',
          `A presente declaração é firmada em ${city}${data.state ? `/${data.state}` : ''} para que produza seus efeitos legais.`
        )
      ];

    case 'notificacao':
      return [
        clause(
          'c1',
          'DO OBJETO',
          `Por meio da presente, o(a) ${a} NOTIFICA formalmente o(a) ${b} acerca do seguinte assunto: ${object}.`
        ),
        clause(
          'c2',
          'DOS FATOS',
          facts
        ),
        clause(
          'c3',
          'DO PEDIDO',
          `Diante do exposto, o(a) notificante exige: ${request}${data.valueLabel ? ` Valor envolvido: ${value}.` : ''}`
        ),
        clause(
          'c4',
          'DO PRAZO',
          `Fica concedido o prazo de ${deadline} para cumprimento voluntário, contado do recebimento desta notificação, sob pena das medidas judiciais cabíveis, inclusive cobrança de encargos, perdas e danos.`
        ),
        clause(
          'c5',
          'DA CIÊNCIA',
          `A presente notificação extrajudicial serve para todos os fins de direito, inclusive para constituir em mora e interromper eventual prazo prescricional, quando aplicável.`
        )
      ];

    case 'peticao-inicial':
      return [
        clause('c1', 'DOS FATOS', facts),
        clause('c2', 'DOS FUNDAMENTOS', data.extraNotes || '[apresente os fundamentos jurídicos aplicáveis ao caso]'),
        clause('c3', 'DOS PEDIDOS', `Diante do exposto, requer: ${request}`),
        clause('c4', 'DAS PROVAS', 'Requer a produção de todas as provas admitidas em direito, especialmente documental, testemunhal e pericial, se necessárias.'),
        clause('c5', 'DO VALOR DA CAUSA', `Atribui-se à causa o valor de ${value}.`)
      ];

    case 'contestacao':
      return [
        clause('c1', 'SÍNTESE DA DEMANDA', facts),
        clause('c2', 'DAS PRELIMINARES', data.extraNotes || '[indique eventuais matérias preliminares ou informe que não há preliminares]'),
        clause('c3', 'DO MÉRITO', object),
        clause('c4', 'DOS PEDIDOS', `Diante do exposto, requer: ${request || 'o acolhimento da defesa e a improcedência dos pedidos formulados pela parte autora'}.`),
        clause('c5', 'DAS PROVAS', 'Requer a produção de todas as provas admitidas em direito, na extensão necessária à demonstração dos fatos alegados.')
      ];

    case 'recurso-inominado':
      return [
        clause('c1', 'DA TEMPESTIVIDADE E DO CABIMENTO', `O presente recurso é interposto contra a sentença proferida no processo nº ${caseNumber}, perante ${court}, observados o prazo e os requisitos legais aplicáveis.`),
        clause('c2', 'SÍNTESE DA DECISÃO RECORRIDA', facts),
        clause('c3', 'DAS RAZÕES PARA REFORMA', object),
        clause('c4', 'DOS PEDIDOS', `Requer o conhecimento e provimento do recurso para: ${request || '[descreva a reforma pretendida]'}.`),
        clause('c5', 'DO FECHO', 'Requer o regular processamento do recurso e sua remessa à Turma Recursal competente.')
      ];

    case 'acordo-extrajudicial':
      return [
        clause('c1', 'DO OBJETO', `As partes resolvem compor amigavelmente a controvérsia relativa a: ${object}.`),
        clause('c2', 'DO VALOR E PAGAMENTO', `O valor ajustado é de ${value}, a ser pago da seguinte forma: ${payment}.`),
        clause('c3', 'DAS OBRIGAÇÕES', request || '[descreva as obrigações assumidas por cada parte]'),
        clause('c4', 'DO INADIMPLEMENTO', `O descumprimento das obrigações autoriza a cobrança do saldo devido, sem prejuízo das medidas cabíveis. Prazo para cumprimento: ${deadline}.`),
        clause('c5', 'DA QUITAÇÃO', 'Cumpridas integralmente as obrigações, as partes conferirão quitação recíproca quanto ao objeto deste acordo.'),
        clause('c6', 'DO FORO', `Fica eleito o foro da comarca de ${city} para dirimir questões decorrentes deste instrumento.`)
      ];

    case 'declaracao-residencia':
      return [
        clause('c1', 'DA DECLARAÇÃO', `O(A) ${a} declara, sob as penas da lei, que reside no endereço informado em sua qualificação.`),
        clause('c2', 'DA FINALIDADE', `A presente declaração destina-se a: ${object}.`),
        clause('c3', 'DA VERACIDADE', 'O(A) declarante afirma serem verdadeiras as informações prestadas e declara estar ciente das responsabilidades civis, administrativas e penais decorrentes de declaração falsa.')
      ];

    case 'fichamento-jurisprudencia':
      return [
        clause('c1', 'REFERÊNCIA DO JULGADO', object),
        clause('c2', 'CONTEXTO FÁTICO', facts),
        clause('c3', 'QUESTÃO JURÍDICA E TESE', request || '[indique a questão discutida e a tese firmada pelo tribunal]'),
        clause('c4', 'FUNDAMENTOS DETERMINANTES', data.extraNotes || '[registre os fundamentos jurídicos centrais e as normas citadas]'),
        clause('c5', 'ANÁLISE CRÍTICA', '[avalie a coerência da decisão, seus efeitos e possíveis divergências]')
      ];

    case 'estudo-caso':
      return [
        clause('c1', 'APRESENTAÇÃO DO CASO', facts),
        clause('c2', 'PROBLEMA JURÍDICO', object),
        clause('c3', 'NORMAS E PRECEDENTES APLICÁVEIS', data.extraNotes || '[indique legislação, princípios, doutrina e jurisprudência pertinentes]'),
        clause('c4', 'ANÁLISE FUNDAMENTADA', '[relacione os fatos às normas e confronte as interpretações possíveis]'),
        clause('c5', 'SOLUÇÃO PROPOSTA', request || '[apresente uma solução juridicamente fundamentada]')
      ];

    case 'parecer-academico':
      return [
        clause('c1', 'CONSULTA', object),
        clause('c2', 'RELATÓRIO', facts),
        clause('c3', 'FUNDAMENTAÇÃO', data.extraNotes || '[desenvolva a análise com legislação, doutrina e jurisprudência]'),
        clause('c4', 'CONCLUSÃO', request || '[responda objetivamente à consulta e indique a orientação proposta]')
      ];

    case 'relatorio-audiencia':
      return [
        clause('c1', 'IDENTIFICAÇÃO DA AUDIÊNCIA', `${object}${data.caseNumber ? ` — processo nº ${caseNumber}` : ''}${data.court ? `, realizada perante ${court}` : ''}.`),
        clause('c2', 'PARTICIPANTES E CONTEXTO', facts),
        clause('c3', 'ATOS REALIZADOS', request || '[descreva tentativas de conciliação, depoimentos, requerimentos e decisões]'),
        clause('c4', 'RESULTADO', '[registre o resultado, os encaminhamentos e os prazos fixados]'),
        clause('c5', 'APRENDIZADO E ANÁLISE', data.extraNotes || '[relacione a experiência às regras processuais estudadas]')
      ];

    case 'roteiro-peca':
      return [
        clause('c1', 'IDENTIFICAÇÃO E CABIMENTO', object),
        clause('c2', 'COMPETÊNCIA E ENDEREÇAMENTO', court),
        clause('c3', 'SÍNTESE DOS FATOS', facts),
        clause('c4', 'FUNDAMENTOS JURÍDICOS', data.extraNotes || '[liste teses, dispositivos legais e precedentes úteis]'),
        clause('c5', 'PEDIDOS E REQUERIMENTOS', request || '[organize os pedidos em ordem lógica]'),
        clause('c6', 'CHECKLIST FINAL', 'Verificar tempestividade, legitimidade, documentos, valor da causa, provas, fechamento e assinatura.')
      ];
  }
}

export function describePartiesPreamble(data: LegalDocumentData) {
  const meta = getLegalTemplate(data.templateId);
  return {
    partyA: partyLine(data.partyA, meta.labels.partyA),
    partyB: meta.labels.showPartyB ? partyLine(data.partyB, meta.labels.partyB) : ''
  };
}
