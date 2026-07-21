import {
  Clock3,
  FileCheck2,
  LayoutTemplate,
  Lock,
  Palette,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Download
} from 'lucide-react';
import type { SeoPageContent } from './types';

export const curriculoSeoContent: SeoPageContent = {
  slug: 'gerador-de-curriculo',
  toolName: 'Currículo',
  h1: 'Gerador de Currículo Online Gratuito',
  subtitle:
    'Crie um currículo profissional em poucos minutos, direto do navegador. Escolha um modelo, preencha seus dados e baixe em PDF pronto para enviar às vagas.',
  ctaPrimary: 'Criar meu currículo grátis',
  ctaSecondary: 'Ver modelos prontos',
  ctaHref: '/cadastro?next=/ferramentas/curriculo',
  quickBadges: [
    { icon: Clock3, label: 'Pronto em 5 minutos' },
    { icon: Download, label: 'Download em PDF' },
    { icon: Lock, label: 'Seus dados protegidos' },
    { icon: Smartphone, label: 'Funciona no celular' }
  ],
  benefits: [
    {
      icon: LayoutTemplate,
      title: 'Modelos profissionais',
      description: 'Layouts pensados para passar pelo recrutador e por sistemas de triagem automática (ATS).'
    },
    {
      icon: Palette,
      title: 'Personalização fácil',
      description: 'Troque cores, fontes e seções sem precisar entender de design ou usar outro programa.'
    },
    {
      icon: FileCheck2,
      title: 'Sem erros de formatação',
      description: 'O layout se ajusta automaticamente conforme você escreve — nada de quebrar página ou desalinhar.'
    },
    {
      icon: Sparkles,
      title: 'Atualize quando quiser',
      description: 'Guarde seu currículo na conta e edite antes de cada vaga nova, sem começar do zero.'
    },
    {
      icon: ScanSearch,
      title: 'Otimizado para palavras-chave',
      description: 'Estrutura de texto limpa (sem tabelas ou imagens escondendo conteúdo) para o ATS reconhecer seu cargo, formação e habilidades corretamente.'
    },
    {
      icon: ShieldCheck,
      title: 'Compatibilidade real com ATS',
      description: 'Hierarquia de títulos e seções segue o padrão esperado pelos principais sistemas de triagem usados por empresas no Brasil.'
    }
  ],
  steps: [
    {
      title: 'Escolha um modelo',
      description: 'Selecione entre os layouts Profissional, Moderno ou Universitário conforme a vaga.'
    },
    {
      title: 'Preencha seus dados',
      description: 'Adicione experiências, formação, cursos, idiomas e habilidades nos campos guiados.'
    },
    {
      title: 'Baixe em PDF',
      description: 'Revise o preview em tempo real e baixe o arquivo pronto para enviar por e-mail ou plataformas de vagas.'
    }
  ],
  examples: [
    {
      title: 'Modelo Profissional',
      description: 'Layout clássico e elegante, ideal para vagas corporativas e cargos de gestão.',
      image: '',
      href: '/cadastro?next=/ferramentas/curriculo'
    },
    {
      title: 'Modelo Moderno',
      description: 'Visual contemporâneo com destaque lateral em azul, indicado para marketing, tech e criativos.',
      image: '',
      href: '/cadastro?next=/ferramentas/curriculo'
    },
    {
      title: 'Modelo Universitário',
      description: 'Perfeito para estágios, primeiro emprego e programas acadêmicos.',
      image: '',
      href: '/cadastro?next=/ferramentas/curriculo'
    }
  ],
  faq: [
    {
      question: 'O gerador de currículo é realmente gratuito?',
      answer:
        'Sim. Você pode criar, editar e baixar seu currículo em PDF gratuitamente. Recursos extras, como múltiplos currículos salvos e modelos premium, fazem parte do plano pago.'
    },
    {
      question: 'Preciso instalar algum programa?',
      answer:
        'Não. O gerador funciona direto no navegador, no computador ou no celular, sem precisar instalar nada.'
    },
    {
      question: 'O currículo é compatível com sistemas de triagem (ATS)?',
      answer:
        'Sim. Os modelos foram construídos com estrutura de texto limpa e hierarquia clara, o que facilita a leitura por sistemas automáticos usados por empresas e recrutadores.'
    },
    {
      question: 'Posso editar meu currículo depois de criar?',
      answer:
        'Sim. Seu currículo fica salvo na sua conta, então você pode voltar e atualizar informações antes de aplicar para uma nova vaga.'
    },
    {
      question: 'Em quais formatos posso baixar?',
      answer: 'O download é feito em PDF, formato aceito pela grande maioria das empresas e plataformas de vagas.'
    }
  ],
  article: {
    title: 'Como fazer um currículo que se destaca em 2026',
    html: `
      <p>Um currículo bem feito ainda é a porta de entrada para a maioria das vagas de emprego no Brasil. Com a concorrência alta e recrutadores analisando dezenas de candidaturas por dia, ter um documento claro, objetivo e bem estruturado faz diferença real na hora de passar para a próxima etapa do processo seletivo.</p>

      <h2>Por que a estrutura do currículo importa tanto</h2>
      <p>Antes de qualquer avaliação humana, boa parte das empresas usa sistemas de triagem automática (os chamados ATS — Applicant Tracking Systems) para filtrar currículos por palavras-chave, cargos e formação. Um currículo com estrutura confusa, tabelas complexas ou textos dentro de imagens pode simplesmente não ser lido corretamente por essas ferramentas, mesmo que o candidato tenha um perfil excelente.</p>
      <p>Por isso, a recomendação é sempre usar um modelo com hierarquia clara: nome e contato no topo, seguido de resumo profissional, experiências em ordem cronológica reversa (mais recente primeiro), formação, cursos e habilidades. Essa é exatamente a lógica seguida pelos modelos do gerador de currículo do Resolva Jato.</p>

      <h2>O que não pode faltar</h2>
      <p>Um bom currículo brasileiro em 2026 costuma conter: nome completo e forma de contato (e-mail e telefone), um resumo curto de 2 a 3 linhas destacando sua principal força profissional, experiências com cargo, empresa, período e 2 a 4 linhas de resultados (não apenas tarefas), formação acadêmica, cursos relevantes para a vaga e, quando fizer sentido, idiomas e habilidades técnicas.</p>
      <p>Evite excesso de informação pessoal (não é necessário incluir foto, estado civil ou data de nascimento na maioria dos processos seletivos no Brasil) e mantenha o documento entre uma e duas páginas.</p>

      <h2>Escreva resultados, não apenas tarefas</h2>
      <p>Uma das mudanças mais eficazes que você pode fazer é trocar descrições genéricas de tarefas por resultados mensuráveis. Em vez de escrever "responsável por campanhas de marketing", prefira algo como "planejou campanhas que aumentaram em 38% as conversões do e-commerce em 6 meses". Números e resultados concretos chamam muito mais atenção do recrutador do que listas de responsabilidades.</p>

      <h2>Adapte o currículo para cada vaga</h2>
      <p>Enviar o mesmo currículo genérico para todas as vagas reduz suas chances. Leia a descrição da vaga e ajuste o resumo profissional e as palavras-chave das experiências para refletir o que a empresa está buscando — isso ajuda tanto na leitura humana quanto na filtragem automática por sistemas ATS.</p>

      <h2>Escolha o modelo certo</h2>
      <p>Para vagas corporativas e cargos de gestão, um modelo mais formal, com tipografia sóbria, tende a comunicar seriedade. Para áreas criativas, marketing e tecnologia, um modelo com um toque de cor e um layout um pouco mais moderno pode ajudar a se destacar sem perder a legibilidade. Já para quem está buscando o primeiro emprego, estágio ou vem de um contexto acadêmico, um modelo que dá mais espaço para formação, projetos e cursos é geralmente mais indicado.</p>

      <h2>Revise antes de enviar</h2>
      <p>Erros de português, datas inconsistentes e informações de contato desatualizadas são motivos comuns de descarte de currículos. Depois de finalizar, releia com calma (ou peça para alguém revisar) e confira se todos os links, e-mail e telefone estão corretos e atualizados.</p>

      <p>Com o gerador de currículo do Resolva Jato, você preenche seus dados uma única vez, visualiza o resultado em tempo real e pode ajustar o modelo e o conteúdo até chegar num documento que realmente representa sua trajetória — e baixa em PDF pronto para enviar.</p>
    `
  },
  relatedTools: [
    {
      name: 'Lattes Inteligente',
      description: 'Gere seu currículo Lattes formatado para uso acadêmico e programas de pós.',
      href: '/ferramentas/curriculo-lattes'
    },
    {
      name: 'Capas de Trabalho',
      description: 'Monte capas no padrão ABNT para trabalhos acadêmicos e TCCs.',
      href: '/ferramentas/trabalhos'
    },
    {
      name: 'Contratos',
      description: 'Formalize trabalhos freelance ou PJ com um contrato profissional em minutos.',
      href: '/ferramentas/contratos'
    },
    {
      name: 'Propostas Comerciais',
      description: 'Envie propostas com visual profissional para conquistar novos clientes.',
      href: '/ferramentas/propostas'
    }
  ],
  seo: {
    metaTitle: 'Gerador de Currículo Online Gratuito | Resolva Jato',
    metaDescription:
      'Crie seu currículo profissional grátis, online, sem instalar nada. Escolha um modelo, preencha seus dados e baixe em PDF em minutos.',
    keywords: [
      'gerador de currículo',
      'currículo online',
      'criar currículo grátis',
      'modelo de currículo',
      'fazer currículo online'
    ],
    breadcrumbLabel: 'Gerador de Currículo'
  }
};
