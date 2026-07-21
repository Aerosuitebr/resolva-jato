import { Clock3, Download, FileText, Lock, Palette, Smartphone, Sparkles, TrendingUp } from 'lucide-react';
import type { SeoPageContent } from './types';

export const propostasSeoContent: SeoPageContent = {
  slug: 'gerador-de-proposta-comercial',
  toolName: 'Proposta Comercial',
  h1: 'Gerador de Proposta Comercial Online Gratuito',
  subtitle:
    'Crie propostas comerciais com identidade visual profissional em minutos. Adicione itens, valores e condições, e envie um PDF que ajuda a fechar mais negócios.',
  ctaPrimary: 'Criar minha proposta grátis',
  ctaSecondary: 'Ver modelos de proposta',
  ctaHref: '/cadastro?next=/ferramentas/propostas',
  quickBadges: [
    { icon: Clock3, label: 'Pronto em minutos' },
    { icon: Download, label: 'Download em PDF' },
    { icon: Lock, label: 'Seus dados protegidos' },
    { icon: Smartphone, label: 'Funciona no celular' }
  ],
  benefits: [
    {
      icon: FileText,
      title: '3 modelos de proposta',
      description: 'Corporativa, executiva ou criativa — escolha o estilo certo para o seu cliente.'
    },
    {
      icon: Palette,
      title: 'Identidade visual do seu negócio',
      description: 'Adicione sua logo e dados da empresa para uma proposta com a sua marca.'
    },
    {
      icon: TrendingUp,
      title: 'Itens e valores organizados',
      description: 'Liste serviços ou produtos com quantidade e valor — o total é calculado automaticamente.'
    },
    {
      icon: Sparkles,
      title: 'Histórico de propostas enviadas',
      description: 'Acompanhe suas propostas salvas e reaproveite um modelo anterior para um novo cliente.'
    }
  ],
  steps: [
    {
      title: 'Preencha sua empresa e o cliente',
      description: 'Dados de contato de quem envia e de quem recebe a proposta.'
    },
    {
      title: 'Adicione os itens da proposta',
      description: 'Serviços ou produtos, quantidade e valor — o total é somado automaticamente.'
    },
    {
      title: 'Baixe em PDF',
      description: 'Escolha o modelo visual, revise no preview em tempo real e baixe pronto para enviar.'
    }
  ],
  examples: [
    {
      title: 'Corporativa',
      description: 'Visual clássico e formal, indicado para propostas B2B e licitações.',
      image: '',
      href: '/cadastro?next=/ferramentas/propostas'
    },
    {
      title: 'Executiva',
      description: 'Foco em consultoria e escopo de trabalho (SOW), com linguagem objetiva.',
      image: '',
      href: '/cadastro?next=/ferramentas/propostas'
    },
    {
      title: 'Criativa',
      description: 'Visual mais colorido, indicado para agências e freelancers criativos.',
      image: '',
      href: '/cadastro?next=/ferramentas/propostas'
    }
  ],
  faq: [
    {
      question: 'O gerador de proposta comercial é gratuito?',
      answer: 'Sim. Você pode criar, editar e baixar propostas em PDF gratuitamente pelo Resolva Jato.'
    },
    {
      question: 'Posso adicionar a logo da minha empresa?',
      answer: 'Sim, você pode enviar sua logo para que a proposta saia com a identidade visual do seu negócio.'
    },
    {
      question: 'O valor total é calculado automaticamente?',
      answer: 'Sim, basta adicionar os itens com quantidade e valor unitário — o total é somado automaticamente.'
    },
    {
      question: 'Qual modelo devo escolher?',
      answer: 'Corporativa para propostas B2B formais, executiva para consultoria e escopos de trabalho, e criativa para agências e freelancers.'
    },
    {
      question: 'Minhas propostas ficam salvas?',
      answer: 'Sim, todas as propostas criadas ficam salvas no histórico da sua conta para consulta ou reenvio.'
    }
  ],
  article: {
    title: 'Como fazer uma proposta comercial que converte',
    html: `
      <p>Uma boa proposta comercial não é apenas uma lista de preços — é um documento que apresenta a solução, organiza expectativas e facilita a decisão do cliente. Propostas bem estruturadas aumentam a taxa de fechamento de negócios.</p>

      <h2>Comece pelo problema do cliente</h2>
      <p>Antes de listar itens e valores, contextualize brevemente o que o cliente precisa resolver. Isso mostra que a proposta foi pensada especificamente para ele, e não é um modelo genérico reaproveitado.</p>

      <h2>Detalhe os itens com clareza</h2>
      <p>Cada item da proposta deve ter nome, descrição objetiva, quantidade e valor. Evite agrupar tudo em uma única linha vaga — detalhar o que está incluso reduz dúvidas e retrabalho na negociação.</p>

      <h2>Escolha o tom certo para o cliente</h2>
      <p>Uma proposta para uma grande empresa costuma pedir um tom mais formal e corporativo. Já para consultorias e escopos de trabalho específicos, um formato mais executivo e direto tende a funcionar melhor. Agências e freelancers criativos podem se beneficiar de um visual com mais identidade.</p>

      <h2>Facilite a aprovação</h2>
      <p>Deixe claras as condições de pagamento, prazo de validade da proposta e prazo de entrega. Isso evita que a negociação trave por falta de informação.</p>

      <p>Com o gerador de proposta comercial do Resolva Jato, você preenche os dados da empresa e do cliente, adiciona os itens com valores calculados automaticamente e baixa um PDF com identidade visual profissional, pronto para enviar.</p>
    `
  },
  relatedTools: [
    {
      name: 'Orçamentos',
      description: 'Envie um orçamento simples com link para aprovação do cliente.',
      href: '/cadastro?next=/ferramentas/orcamentos'
    },
    {
      name: 'Contratos',
      description: 'Formalize o negócio depois que a proposta for aprovada.',
      href: '/gerador-de-contrato'
    },
    {
      name: 'Recibos',
      description: 'Comprove os pagamentos recebidos após o fechamento.',
      href: '/gerador-de-recibo'
    },
    {
      name: 'Cobrança Pix',
      description: 'Gere um QR Code Pix para receber o pagamento combinado na proposta.',
      href: '/cadastro?next=/ferramentas/pix'
    }
  ],
  seo: {
    metaTitle: 'Gerador de Proposta Comercial Online Gratuito | Resolva Jato',
    metaDescription:
      'Crie propostas comerciais grátis, online, com sua logo, itens e valores organizados. Baixe em PDF profissional em minutos.',
    keywords: [
      'gerador de proposta comercial',
      'modelo de proposta comercial',
      'proposta comercial online',
      'proposta de serviço',
      'fazer proposta comercial'
    ],
    breadcrumbLabel: 'Gerador de Proposta Comercial'
  }
};
