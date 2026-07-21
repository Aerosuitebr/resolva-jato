import { Calculator, Clock3, Download, FileCheck2, Lock, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';
import type { SeoPageContent } from './types';

export const contabeisSeoContent: SeoPageContent = {
  slug: 'documentos-contabeis-online',
  toolName: 'Documento Contábil',
  h1: 'Gerador de Documentos Contábeis e de Despacho Gratuito',
  subtitle:
    'Contrato de serviços contábeis, procuração para contador, autorização e-CAC/gov.br, termo de entrega de documentos e mais — prontos em minutos e em PDF.',
  ctaPrimary: 'Criar documento grátis',
  ctaSecondary: 'Ver modelos disponíveis',
  ctaHref: '/cadastro?next=/ferramentas/contabeis',
  quickBadges: [
    { icon: Clock3, label: 'Pronto em minutos' },
    { icon: Download, label: 'Download em PDF' },
    { icon: Lock, label: 'Seus dados protegidos' },
    { icon: Smartphone, label: 'Funciona no celular' }
  ],
  benefits: [
    {
      icon: Calculator,
      title: '6 modelos para rotina contábil',
      description: 'Contrato de serviços, procuração profissional, entrega de documentos, autorização e-CAC, residência e responsabilidade.'
    },
    {
      icon: FileCheck2,
      title: 'Campos certos para contador e despachante',
      description: 'CRC, CNPJ do cliente, regime tributário e escopo do serviço já organizados no lugar certo.'
    },
    {
      icon: ShieldCheck,
      title: 'Padrão para clientes recorrentes',
      description: 'Reaproveite o mesmo modelo para toda a carteira de clientes, trocando apenas os dados de cada um.'
    },
    {
      icon: Sparkles,
      title: 'Atualize quando quiser',
      description: 'Seus documentos ficam salvos na conta — edite valores e vigência sem recomeçar do zero.'
    }
  ],
  steps: [
    {
      title: 'Escolha o tipo de documento',
      description: 'Serviços contábeis, procuração, entrega de documentos, e-CAC, residência ou responsabilidade.'
    },
    {
      title: 'Preencha cliente e escritório',
      description: 'Dados do cliente, CRC do profissional, escopo do serviço e valores mensais.'
    },
    {
      title: 'Baixe em PDF',
      description: 'Revise o documento completo no preview em tempo real e baixe o PDF pronto para assinatura.'
    }
  ],
  examples: [
    {
      title: 'Contrato de serviços contábeis',
      description: 'Formaliza escrituração, apuração de impostos e obrigações acessórias mensais.',
      image: '',
      href: '/cadastro?next=/ferramentas/contabeis'
    },
    {
      title: 'Procuração (contador / despachante)',
      description: 'Outorga poderes ao profissional para representar o cliente em órgãos e portais.',
      image: '',
      href: '/cadastro?next=/ferramentas/contabeis'
    },
    {
      title: 'Autorização e-CAC / gov.br',
      description: 'Autoriza acesso a serviços digitais da Receita Federal em nome do cliente.',
      image: '',
      href: '/cadastro?next=/ferramentas/contabeis'
    }
  ],
  faq: [
    {
      question: 'O gerador de documentos contábeis é gratuito?',
      answer: 'Sim. Você pode criar, editar e baixar seus documentos em PDF gratuitamente pelo Resolva Jato.'
    },
    {
      question: 'Serve para despachantes também?',
      answer: 'Sim, há modelos de procuração profissional e termo de entrega de documentos que se aplicam a despachantes e outras rotinas administrativas.'
    },
    {
      question: 'Posso usar para vários clientes?',
      answer: 'Sim. Salve um modelo padrão e gere uma nova versão rapidamente para cada cliente, ajustando apenas os dados específicos.'
    },
    {
      question: 'A autorização e-CAC substitui o cadastro no portal gov.br?',
      answer: 'Não. O documento formaliza a autorização entre cliente e profissional; o vínculo digital ainda precisa ser feito diretamente nos portais oficiais.'
    },
    {
      question: 'O documento fica salvo para eu editar depois?',
      answer: 'Sim, seus documentos ficam salvos na conta e podem ser reabertos e atualizados quando precisar.'
    }
  ],
  article: {
    title: 'Documentos que organizam a rotina de contadores e despachantes',
    html: `
      <p>Escritórios de contabilidade e despachantes lidam com um volume alto de documentos recorrentes — contratos de serviço, procurações e autorizações que se repetem para cada novo cliente. Ter modelos padronizados reduz retrabalho e evita esquecer alguma cláusula importante.</p>

      <h2>Contrato de serviços contábeis</h2>
      <p>Define claramente o escopo do serviço (escrituração, apuração de impostos, obrigações acessórias como SPED e DCTF), o valor mensal e a forma de pagamento — essencial para evitar divergências sobre o que está incluso no contrato.</p>

      <h2>Procuração profissional</h2>
      <p>Outorga poderes específicos para o contador ou despachante representar o cliente perante órgãos públicos, sem depender da presença do cliente em cada trâmite.</p>

      <h2>Autorização e-CAC / gov.br</h2>
      <p>Formaliza, no papel, a autorização que o cliente concede ao profissional para acessar serviços digitais em seu nome — um passo complementar ao vínculo feito diretamente nos portais oficiais.</p>

      <h2>Termo de entrega de documentos</h2>
      <p>Registra quais documentos foram entregues pelo cliente e em qual data, protegendo o escritório em caso de dúvidas futuras sobre o que foi ou não recebido.</p>

      <p>Com o gerador de documentos contábeis do Resolva Jato, você preenche os dados do cliente uma vez, escolhe o modelo certo e baixa um PDF organizado, pronto para assinatura.</p>
    `
  },
  relatedTools: [
    {
      name: 'Documentos Jurídicos',
      description: 'Procuração, honorários e notificação extrajudicial em PDF.',
      href: '/ferramentas/juridicos'
    },
    {
      name: 'Contratos',
      description: 'Aluguel, prestação de serviços, trabalho, compra e venda ou comodato.',
      href: '/ferramentas/contratos'
    },
    {
      name: 'Recibos',
      description: 'Comprove pagamentos de honorários e serviços contábeis.',
      href: '/ferramentas/recibos'
    },
    {
      name: 'Cobrança Pix',
      description: 'Cobre mensalidades e serviços com QR Code Pix, sem taxa de API.',
      href: '/ferramentas/pix'
    }
  ],
  seo: {
    metaTitle: 'Gerador de Documentos Contábeis Online Gratuito | Resolva Jato',
    metaDescription:
      'Crie contrato de serviços contábeis, procuração para contador, autorização e-CAC/gov.br e mais, grátis, online, em PDF.',
    keywords: [
      'documentos contábeis online',
      'procuração para contador',
      'contrato de serviços contábeis',
      'autorização e-cac',
      'documentos para despachante'
    ],
    breadcrumbLabel: 'Documentos Contábeis'
  }
};
