import { Clock3, Download, FileCheck2, Gavel, Lock, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';
import type { SeoPageContent } from './types';

export const juridicosSeoContent: SeoPageContent = {
  slug: 'documentos-juridicos-online',
  toolName: 'Documento Jurídico',
  h1: 'Gerador de Documentos Jurídicos Online Gratuito',
  subtitle:
    'Procuração, contrato de honorários, substabelecimento, notificação extrajudicial e outras peças do dia a dia do escritório, prontas em minutos e em PDF.',
  ctaPrimary: 'Criar documento grátis',
  ctaSecondary: 'Ver modelos disponíveis',
  ctaHref: '/cadastro?next=/ferramentas/juridicos',
  quickBadges: [
    { icon: Clock3, label: 'Pronto em minutos' },
    { icon: Download, label: 'Download em PDF' },
    { icon: Lock, label: 'Seus dados protegidos' },
    { icon: Smartphone, label: 'Funciona no celular' }
  ],
  benefits: [
    {
      icon: Gavel,
      title: '15 modelos jurídicos',
      description: 'Procuração, honorários, substabelecimento, hipossuficiência, notificação, petição inicial e mais.'
    },
    {
      icon: FileCheck2,
      title: 'Estrutura processual correta',
      description: 'Modelos organizados na ordem esperada por cartórios, tribunais e outras partes envolvidas.'
    },
    {
      icon: ShieldCheck,
      title: 'Campos guiados por tipo de peça',
      description: 'Cada modelo pede exatamente os dados necessários — poderes, número do processo, prazo, entre outros.'
    },
    {
      icon: Sparkles,
      title: 'Reaproveite para novos clientes',
      description: 'Salve seus documentos e gere uma nova versão rapidamente ao trocar apenas os dados do cliente.'
    }
  ],
  steps: [
    {
      title: 'Escolha o tipo de documento',
      description: 'Procuração, honorários, substabelecimento, notificação e outras 11 opções.'
    },
    {
      title: 'Preencha as partes e o objeto',
      description: 'Informe outorgante/outorgado (ou cliente/advogado), poderes, objeto e demais dados da peça.'
    },
    {
      title: 'Baixe em PDF',
      description: 'Revise o documento completo no preview em tempo real e baixe o PDF pronto para assinatura.'
    }
  ],
  examples: [
    {
      title: 'Procuração ad judicia',
      description: 'Outorga poderes ao advogado para atuar em juízo em nome do cliente.',
      image: '',
      href: '/cadastro?next=/ferramentas/juridicos'
    },
    {
      title: 'Contrato de honorários',
      description: 'Formaliza o mandato e a forma de remuneração — fixo, êxito ou misto.',
      image: '',
      href: '/cadastro?next=/ferramentas/juridicos'
    },
    {
      title: 'Notificação extrajudicial',
      description: 'Comunica formalmente a outra parte antes de uma medida judicial.',
      image: '',
      href: '/cadastro?next=/ferramentas/juridicos'
    }
  ],
  faq: [
    {
      question: 'O gerador de documentos jurídicos é gratuito?',
      answer: 'Sim. Você pode criar, editar e baixar seus documentos em PDF gratuitamente pelo Resolva Jato.'
    },
    {
      question: 'Os modelos substituem a revisão de um advogado?',
      answer:
        'Os modelos seguem estrutura e linguagem jurídica padrão, mas recomendamos revisão profissional antes de protocolar ou assinar documentos com efeitos legais relevantes.'
    },
    {
      question: 'Quais documentos posso gerar?',
      answer:
        'Procuração, honorários, substabelecimento, hipossuficiência, notificação extrajudicial, petição inicial simplificada, contestação, recurso inominado, acordo extrajudicial, declaração de residência e modelos acadêmicos como fichamento de jurisprudência e parecer.'
    },
    {
      question: 'Posso usar para trabalhos acadêmicos de Direito?',
      answer: 'Sim, há modelos específicos para fichamento de jurisprudência, estudo de caso, parecer acadêmico e relatório de audiência.'
    },
    {
      question: 'O documento fica salvo para eu editar depois?',
      answer: 'Sim, seus documentos ficam salvos na conta e podem ser reabertos e atualizados quando precisar.'
    }
  ],
  article: {
    title: 'Documentos jurídicos essenciais para o dia a dia do escritório',
    html: `
      <p>Boa parte da rotina de um escritório de advocacia envolve documentos recorrentes: uma procuração para um novo cliente, um contrato de honorários, uma notificação extrajudicial antes de uma ação. Ter esses modelos organizados e prontos para preencher economiza tempo sem abrir mão da formalidade exigida.</p>

      <h2>Procuração: o primeiro documento de qualquer atuação</h2>
      <p>A procuração ad judicia outorga poderes ao advogado para representar o cliente em juízo. É importante especificar corretamente os poderes conferidos (propor ações, contestar, recorrer, transigir, substabelecer) e, quando necessário, prever poderes especiais.</p>

      <h2>Contrato de honorários: formalize a remuneração</h2>
      <p>Definir por escrito o objeto da atuação e a forma de remuneração — fixa, por êxito ou mista — protege tanto o advogado quanto o cliente e evita disputas futuras sobre valores devidos.</p>

      <h2>Notificação extrajudicial: antes de judicializar</h2>
      <p>Muitas questões podem ser resolvidas com uma notificação formal, que comunica a outra parte sobre uma pendência e estabelece um prazo para regularização antes de qualquer medida judicial.</p>

      <h2>Documentos acadêmicos de Direito</h2>
      <p>Estudantes e pesquisadores também usam modelos estruturados para fichamento de jurisprudência, estudo de caso e pareceres acadêmicos — documentos que seguem uma lógica de organização parecida com as peças profissionais, mas voltados para produção acadêmica.</p>

      <p>Com o gerador de documentos jurídicos do Resolva Jato, você escolhe o tipo de peça, preenche os dados guiados e baixa um PDF organizado, pronto para revisão e assinatura.</p>
    `
  },
  relatedTools: [
    {
      name: 'Contratos',
      description: 'Aluguel, prestação de serviços, trabalho, compra e venda ou comodato.',
      href: '/gerador-de-contrato'
    },
    {
      name: 'Docs Contábeis e Despacho',
      description: 'Procuração, e-CAC, residência e cartas para rotina fiscal.',
      href: '/documentos-contabeis-online'
    },
    {
      name: 'Recibos',
      description: 'Comprove pagamentos e honorários com um recibo profissional.',
      href: '/gerador-de-recibo'
    },
    {
      name: 'Propostas Comerciais',
      description: 'Apresente serviços jurídicos com uma proposta visual profissional.',
      href: '/gerador-de-proposta-comercial'
    }
  ],
  seo: {
    metaTitle: 'Gerador de Documentos Jurídicos Online Gratuito | Resolva Jato',
    metaDescription:
      'Crie procuração, contrato de honorários, substabelecimento, notificação extrajudicial e outras peças jurídicas grátis, online, em PDF.',
    keywords: [
      'documentos jurídicos online',
      'gerador de procuração',
      'contrato de honorários advocatícios',
      'substabelecimento modelo',
      'notificação extrajudicial modelo'
    ],
    breadcrumbLabel: 'Documentos Jurídicos'
  }
};
