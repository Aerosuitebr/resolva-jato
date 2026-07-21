import { Clock3, Download, FileCheck2, Lock, Palette, Receipt, Smartphone, Sparkles } from 'lucide-react';
import type { SeoPageContent } from './types';

export const recibosSeoContent: SeoPageContent = {
  slug: 'gerador-de-recibo',
  toolName: 'Recibo',
  h1: 'Gerador de Recibo Online Gratuito',
  subtitle:
    'Crie um recibo de pagamento profissional em minutos. Preencha valor, quem pagou e quem recebeu, escolha um modelo e baixe em PDF pronto para enviar.',
  ctaPrimary: 'Criar meu recibo grátis',
  ctaSecondary: 'Ver modelos de recibo',
  ctaHref: '/cadastro?next=/ferramentas/recibos',
  quickBadges: [
    { icon: Clock3, label: 'Pronto em 2 minutos' },
    { icon: Download, label: 'Download em PDF' },
    { icon: Lock, label: 'Seus dados protegidos' },
    { icon: Smartphone, label: 'Funciona no celular' }
  ],
  benefits: [
    {
      icon: Receipt,
      title: 'Valor por extenso automático',
      description: 'Digite o valor em número e o recibo já escreve por extenso, sem erro de digitação.'
    },
    {
      icon: Palette,
      title: '3 modelos visuais',
      description: 'Profissional, moderno ou compacto — escolha o estilo que combina com o seu negócio.'
    },
    {
      icon: FileCheck2,
      title: 'Assinatura digital incluída',
      description: 'Adicione uma assinatura digital ao recibo sem precisar imprimir e escanear.'
    },
    {
      icon: Sparkles,
      title: 'Histórico de recibos emitidos',
      description: 'Seus recibos ficam salvos na conta — consulte ou reemita quando precisar.'
    }
  ],
  steps: [
    {
      title: 'Preencha valor e referência',
      description: 'Informe o valor, forma de pagamento e a que se refere o pagamento.'
    },
    {
      title: 'Adicione quem paga e quem recebe',
      description: 'Nome, documento, contato e endereço de pagador e recebedor.'
    },
    {
      title: 'Baixe em PDF',
      description: 'Escolha o modelo, revise no preview em tempo real e baixe o recibo pronto.'
    }
  ],
  examples: [
    {
      title: 'Modelo Profissional',
      description: 'Layout completo e formal, indicado para prestadores de serviço e autônomos.',
      image: '',
      href: '/cadastro?next=/ferramentas/recibos'
    },
    {
      title: 'Modelo Moderno',
      description: 'Visual mais leve e colorido, para negócios com identidade mais informal.',
      image: '',
      href: '/cadastro?next=/ferramentas/recibos'
    },
    {
      title: 'Modelo Compacto',
      description: 'Direto ao ponto, ideal para recibos rápidos do dia a dia.',
      image: '',
      href: '/cadastro?next=/ferramentas/recibos'
    }
  ],
  faq: [
    {
      question: 'O gerador de recibo é gratuito?',
      answer: 'Sim. Você pode criar, editar e baixar seu recibo em PDF gratuitamente pelo Resolva Jato.'
    },
    {
      question: 'O recibo tem validade como comprovante de pagamento?',
      answer: 'Sim, um recibo com dados completos de pagador, recebedor, valor e assinatura serve como comprovante de pagamento.'
    },
    {
      question: 'O valor por extenso é gerado automaticamente?',
      answer: 'Sim, basta digitar o valor numérico e o recibo converte automaticamente para a forma escrita por extenso.'
    },
    {
      question: 'Posso assinar o recibo digitalmente?',
      answer: 'Sim, é possível adicionar uma assinatura digital diretamente na ferramenta, sem precisar imprimir.'
    },
    {
      question: 'Consigo ver os recibos que já emiti?',
      answer: 'Sim, todos os recibos emitidos ficam salvos no histórico da sua conta.'
    }
  ],
  article: {
    title: 'Como emitir um recibo de pagamento correto',
    html: `
      <p>Emitir um recibo é a forma mais simples de comprovar que um pagamento foi realizado — seja para um serviço prestado, aluguel, venda ou qualquer outra transação. Um recibo bem feito protege tanto quem paga quanto quem recebe.</p>

      <h2>O que não pode faltar no recibo</h2>
      <p>Um recibo completo deve conter: nome e documento de quem paga e de quem recebe, valor em número e por extenso, data e local do pagamento, forma de pagamento (Pix, dinheiro, transferência, cartão) e a que se refere o valor recebido.</p>

      <h2>Por que o valor por extenso importa</h2>
      <p>Escrever o valor por extenso além do número é uma prática tradicional que reduz a chance de erro ou fraude no documento, já que qualquer alteração no número precisaria também alterar o texto por extenso, tornando a tentativa mais evidente.</p>

      <h2>Assinatura: física ou digital</h2>
      <p>O recibo pode ser assinado à mão após a impressão ou receber uma assinatura digital diretamente no documento — ambas as formas são aceitas na maioria das situações do dia a dia.</p>

      <h2>Guarde uma cópia</h2>
      <p>Tanto quem emite quanto quem recebe o recibo devem guardar uma cópia. Isso facilita eventuais consultas futuras, seja para controle financeiro pessoal, comprovação para terceiros ou questões fiscais.</p>

      <p>Com o gerador de recibo do Resolva Jato, você preenche os dados, escolhe o modelo visual e baixa um PDF organizado — com valor por extenso automático e opção de assinatura digital.</p>
    `
  },
  relatedTools: [
    {
      name: 'Contratos',
      description: 'Formalize o serviço ou negociação antes de emitir o recibo.',
      href: '/ferramentas/contratos'
    },
    {
      name: 'Cobrança Pix',
      description: 'Gere o QR Code Pix para receber e depois emita o recibo do pagamento.',
      href: '/ferramentas/pix'
    },
    {
      name: 'Orçamentos',
      description: 'Envie o orçamento e receba a aprovação do cliente antes da cobrança.',
      href: '/ferramentas/orcamentos'
    },
    {
      name: 'Propostas Comerciais',
      description: 'Feche negócios com uma proposta visual profissional.',
      href: '/ferramentas/propostas'
    }
  ],
  seo: {
    metaTitle: 'Gerador de Recibo Online Gratuito | Resolva Jato',
    metaDescription:
      'Crie recibos de pagamento grátis, online, com valor por extenso automático e assinatura digital. Baixe em PDF em minutos.',
    keywords: [
      'gerador de recibo',
      'recibo online',
      'modelo de recibo',
      'recibo de pagamento',
      'fazer recibo online'
    ],
    breadcrumbLabel: 'Gerador de Recibo'
  }
};
