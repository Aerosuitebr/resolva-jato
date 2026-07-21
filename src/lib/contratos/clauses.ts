import { formatPartyAddressLine } from '@/lib/document-party';
import { getContractTemplate } from './templates';
import type { ContractClause, ContractData, ContractParty } from './types';

function partyLine(party: ContractParty, role: string) {
  const name = party.name || `[Nome do ${role}]`;
  const doc = party.document || '[CPF/CNPJ]';
  const nationality = party.nationality || 'brasileiro(a)';
  const marital = party.maritalStatus || 'estado civil não informado';
  const profession = party.profession || 'profissão não informada';
  const address = formatPartyAddressLine(party);
  return `${name}, ${nationality}, ${marital}, ${profession}, inscrito(a) no CPF/CNPJ sob o nº ${doc}, residente e domiciliado(a) em ${address}, doravante denominado(a) ${role.toUpperCase()}`;
}

function clause(id: string, title: string, body: string): ContractClause {
  return { id, title, body };
}

export function buildDefaultClauses(data: ContractData): ContractClause[] {
  const meta = getContractTemplate(data.templateId);
  const a = meta.labels.partyA;
  const b = meta.labels.partyB;
  const object = data.objectDescription || `[descrição do ${meta.labels.objectLabel.toLowerCase()}]`;
  const value = data.valueLabel || '[valor]';
  const payment = data.paymentTerms || '[forma de pagamento]';
  const start = data.startDate || '[data de início]';
  const end = data.endDate || '[data de término]';
  const duration = data.duration || '[prazo]';
  const city = data.city || '[cidade]';

  switch (data.templateId) {
    case 'prestacao-servicos':
      return [
        clause(
          'c1',
          'DO OBJETO',
          `O presente contrato tem por objeto a prestação dos seguintes serviços pelo(a) ${b} ao(à) ${a}: ${object}.`
        ),
        clause(
          'c2',
          'DO PRAZO',
          `Os serviços serão executados no prazo de ${duration}, com início em ${start}${data.endDate ? ` e término previsto em ${end}` : ''}, podendo ser prorrogado mediante acordo escrito entre as partes.`
        ),
        clause(
          'c3',
          'DO PREÇO E PAGAMENTO',
          `Pelos serviços descritos, o(a) ${a} pagará ao(à) ${b} o valor de ${value}, nas seguintes condições: ${payment}.`
        ),
        clause(
          'c4',
          'DAS OBRIGAÇÕES DO CONTRATADO',
          `Cabe ao(à) ${b} executar os serviços com zelo, qualidade técnica e dentro do prazo acordado, fornecendo informações necessárias ao acompanhamento pelo(a) ${a}.`
        ),
        clause(
          'c5',
          'DAS OBRIGAÇÕES DO CONTRATANTE',
          `Cabe ao(à) ${a} fornecer informações, acessos e materiais indispensáveis à execução, bem como efetuar os pagamentos nas datas estipuladas.`
        ),
        clause(
          'c6',
          'DA RESCISÃO',
          `Qualquer das partes poderá rescindir este contrato mediante comunicação escrita com antecedência mínima de 15 (quinze) dias, sem prejuízo de valores já devidos pelos serviços prestados.`
        ),
        clause(
          'c7',
          'DO FORO',
          `Fica eleito o foro da comarca de ${city} para dirimir quaisquer dúvidas oriundas deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.`
        )
      ];

    case 'aluguel-residencial':
    case 'locacao-comercial': {
      const use =
        data.templateId === 'aluguel-residencial'
          ? 'exclusivamente para fins residenciais'
          : 'para fins comerciais, conforme atividade declarada pelo(a) Locatário(a)';
      return [
        clause(
          'c1',
          'DO OBJETO',
          `O(A) ${a} dá em locação ao(à) ${b} o imóvel situado em: ${object}, que será utilizado ${use}.`
        ),
        clause(
          'c2',
          'DO PRAZO',
          `A locação vigorará pelo prazo de ${duration}, com início em ${start}${data.endDate ? ` e término em ${end}` : ''}, podendo ser renovada por acordo entre as partes.`
        ),
        clause(
          'c3',
          'DO ALUGUEL E ENCARGOS',
          `O aluguel mensal é de ${value}, a ser pago até a data e na forma a seguir: ${payment}. Correm por conta do(a) ${b} os encargos de consumo (água, energia, gás e similares), salvo disposição em contrário.`
        ),
        clause(
          'c4',
          'DAS OBRIGAÇÕES DO LOCATÁRIO',
          `O(A) ${b} obriga-se a conservar o imóvel, utilizá-lo conforme a destinação contratada, não realizar obras estruturais sem autorização escrita e devolvê-lo em bom estado de conservação, salvo desgaste natural.`
        ),
        clause(
          'c5',
          'DAS OBRIGAÇÕES DO LOCADOR',
          `O(A) ${a} garante a posse mansa e pacífica do imóvel e se obriga a entregar o bem em condições de uso, respondendo pelos vícios ocultos que impossibilitem a fruição.`
        ),
        clause(
          'c6',
          'DA RESCISÃO E MULTA',
          `A rescisão antecipada por qualquer das partes sujeitará o infrator às penalidades cabíveis, incluindo eventual multa correspondente a até 3 (três) aluguéis, sem prejuízo de perdas e danos.`
        ),
        clause(
          'c7',
          'DO FORO',
          `Fica eleito o foro da comarca de ${city} para dirimir as questões deste contrato.`
        )
      ];
    }

    case 'trabalho':
      return [
        clause(
          'c1',
          'DO OBJETO E FUNÇÃO',
          `O(A) ${a} contrata o(a) ${b} para exercer a função de: ${object}, sob as condições deste instrumento.`
        ),
        clause(
          'c2',
          'DA JORNADA E LOCAL',
          `A prestação ocorrerá conforme jornada e local acordados entre as partes, com início em ${start}, pelo prazo de ${duration}${data.endDate ? `, com término previsto em ${end}` : ''}.`
        ),
        clause(
          'c3',
          'DA REMUNERAÇÃO',
          `O(A) ${b} receberá a remuneração de ${value}, paga da seguinte forma: ${payment}.`
        ),
        clause(
          'c4',
          'DAS OBRIGAÇÕES DO EMPREGADO',
          `O(A) ${b} compromete-se a cumprir as atribuições do cargo com diligência, observar normas internas e zelar pelos bens e informações confidenciais do(a) ${a}.`
        ),
        clause(
          'c5',
          'DAS OBRIGAÇÕES DO EMPREGADOR',
          `O(A) ${a} fornecerá os meios necessários ao exercício da função e efetuará o pagamento da remuneração nas datas acordadas.`
        ),
        clause(
          'c6',
          'DA RESCISÃO',
          `O contrato poderá ser rescindido nas hipóteses legais ou por acordo entre as partes, observando-se os avisos e verbas eventualmente devidos.`
        ),
        clause(
          'c7',
          'DO FORO',
          `Fica eleito o foro da comarca de ${city} para dirimir controvérsias decorrentes deste contrato.`
        )
      ];

    case 'compra-venda':
      return [
        clause(
          'c1',
          'DO OBJETO',
          `O(A) ${a} vende ao(à) ${b}, que aceita comprar, o seguinte bem: ${object}.`
        ),
        clause(
          'c2',
          'DO PREÇO E PAGAMENTO',
          `O preço total da venda é de ${value}, a ser pago da seguinte forma: ${payment}.`
        ),
        clause(
          'c3',
          'DA ENTREGA',
          `A entrega do bem ocorrerá em ${start}, no local acordado entre as partes, momento em que se transferirão a posse e os riscos ao(à) ${b}, salvo disposição em contrário.`
        ),
        clause(
          'c4',
          'DAS GARANTIAS',
          `O(A) ${a} declara ser legítimo proprietário(a) do bem, livre de ônus, dívidas e gravames, respondendo pela evicção nos termos da lei.`
        ),
        clause(
          'c5',
          'DO INADIMPLEMENTO',
          `O atraso no pagamento poderá ensejar a rescisão do contrato e a cobrança de encargos moratórios, sem prejuízo de outras medidas cabíveis.`
        ),
        clause(
          'c6',
          'DO FORO',
          `Fica eleito o foro da comarca de ${city} para dirimir quaisquer litígios oriundos deste contrato.`
        )
      ];

    case 'comodato':
      return [
        clause(
          'c1',
          'DO OBJETO',
          `O(A) ${a} cede em comodato ao(à) ${b}, a título gratuito e temporário, o seguinte bem: ${object}. Valor estimado apenas para referência: ${value}.`
        ),
        clause(
          'c2',
          'DO PRAZO',
          `O comodato vigorará por ${duration}, a partir de ${start}${data.endDate ? `, com devolução prevista para ${end}` : ''}.`
        ),
        clause(
          'c3',
          'DAS OBRIGAÇÕES DO COMODATÁRIO',
          `O(A) ${b} usará o bem com cuidado, apenas para a finalidade acordada, não podendo emprestá-lo ou aliená-lo a terceiros, e o devolverá no estado em que o recebeu, salvo desgaste natural.`
        ),
        clause(
          'c4',
          'DAS OBRIGAÇÕES DO COMODANTE',
          `O(A) ${a} entrega o bem em condições de uso e garante a posse mansa e pacífica durante o prazo do comodato.`
        ),
        clause(
          'c5',
          'DA RESTITUIÇÃO',
          `Ao término do prazo, ou mediante solicitação justificada do(a) ${a}, o bem deverá ser restituído imediatamente, sob pena das medidas legais cabíveis.`
        ),
        clause(
          'c6',
          'DO FORO',
          `Fica eleito o foro da comarca de ${city} para dirimir questões relativas a este contrato.`
        )
      ];
  }
}

export function describePartiesPreamble(data: ContractData) {
  const meta = getContractTemplate(data.templateId);
  return {
    partyA: partyLine(data.partyA, meta.labels.partyA),
    partyB: partyLine(data.partyB, meta.labels.partyB)
  };
}
