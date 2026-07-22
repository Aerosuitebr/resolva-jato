export type SeoLandingId =
  | 'orcamento-com-pix'
  | 'para-mei'
  | 'para-freelancers'
  | 'para-estudantes'
  | 'gerador-de-curriculo'
  | 'gerador-de-contrato'
  | 'gerador-de-proposta'
  | 'gerador-de-recibo';

export interface SeoLandingContent {
  id: SeoLandingId;
  path: string;
  toolHref: string;
  eyebrow: string;
  title: string;
  description: string;
  heroBullets: string[];
  primaryCta: string;
  secondaryCta?: { label: string; href: string };
  sections: Array<{ title: string; body: string; bullets?: string[] }>;
  faqs: Array<{ q: string; a: string }>;
  related: Array<{ href: string; label: string; blurb: string }>;
}

export const SEO_LANDINGS: Record<SeoLandingId, SeoLandingContent> = {
  'orcamento-com-pix': {
    id: 'orcamento-com-pix',
    path: '/orcamento-com-pix',
    toolHref: '/ferramentas/orcamentos',
    eyebrow: 'Orçamento digital + Pix',
    title: 'Gerador de orçamento com aprovação e Pix no WhatsApp',
    description:
      'Monte o orçamento, envie o link, o cliente aprova no celular e você cobra com QR Code Pix — grátis para testar.',
    heroBullets: [
      'Cliente aprova sem instalar app',
      'QR Pix e Copia e Cola prontos',
      'Link público para mandar no WhatsApp'
    ],
    primaryCta: 'Criar orçamento grátis',
    secondaryCta: { label: 'Só gerar Pix', href: '/ferramentas/pix' },
    sections: [
      {
        title: 'Do preço à cobrança, no mesmo fluxo',
        body: 'Pare de mandar tabela no Word e Pix solto. O Resolva Jato une orçamento, aprovação e cobrança.',
        bullets: [
          'Página limpa para o cliente no celular',
          'Status aprovado ou pedido de ajuste',
          'Aviso de volta no seu WhatsApp'
        ]
      },
      {
        title: 'Feito para quem fecha no zap',
        body: 'MEIs, freelancers e prestadores que vivem de orçamento rápido — sem ERP e sem mensalidade cara.'
      }
    ],
    faqs: [
      {
        q: 'O cliente precisa criar conta?',
        a: 'Não. Ele abre o link, aprova ou pede ajuste e avisa você no WhatsApp.'
      },
      {
        q: 'É grátis?',
        a: 'Sim — documentos profissionais gratuitos. A busca de recursos também é grátis.'
      },
      {
        q: 'Serve para qualquer serviço?',
        a: 'Sim — elétrica, design, reforma, aulas, consultoria. Basta listar itens e valores.'
      }
    ],
    related: [
      { href: '/para/mei', label: 'Para MEI', blurb: 'Cobrar e organizar o dia a dia' },
      { href: '/para/freelancers', label: 'Para freelancers', blurb: 'Proposta + contrato + Pix' },
      { href: '/gerador-de-recibo', label: 'Gerador de recibo', blurb: 'PDF com valor por extenso' }
    ]
  },
  'para-mei': {
    id: 'para-mei',
    path: '/para/mei',
    toolHref: '/ferramentas/orcamentos',
    eyebrow: 'Para MEI',
    title: 'Ferramentas grátis para MEI cobrar e profissionalizar',
    description:
      'Orçamento com Pix, recibo, contrato e proposta — tudo pensado para quem atende pelo WhatsApp.',
    heroBullets: [
      'Orçamento que o cliente aprova no celular',
      'Recibo e contrato sem papelaria',
      'Sem cartão para começar'
    ],
    primaryCta: 'Começar como MEI',
    secondaryCta: { label: 'Ver ferramentas', href: '/ferramentas' },
    sections: [
      {
        title: 'Seu cliente já está no WhatsApp',
        body: 'Mande o link do orçamento, receba a aprovação e cobre com Pix na hora — sem planilha.'
      },
      {
        title: 'Documentos com cara de empresa',
        body: 'Recibo, contrato de serviços e proposta comercial em PDF, prontos para enviar.',
        bullets: ['Recibo com valor por extenso', 'Contrato editável', 'Proposta com validade']
      }
    ],
    faqs: [
      {
        q: 'Preciso de CNPJ na plataforma?',
        a: 'Não para testar. Você usa seus dados no documento; o cadastro é só e-mail e senha.'
      },
      {
        q: 'Funciona no celular?',
        a: 'Sim. Você monta no desktop ou celular; o cliente abre o orçamento no celular.'
      }
    ],
    related: [
      { href: '/orcamento-com-pix', label: 'Orçamento + Pix', blurb: 'Fluxo completo de cobrança' },
      { href: '/gerador-de-recibo', label: 'Recibo', blurb: 'PDF profissional' },
      { href: '/para/freelancers', label: 'Freelancers', blurb: 'Mesmo stack, outro ângulo' }
    ]
  },
  'para-freelancers': {
    id: 'para-freelancers',
    path: '/para/freelancers',
    toolHref: '/ferramentas/propostas',
    eyebrow: 'Para freelancers',
    title: 'Proposta, contrato e Pix — sem parecer amador',
    description:
      'Feche trabalhos com proposta comercial, contrato e orçamento com Pix. Layouts com cara de agência.',
    heroBullets: [
      'Proposta com totais e validade',
      'Contrato de prestação de serviços',
      'Orçamento aprovável + Pix'
    ],
    primaryCta: 'Montar proposta agora',
    secondaryCta: { label: 'Criar orçamento', href: '/ferramentas/orcamentos' },
    sections: [
      {
        title: 'Do briefing ao pagamento',
        body: 'Envie a proposta, alinhe o contrato e cobre com link de orçamento + Pix — tudo no Resolva Jato.'
      },
      {
        title: 'Menos Word, mais fechamento',
        body: 'Modelos prontos e PDF em um clique — com cara profissional, de graça.'
      }
    ],
    faqs: [
      {
        q: 'Consigo logo na proposta?',
        a: 'Sim, a ferramenta de propostas aceita logo e dados da sua marca.'
      },
      {
        q: 'E se o cliente pedir ajuste?',
        a: 'No orçamento público ele pode pedir ajuste; você recebe o aviso e atualiza o link.'
      }
    ],
    related: [
      { href: '/orcamento-com-pix', label: 'Orçamento + Pix', blurb: 'Cobrança no WhatsApp' },
      { href: '/gerador-de-contrato', label: 'Contratos', blurb: 'Modelos editáveis' },
      {
        href: '/gerador-de-proposta-comercial',
        label: 'Propostas',
        blurb: 'Cara de agência'
      }
    ]
  },
  'para-estudantes': {
    id: 'para-estudantes',
    path: '/para/estudantes',
    toolHref: '/ferramentas/trabalhos',
    eyebrow: 'Para estudantes',
    title: 'Capa ABNT e currículo prontos antes do prazo',
    description:
      'Gere capa de trabalho (escolar e universitária) e currículo profissional em minutos — grátis para testar.',
    heroBullets: [
      'Capa e folha de rosto no padrão ABNT',
      'Currículo com preview ao vivo',
      'PDF para entregar ou imprimir'
    ],
    primaryCta: 'Gerar capa agora',
    secondaryCta: { label: 'Abrir currículo', href: '/ferramentas/curriculo' },
    sections: [
      {
        title: 'Quando o prazo aperta',
        body: 'Preencha os dados da disciplina e baixe a capa. Sem brigar com margens no Word.'
      },
      {
        title: 'Currículo para estágio e primeiro emprego',
        body: 'Layouts limpos, tipografia profissional e exportação em PDF.'
      }
    ],
    faqs: [
      {
        q: 'A capa segue a ABNT?',
        a: 'O modelo universitário segue a estrutura usual de capa/folha de rosto. Confira as regras da sua instituição.'
      },
      {
        q: 'Preciso pagar?',
        a: 'Não. Gere documentos profissionais de graça; a busca de recursos também é gratuita.'
      }
    ],
    related: [
      { href: '/gerador-de-curriculo', label: 'Currículo', blurb: 'PDF profissional' },
      { href: '/para/mei', label: 'Para MEI', blurb: 'Se você já presta serviço' },
      { href: '/busca', label: 'Busca grátis', blurb: 'Links úteis sem cadastro' }
    ]
  },
  'gerador-de-curriculo': {
    id: 'gerador-de-curriculo',
    path: '/gerador-de-curriculo',
    toolHref: '/ferramentas/curriculo',
    eyebrow: 'Currículo online',
    title: 'Gerador de currículo grátis em PDF',
    description:
      'Monte um currículo profissional com preview ao vivo e baixe em PDF — layouts prontos, sem Word.',
    heroBullets: [
      'Preview em tempo real',
      'Layouts com tipografia limpa',
      'PDF com um clique'
    ],
    primaryCta: 'Criar meu currículo',
    sections: [
      {
        title: 'Parece emprego, não modelo genérico',
        body: 'Escolha o layout, preencha experiência e formação, exporte. Ideal para estágio e recolocação.'
      }
    ],
    faqs: [
      {
        q: 'Posso editar depois?',
        a: 'Sim. Com conta grátis você salva e volta a editar.'
      }
    ],
    related: [
      { href: '/para/estudantes', label: 'Para estudantes', blurb: 'Capa ABNT + currículo' },
      { href: '/orcamento-com-pix', label: 'Orçamento + Pix', blurb: 'Se você já atende clientes' }
    ]
  },
  'gerador-de-contrato': {
    id: 'gerador-de-contrato',
    path: '/gerador-de-contrato',
    toolHref: '/ferramentas/contratos',
    eyebrow: 'Contratos',
    title: 'Gerador de contrato online grátis',
    description:
      'Contratos de serviços, aluguel, trabalho e mais — editáveis, com assinaturas no PDF.',
    heroBullets: ['Vários tipos prontos', 'Cláusulas com seus dados', 'PDF para assinar'],
    primaryCta: 'Criar contrato',
    sections: [
      {
        title: 'Sem fila na papelaria',
        body: 'Preencha as partes, ajuste cláusulas e baixe. Modelo orientativo — revise antes de assinar.'
      }
    ],
    faqs: [
      {
        q: 'Substitui advogado?',
        a: 'Não. É um modelo orientativo para agilizar. Para casos complexos, consulte um profissional.'
      }
    ],
    related: [
      { href: '/gerador-de-proposta-comercial', label: 'Propostas', blurb: 'Antes do contrato' },
      { href: '/orcamento-com-pix', label: 'Orçamento + Pix', blurb: 'Depois da aprovação' }
    ]
  },
  'gerador-de-proposta': {
    id: 'gerador-de-proposta',
    path: '/gerador-de-proposta-comercial',
    toolHref: '/ferramentas/propostas',
    eyebrow: 'Propostas comerciais',
    title: 'Gerador de proposta comercial grátis',
    description:
      'Propostas com cara de agência: itens, totais, validade e PDF pronto para enviar ao cliente.',
    heroBullets: ['3 estilos de layout', 'Totais organizados', 'Logo opcional'],
    primaryCta: 'Montar proposta',
    sections: [
      {
        title: 'Pareça grande sem equipe de design',
        body: 'Ideal para freelancers e pequenas agências que precisam enviar preço com presença.'
      }
    ],
    faqs: [
      {
        q: 'Dá para incluir desconto?',
        a: 'Sim. Organize itens, subtotal e condições de pagamento no próprio editor.'
      }
    ],
    related: [
      { href: '/para-freelancers', label: 'Para freelancers', blurb: 'Fluxo completo' },
      { href: '/gerador-de-contrato', label: 'Contrato', blurb: 'Feche o combinado' }
    ]
  },
  'gerador-de-recibo': {
    id: 'gerador-de-recibo',
    path: '/gerador-de-recibo',
    toolHref: '/ferramentas/recibos',
    eyebrow: 'Recibos',
    title: 'Gerador de recibo online grátis em PDF',
    description:
      'Emita recibo profissional com valor por extenso, modelos prontos e assinatura no PDF.',
    heroBullets: ['Valor por extenso automático', '3 modelos', 'PDF com assinatura'],
    primaryCta: 'Emitir recibo',
    sections: [
      {
        title: 'Recibo limpo em segundos',
        body: 'Preencha recebedor, pagador e valor. Baixe o PDF e envie no WhatsApp ou e-mail.'
      }
    ],
    faqs: [
      {
        q: 'Serve como comprovante?',
        a: 'É um recibo formal entre as partes. Guarde o PDF e combine com sua rotina fiscal/contábil.'
      }
    ],
    related: [
      { href: '/para-mei', label: 'Para MEI', blurb: 'Rotina de cobrança' },
      { href: '/orcamento-com-pix', label: 'Orçamento + Pix', blurb: 'Antes do recibo' }
    ]
  }
};

export function listSeoLandings() {
  return Object.values(SEO_LANDINGS);
}
