import { Clock3, Download, FileCheck2, Lock, Scale, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';
import type { SeoPageContent } from './types';

export const contratosSeoContent: SeoPageContent = {
  slug: 'gerador-de-contrato',
  toolName: 'Contrato',
  h1: 'Gerador de Contrato Online Gratuito',
  subtitle:
    'Monte um contrato profissional de aluguel, serviços, trabalho, compra e venda ou comodato em poucos minutos. Preencha os dados das partes e baixe em PDF pronto para assinar.',
  ctaPrimary: 'Criar meu contrato grátis',
  ctaSecondary: 'Ver modelos de contrato',
  ctaHref: '/cadastro?next=/ferramentas/contratos',
  quickBadges: [
    { icon: Clock3, label: 'Pronto em minutos' },
    { icon: Download, label: 'Download em PDF' },
    { icon: Lock, label: 'Seus dados protegidos' },
    { icon: Smartphone, label: 'Funciona no celular' }
  ],
  benefits: [
    {
      icon: Scale,
      title: '6 tipos de contrato',
      description: 'Prestação de serviços, aluguel residencial, locação comercial, trabalho, compra e venda ou comodato.'
    },
    {
      icon: FileCheck2,
      title: 'Cláusulas prontas e editáveis',
      description: 'Cada modelo já vem com as cláusulas essenciais para o tipo de contrato — você só ajusta o que for específico do seu caso.'
    },
    {
      icon: ShieldCheck,
      title: 'Dados das partes organizados',
      description: 'Campos guiados para nome, documento, endereço e contato de contratante e contratado, sem esquecer nenhuma informação.'
    },
    {
      icon: Sparkles,
      title: 'Atualize quando quiser',
      description: 'Seus contratos ficam salvos na conta — reaproveite um modelo anterior e ajuste valores e datas em segundos.'
    }
  ],
  steps: [
    {
      title: 'Escolha o tipo de contrato',
      description: 'Selecione entre prestação de serviços, aluguel, locação comercial, trabalho, compra e venda ou comodato.'
    },
    {
      title: 'Preencha as partes e condições',
      description: 'Informe dados de contratante e contratado, objeto, valor, forma de pagamento e prazos.'
    },
    {
      title: 'Baixe em PDF',
      description: 'Revise o contrato completo no preview em tempo real e baixe o PDF pronto para assinatura.'
    }
  ],
  examples: [
    {
      title: 'Prestação de serviços',
      description: 'Ideal para freelancers e agências formalizarem um trabalho com cliente.',
      image: '',
      href: '/cadastro?next=/ferramentas/contratos'
    },
    {
      title: 'Aluguel residencial',
      description: 'Contrato completo entre locador e locatário, com cláusulas de prazo e reajuste.',
      image: '',
      href: '/cadastro?next=/ferramentas/contratos'
    },
    {
      title: 'Comodato',
      description: 'Formalize o empréstimo gratuito de um bem, com prazo e condições de devolução.',
      image: '',
      href: '/cadastro?next=/ferramentas/contratos'
    }
  ],
  faq: [
    {
      question: 'O gerador de contrato é gratuito?',
      answer: 'Sim. Você pode criar, editar e baixar seu contrato em PDF gratuitamente pelo Resolva Jato.'
    },
    {
      question: 'O contrato tem validade jurídica?',
      answer:
        'Os modelos seguem a estrutura padrão usada em contratos particulares no Brasil. Para casos complexos ou de alto valor, recomendamos revisão de um advogado antes da assinatura.'
    },
    {
      question: 'Posso assinar o contrato digitalmente?',
      answer: 'Sim, o PDF gerado pode ser assinado com qualquer ferramenta de assinatura eletrônica ou impresso para assinatura física.'
    },
    {
      question: 'Quais tipos de contrato estão disponíveis?',
      answer: 'Prestação de serviços, aluguel residencial, locação comercial, contrato de trabalho, compra e venda e comodato.'
    },
    {
      question: 'Posso editar o contrato depois de gerado?',
      answer: 'Sim, o contrato fica salvo na sua conta e pode ser reaberto e atualizado quando precisar.'
    }
  ],
  article: {
    title: 'Como fazer um contrato sem dor de cabeça',
    html: `
      <p>Formalizar um acordo por escrito é a melhor forma de evitar mal-entendidos entre as partes — seja um aluguel, uma prestação de serviço ou uma venda. Mesmo em relações de confiança, um contrato claro protege os dois lados e serve de referência caso algo precise ser esclarecido depois.</p>

      <h2>O que todo contrato precisa ter</h2>
      <p>Independente do tipo, um contrato particular costuma reunir: qualificação completa das partes (nome, documento, endereço e contato), descrição clara do objeto (o que está sendo contratado, alugado ou vendido), valor e forma de pagamento, prazos e, quando aplicável, testemunhas e local de assinatura.</p>

      <h2>Escolha o modelo certo para a situação</h2>
      <p>Um contrato de prestação de serviços é indicado para freelancers, consultorias e agências. Já um contrato de aluguel residencial ou locação comercial define regras de uso do imóvel, valor e reajuste. O comodato formaliza o empréstimo gratuito de um bem, com prazo e responsabilidade por danos. Escolher o modelo certo evita cláusulas desnecessárias ou faltantes.</p>

      <h2>Seja específico no objeto e no valor</h2>
      <p>Descrições vagas geram discussões. Detalhe exatamente o que está sendo entregue (escopo do serviço, condição do imóvel, especificação do bem) e escreva o valor em número e por extenso, junto da forma e data de pagamento.</p>

      <h2>Revise antes de assinar</h2>
      <p>Confira nomes, documentos e endereços das partes, datas de início e fim, e se todas as cláusulas fazem sentido para o seu caso. Para contratos de maior valor ou complexidade, vale a revisão de um advogado antes da assinatura final.</p>

      <p>Com o gerador de contrato do Resolva Jato, você preenche os dados uma vez, escolhe o modelo certo e baixa um PDF organizado e pronto para assinar — sem precisar montar o documento do zero.</p>
    `
  },
  relatedTools: [
    {
      name: 'Documentos Jurídicos',
      description: 'Procuração, honorários e notificação extrajudicial em PDF.',
      href: '/ferramentas/juridicos'
    },
    {
      name: 'Propostas Comerciais',
      description: 'Envie propostas com visual profissional antes de fechar o contrato.',
      href: '/ferramentas/propostas'
    },
    {
      name: 'Recibos',
      description: 'Comprove pagamentos relacionados ao contrato firmado.',
      href: '/ferramentas/recibos'
    },
    {
      name: 'Orçamentos',
      description: 'Envie o orçamento e receba a aprovação do cliente antes de contratar.',
      href: '/ferramentas/orcamentos'
    }
  ],
  seo: {
    metaTitle: 'Gerador de Contrato Online Gratuito | Resolva Jato',
    metaDescription:
      'Crie contratos de aluguel, prestação de serviços, trabalho, compra e venda ou comodato grátis, online. Preencha os dados e baixe em PDF em minutos.',
    keywords: [
      'gerador de contrato',
      'contrato online',
      'modelo de contrato',
      'contrato de aluguel',
      'contrato de prestação de serviços'
    ],
    breadcrumbLabel: 'Gerador de Contrato'
  }
};
