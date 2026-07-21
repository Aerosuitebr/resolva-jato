const resources = [
  {
    id: 'contrato',
    title: 'Contrato de prestação de serviços',
    category: 'documentos',
    categoryLabel: 'Documentos',
    plan: 'free',
    time: '4 min',
    description: 'Gere contrato com escopo, prazo, pagamento e responsabilidades.',
    tags: ['Documento', 'Autônomos', 'PDF']
  },
  {
    id: 'proposta',
    title: 'Proposta comercial premium',
    category: 'documentos',
    categoryLabel: 'Documentos',
    plan: 'completo',
    time: '5 min',
    description: 'Monte proposta executiva com anexos, assinatura, autosave e versão final.',
    tags: ['Premium', 'Cliente', 'Autosave']
  },
  {
    id: 'curriculo',
    title: 'Currículo padrão ATS',
    category: 'documentos',
    categoryLabel: 'Documentos',
    plan: 'free',
    time: '6 min',
    description: 'Crie currículo limpo para triagens automáticas e candidatura rápida.',
    tags: ['Carreira', 'Modelo', 'Download']
  },
  {
    id: 'mei',
    title: 'MEI e emissão de nota',
    category: 'negocios',
    categoryLabel: 'Negócios',
    plan: 'free',
    time: '3 min',
    description: 'Encontre atalhos para regularização, emissão e obrigações do MEI.',
    tags: ['MEI', 'Governo', 'Negócios']
  },
  {
    id: 'power-bi',
    title: 'Dashboard de uso Power BI',
    category: 'dados',
    categoryLabel: 'Dados',
    plan: 'completo',
    time: '2 min',
    description: 'Acompanhe tarefas, documentos, conversão e produtividade por período.',
    tags: ['BI', 'Métricas', 'Completo']
  },
  {
    id: 'abnt',
    title: 'Gerador ABNT',
    category: 'estudos',
    categoryLabel: 'Estudos',
    plan: 'free',
    time: '2 min',
    description: 'Formate referências acadêmicas e organize trabalhos com clareza.',
    tags: ['ABNT', 'Estudos', 'Referências']
  },
  {
    id: 'servicos-publicos',
    title: 'Consulta de direitos e serviços públicos',
    category: 'governo',
    categoryLabel: 'Governo',
    plan: 'free',
    time: '3 min',
    description: 'Busque serviços públicos, documentos, certidões e canais oficiais.',
    tags: ['Gov.br', 'CPF', 'Certidões']
  },
  {
    id: 'historico',
    title: 'Histórico completo por cliente',
    category: 'negocios',
    categoryLabel: 'Negócios',
    plan: 'completo',
    time: '1 min',
    description: 'Registre contatos, entregas, versões, documentos e próximos passos.',
    tags: ['CRM', 'Histórico', 'Ilimitado']
  }
];

const menuItems = [
  {
    id: 'dashboard',
    label: 'Painel inicial',
    icon: '⌂',
    plan: 'free',
    section: 'Operacao',
    description: 'Resumo executivo, indicadores e proximas acoes.',
    keywords: ['home', 'inicio', 'painel', 'resumo', 'dashboard'],
    shortcut: 'H'
  },
  {
    id: 'busca',
    label: 'Busca Jato',
    icon: '⌕',
    plan: 'free',
    section: 'Operacao',
    description: 'Encontre recursos, modelos e ferramentas por intencao.',
    keywords: ['busca', 'pesquisa', 'catalogo', 'ferramentas', 'recursos'],
    shortcut: '/'
  },
  {
    id: 'documentos',
    label: 'Propostas e documentos',
    icon: '▤',
    plan: 'free',
    section: 'Comercial',
    description: 'Propostas premium, contratos, anexos, logo e PDF.',
    keywords: ['proposta', 'contrato', 'documento', 'pdf', 'logo', 'aerosuite'],
    shortcut: 'D'
  },
  {
    id: 'clientes',
    label: 'Clientes e historico',
    icon: '◇',
    plan: 'completo',
    section: 'Comercial',
    description: 'Linha do tempo por cliente, contatos e versoes.',
    keywords: ['cliente', 'crm', 'historico', 'contato', 'timeline'],
    shortcut: 'C'
  },
  {
    id: 'tarefas',
    label: 'Tarefas e Kanban',
    icon: '☷',
    plan: 'free',
    section: 'Produtividade',
    description: 'Fluxo de trabalho, etapas e acompanhamento visual.',
    keywords: ['tarefas', 'kanban', 'processo', 'fluxo', 'agenda'],
    shortcut: 'K'
  },
  {
    id: 'analytics',
    label: 'Analytics Power BI',
    icon: '◫',
    plan: 'completo',
    section: 'Inteligencia',
    description: 'Conversao, produtividade e leitura comercial.',
    keywords: ['analytics', 'power bi', 'dados', 'metricas', 'relatorio'],
    shortcut: 'A'
  },
  {
    id: 'planos',
    label: 'Planos e limites',
    icon: '◈',
    plan: 'free',
    section: 'Conta',
    description: 'Assinatura, limites, upgrade e recursos liberados.',
    keywords: ['plano', 'limite', 'assinatura', 'upgrade', 'conta'],
    shortcut: 'P'
  }
];

const app = document.querySelector('#app');
const loginDialog = document.querySelector('#login-dialog');
const authForm = document.querySelector('#auth-form');
const authFeedback = document.querySelector('#auth-feedback');

function createDefaultProposals() {
  const today = new Date().toISOString().slice(0, 10);
  return [
    {
      id: 'prop-001',
      number: 'PROP-2026-001',
      status: 'RASCUNHO',
      client: 'Mercado Central',
      document: '12.345.678/0001-90',
      contact: 'Marina Costa',
      email: 'marina@mercadocentral.local',
      phone: '(11) 99999-1010',
      address: 'Av. Paulista, 1000 - Sao Paulo/SP',
      title: 'Proposta comercial premium',
      value: 'R$ 4.500,00',
      proposalDate: today,
      validUntil: '2026-08-14',
      deadline: '10 dias uteis apos aprovacao',
      payment: '50% na aprovacao e 50% na entrega',
      scope: 'Automacao de atendimento, proposta executiva, anexos e versao final em PDF.',
      notes: 'Valores sujeitos a ajuste mediante mudanca de escopo.',
      terms: 'A proposta contempla planejamento, execucao, revisao e entrega final conforme escopo aprovado.',
      logo: '',
      history: [
        { at: 'Hoje, 09:10', action: 'Rascunho criado', detail: 'Proposta iniciada no workspace comercial.' },
        { at: 'Hoje, 09:18', action: 'Preview revisado', detail: 'Cliente, valor e escopo conferidos.' }
      ]
    },
    {
      id: 'prop-002',
      number: 'PROP-2026-002',
      status: 'ENVIADA',
      client: 'Studio Norte',
      document: '987.654.321-00',
      contact: 'Renato Alves',
      email: 'renato@studionorte.local',
      phone: '(21) 98888-2020',
      address: 'Rua das Laranjeiras, 45 - Rio de Janeiro/RJ',
      title: 'Organizacao comercial e documentos',
      value: 'R$ 2.900,00',
      proposalDate: '2026-07-12',
      validUntil: '2026-07-28',
      deadline: '7 dias uteis',
      payment: 'Pix ou boleto em ate 3 parcelas',
      scope: 'Organizacao de fluxo comercial, modelos de documentos e historico por cliente.',
      notes: 'Inclui uma rodada de ajustes.',
      terms: 'Entrega digital, com validacao final por e-mail.',
      logo: '',
      history: [
        { at: '12/07/2026 16:20', action: 'Proposta enviada', detail: 'Envio por e-mail registrado.' }
      ]
    }
  ];
}

let state = {
  authenticated: Boolean(localStorage.getItem('rj-token')),
  user: JSON.parse(localStorage.getItem('rj-user') || 'null') || { name: 'Wellem Lyra', email: 'demo@resolvajato.local', planId: 'free' },
  page: 'dashboard',
  query: '',
  featureQuery: '',
  category: 'todos',
  plan: 'todos',
  autosave: true,
  saveStatus: 'Alterações salvas',
  zoom: 100,
  rotation: 0,
  proposalMode: 'list',
  proposalTab: 'cliente',
  proposalQuery: '',
  proposalStatus: 'todos',
  activeProposalId: 'prop-001',
  proposals: JSON.parse(localStorage.getItem('rj-proposals') || 'null') || createDefaultProposals(),
  document: JSON.parse(localStorage.getItem('rj-document') || 'null') || {
    client: 'Mercado Central',
    value: 'R$ 4.500,00',
    title: 'Proposta comercial premium',
    scope: 'Automação de atendimento, proposta executiva, anexos e versão final em PDF.'
  },
  tasks: [
    { id: 'lead', label: 'Entrada do pedido', status: 'novo' },
    { id: 'dados', label: 'Dados do cliente', status: 'andamento' },
    { id: 'preview', label: 'Prévia do documento', status: 'andamento' },
    { id: 'final', label: 'Entrega final', status: 'pronto' }
  ]
};

let autosaveTimer;

function normalize(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getInitials(name) {
  return String(name || 'Resolva Jato')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'RJ';
}

function isCompletePlan() {
  return state.user.planId === 'completo';
}

function filteredResources() {
  const query = normalize(state.query);
  return resources.filter((resource) => {
    const searchable = normalize(`${resource.title} ${resource.description} ${resource.tags.join(' ')}`);
    const matchesQuery = !query || searchable.includes(query);
    const matchesCategory = state.category === 'todos' || resource.category === state.category;
    const matchesPlan = state.plan === 'todos' || resource.plan === state.plan;
    return matchesQuery && matchesCategory && matchesPlan;
  });
}

function filteredMenuItems() {
  const query = normalize(state.featureQuery);
  return menuItems.filter((item) => {
    const searchable = normalize(`${item.label} ${item.section} ${item.description} ${(item.keywords || []).join(' ')}`);
    return !query || searchable.includes(query);
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function currentProposal() {
  return state.proposals.find((proposal) => proposal.id === state.activeProposalId) || state.proposals[0];
}

function syncDocumentFromProposal() {
  const proposal = currentProposal();
  if (!proposal) return;
  state.document = {
    client: proposal.client || '',
    value: proposal.value || '',
    title: proposal.title || 'Proposta comercial',
    scope: proposal.scope || ''
  };
}

function saveProposals() {
  localStorage.setItem('rj-proposals', JSON.stringify(state.proposals));
  syncDocumentFromProposal();
  localStorage.setItem('rj-document', JSON.stringify(state.document));
}

function nowLabel() {
  return new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function addProposalHistory(proposal, action, detail) {
  proposal.history = [
    { at: nowLabel(), action, detail },
    ...(proposal.history || [])
  ];
}

function filteredProposals() {
  const query = normalize(state.proposalQuery);
  return state.proposals.filter((proposal) => {
    const searchable = normalize(`${proposal.number} ${proposal.client} ${proposal.email} ${proposal.title} ${proposal.value}`);
    const matchesQuery = !query || searchable.includes(query);
    const matchesStatus = state.proposalStatus === 'todos' || proposal.status === state.proposalStatus;
    return matchesQuery && matchesStatus;
  });
}

function statusLabel(status) {
  const labels = {
    RASCUNHO: 'Rascunho',
    ENVIADA: 'Enviada',
    APROVADA: 'Aprovada',
    REJEITADA: 'Rejeitada',
    CANCELADA: 'Cancelada'
  };
  return labels[status] || status;
}

function statusClass(status) {
  return String(status || '').toLowerCase();
}

function createProposal() {
  const nextNumber = String(state.proposals.length + 1).padStart(3, '0');
  const proposal = {
    id: `prop-${Date.now()}`,
    number: `PROP-2026-${nextNumber}`,
    status: 'RASCUNHO',
    client: '',
    document: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    title: 'Nova proposta comercial',
    value: 'R$ 0,00',
    proposalDate: new Date().toISOString().slice(0, 10),
    validUntil: '',
    deadline: '',
    payment: '',
    scope: '',
    notes: '',
    terms: 'Condições gerais, validade e escopo sujeitos à aprovação formal do cliente.',
    logo: '',
    history: [{ at: nowLabel(), action: 'Rascunho criado', detail: 'Nova proposta iniciada.' }]
  };

  state.proposals = [proposal, ...state.proposals];
  state.activeProposalId = proposal.id;
  state.proposalMode = 'editor';
  state.proposalTab = 'cliente';
  state.saveStatus = 'Nova proposta criada';
  saveProposals();
  renderPageOnly();
}

function openProposal(id) {
  state.activeProposalId = id;
  state.proposalMode = 'editor';
  state.proposalTab = 'cliente';
  syncDocumentFromProposal();
  renderPageOnly();
}

function backToProposalList() {
  state.proposalMode = 'list';
  saveProposals();
  renderPageOnly();
}

function duplicateProposal(id) {
  const source = state.proposals.find((proposal) => proposal.id === id);
  if (!source) return;
  const copy = {
    ...source,
    id: `prop-${Date.now()}`,
    number: `${source.number}-C`,
    status: 'RASCUNHO',
    history: [{ at: nowLabel(), action: 'Proposta duplicada', detail: `Criada a partir de ${source.number}.` }]
  };
  state.proposals = [copy, ...state.proposals];
  state.activeProposalId = copy.id;
  state.proposalMode = 'editor';
  state.proposalTab = 'proposta';
  state.saveStatus = 'Proposta duplicada';
  saveProposals();
  renderPageOnly();
}

function deleteProposal(id) {
  if (state.proposals.length <= 1) return;
  state.proposals = state.proposals.filter((proposal) => proposal.id !== id);
  state.activeProposalId = state.proposals[0]?.id;
  state.proposalMode = 'list';
  saveProposals();
  renderPageOnly();
}

function updateProposalField(field, value) {
  const proposal = currentProposal();
  if (!proposal) return;
  proposal[field] = value;
  state.saveStatus = 'Salvando...';
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    addProposalHistory(proposal, 'Alteração salva', `Campo atualizado: ${field}.`);
    state.saveStatus = 'Alterações salvas';
    saveProposals();
    renderPageOnly();
  }, 500);
}

function setProposalStatus(status) {
  const proposal = currentProposal();
  if (!proposal) return;
  proposal.status = status;
  addProposalHistory(proposal, `Status: ${statusLabel(status)}`, 'Ciclo comercial atualizado.');
  state.saveStatus = 'Status atualizado';
  saveProposals();
  renderPageOnly();
}

function registerProposalAction(type) {
  const proposal = currentProposal();
  if (!proposal) return;
  if (type === 'email') {
    proposal.status = 'ENVIADA';
    addProposalHistory(proposal, 'Envio por e-mail', `Enviado para ${proposal.email || 'e-mail do cliente'}.`);
    state.saveStatus = 'Envio por e-mail registrado';
  }
  if (type === 'whatsapp') {
    proposal.status = 'ENVIADA';
    addProposalHistory(proposal, 'Envio por WhatsApp', `Mensagem preparada para ${proposal.phone || 'telefone do cliente'}.`);
    state.saveStatus = 'Envio por WhatsApp registrado';
    if (proposal.phone) {
      const phone = proposal.phone.replace(/\D/g, '');
      const text = encodeURIComponent(`Olá, segue a proposta ${proposal.number}: ${proposal.title}`);
      window.open(`https://wa.me/55${phone}?text=${text}`, '_blank', 'noopener');
    }
  }
  if (type === 'print') {
    addProposalHistory(proposal, 'PDF/Impressão', 'Documento preparado para impressão.');
    window.print();
  }
  saveProposals();
  renderPageOnly();
}

function sidebarSectionsTemplate() {
  const items = filteredMenuItems();
  const sectionOrder = ['Operacao', 'Comercial', 'Produtividade', 'Inteligencia', 'Conta'];

  if (!items.length) {
    return `
      <div class="sidebar-empty">
        <strong>Nada encontrado</strong>
        <span>Tente buscar por proposta, cliente, plano, BI ou tarefas.</span>
      </div>
    `;
  }

  return sectionOrder.map((section) => {
    const sectionItems = items.filter((item) => item.section === section);
    if (!sectionItems.length) return '';

    return `
      <section class="sidebar-section">
        <div class="sidebar-section__head">
          <span>${section}</span>
          <small>${sectionItems.length}</small>
        </div>
        <div class="sidebar-section__items">
          ${sectionItems.map(sidebarNavItem).join('')}
        </div>
      </section>
    `;
  }).join('');
}

function sidebarNavItem(item) {
  const locked = item.plan === 'completo' && !isCompletePlan();
  return `
    <button class="sidebar-link ${state.page === item.id ? 'active' : ''}" type="button" data-page="${item.id}">
      <span class="sidebar-link__icon">${item.icon}</span>
      <span class="sidebar-link__copy">
        <strong>${item.label}</strong>
        <small>${item.description}</small>
      </span>
      <span class="sidebar-link__meta">
        ${locked ? '<b>Pro</b>' : `<kbd>${item.shortcut}</kbd>`}
      </span>
    </button>
  `;
}

function openAuth() {
  loginDialog.showModal();
}

function setAuthenticated(payload = {}) {
  state.authenticated = true;
  state.user = {
    name: payload.name || document.querySelector('#auth-name')?.value || 'Usuário Resolva Jato',
    email: payload.email || document.querySelector('#auth-email')?.value || 'demo@resolvajato.local',
    planId: payload.planId || 'free'
  };
  localStorage.setItem('rj-token', payload.token || 'demo-token');
  localStorage.setItem('rj-user', JSON.stringify(state.user));
  loginDialog.close();
  render();
}

async function authRequest(path) {
  const body = {
    name: document.querySelector('#auth-name').value,
    email: document.querySelector('#auth-email').value,
    password: document.querySelector('#auth-password').value,
    planId: 'free'
  };

  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Não foi possível autenticar.');
    setAuthenticated(payload);
  } catch (error) {
    authFeedback.textContent = `${error.message} Entrando em modo demonstração local.`;
    setTimeout(() => setAuthenticated(body), 500);
  }
}

function logout() {
  localStorage.removeItem('rj-token');
  localStorage.removeItem('rj-user');
  state.authenticated = false;
  state.page = 'dashboard';
  render();
}

function setPage(page) {
  const item = menuItems.find((entry) => entry.id === page);
  if (item?.plan === 'completo' && !isCompletePlan()) {
    state.page = 'planos';
  } else {
    state.page = page;
  }
  render();
}

function upgradePlan() {
  state.user.planId = 'completo';
  localStorage.setItem('rj-user', JSON.stringify(state.user));
  render();
}

function scheduleAutosave() {
  if (!state.autosave) {
    state.saveStatus = 'Autosave pausado';
    renderPageOnly();
    return;
  }

  state.saveStatus = 'Salvando...';
  renderPageOnly();
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    localStorage.setItem('rj-document', JSON.stringify(state.document));
    state.saveStatus = 'Alterações salvas';
    renderPageOnly();
  }, 650);
}

function landingTemplate() {
  const previewResults = resources.slice(0, 4);
  return `
    <div class="landing-shell">
      <header class="landing-header">
        <a class="brand" href="#topo" aria-label="Resolva Jato">
          <span class="brand-mark">RJ</span>
          <span><strong>Resolva Jato</strong><small>Busca, documentos e execução em segundos</small></span>
        </a>
        <nav aria-label="Navegação comercial">
          <a href="#previews">Previews</a>
          <a href="#planos-publicos">Planos</a>
          <a href="#arquitetura">Arquitetura</a>
        </nav>
        <button class="primary-action" type="button" data-open-auth>Experimente já</button>
      </header>

      <main>
        <section class="hero-sales" id="topo">
          <div class="hero-sales__copy">
            <p class="eyebrow">Resolva Jato OS</p>
            <h1>Uma central bonita, rápida e pronta para transformar tarefas soltas em entregas reais.</h1>
            <p>
              Home pública para vender a solução, login para acessar o ambiente e um workspace interno com menu lateral,
              busca reaproveitada, documentos, histórico e controles Free ou Completo.
            </p>
            <div class="hero-actions">
              <button class="primary-action magnetic" type="button" data-open-auth>Experimente já</button>
              <a class="secondary-action" href="#previews">Ver prévias</a>
            </div>
          </div>
          <div class="hero-product-preview" aria-label="Preview do produto Resolva Jato">
            <div class="mini-sidebar">
              <span class="brand-mark">RJ</span>
              <strong>Workspace</strong>
              <small>Free ativo</small>
              ${menuItems.slice(0, 5).map((item, index) => `<span class="${index === 1 ? 'active' : ''}">${item.icon} ${item.label}</span>`).join('')}
            </div>
            <div class="mini-app">
              <div class="mini-app__top"><strong>Busca Jato</strong><span>42 ms</span></div>
              <div class="mini-search">⌕ contrato, MEI, proposta, ABNT...</div>
              <div class="mini-grid">
                ${previewResults.map((item) => `<article><span>${item.categoryLabel}</span><strong>${item.title}</strong><p>${item.description}</p></article>`).join('')}
              </div>
            </div>
          </div>
        </section>

        <section class="preview-section" id="previews">
          <div class="section-heading">
            <p class="eyebrow">Previews que dão vontade de usar</p>
            <h2>O usuário entende o valor antes mesmo de entrar.</h2>
          </div>
          <div class="preview-grid">
            <article><span>01</span><strong>Busca universal</strong><p>Resultados filtrados por plano, categoria, texto e intenção.</p></article>
            <article><span>02</span><strong>Workspace de documentos</strong><p>Editor, anexos, autosave e preview com zoom em uma área só.</p></article>
            <article><span>03</span><strong>Menu lateral premium</strong><p>Funcionalidades organizadas em um shell parecido com sistema operacional.</p></article>
            <article><span>04</span><strong>Plano Completo</strong><p>Oferta simples de R$ 4,99/mês com uso ilimitado e recursos avançados.</p></article>
          </div>
        </section>

        <section class="public-plans" id="planos-publicos">
          <article>
            <span>Free</span>
            <h3>R$ 0</h3>
            <p>Busca, catálogo, tarefas essenciais e limites claros para começar agora.</p>
            <button class="secondary-action" type="button" data-open-auth>Começar grátis</button>
          </article>
          <article class="featured">
            <span>Completo</span>
            <h3>R$ 4,99 <small>/mês</small></h3>
            <p>Uso ilimitado, documentos avançados, histórico, anexos, autosave e analytics.</p>
            <button class="primary-action" type="button" data-open-auth>Ativar Completo</button>
          </article>
        </section>

        <section class="architecture-strip" id="arquitetura">
          <span>React + TypeScript</span>
          <span>Java 21 + Quarkus</span>
          <span>MySQL</span>
          <span>Elasticsearch</span>
          <span>Power BI Embedded</span>
        </section>
      </main>

      <footer class="landing-footer">
        <strong>Resolva Jato</strong>
        <span>Performance, clareza e conversão em uma experiência só.</span>
      </footer>
    </div>
  `;
}

function appTemplate() {
  return `
    <div class="app-container">
      <aside class="sidebar" aria-label="Menu principal">
        <div class="sidebar-brand">
          <span class="brand-mark">RJ</span>
          <div><strong>Resolva Jato</strong><small>Suite operacional</small></div>
        </div>
        <div class="sidebar-profile">
          <span class="user-avatar">${getInitials(state.user.name)}</span>
          <div class="sidebar-profile__copy">
            <strong>${state.user.name}</strong>
            <small>${state.user.email}</small>
          </div>
          <span class="sidebar-profile__status">${isCompletePlan() ? 'Completo' : 'Free'}</span>
        </div>
        <label class="sidebar-search">
          <span>⌕</span>
          <input id="feature-search" type="search" value="${state.featureQuery}" placeholder="Buscar funcionalidade..." autocomplete="off" />
        </label>
        <div class="sidebar-quick-stats" aria-label="Resumo rapido">
          <span><strong>8</strong><small>recursos</small></span>
          <span><strong>${isCompletePlan() ? '∞' : '3'}</strong><small>limite</small></span>
          <span><strong>42ms</strong><small>busca</small></span>
        </div>
        <nav class="sidebar-nav" aria-label="Funcionalidades">
          ${sidebarSectionsTemplate()}
        </nav>
        <div class="sidebar-upgrade">
          <span>${isCompletePlan() ? 'Suite completa ativa' : 'Desbloqueie a suite completa'}</span>
          <strong>${isCompletePlan() ? 'Propostas, historico e BI liberados.' : 'Propostas com logo, historico e analytics.'}</strong>
          <button type="button" data-page="planos">${isCompletePlan() ? 'Ver plano' : 'Ver upgrade'}</button>
        </div>
      </aside>

      <div class="app-main">
        <header class="app-header">
          <button class="mobile-menu-trigger" type="button" data-toggle-menu>☰</button>
          <label class="app-global-search">
            <span>⌕</span>
            <input id="global-query" type="search" value="${state.query}" placeholder="Busca global: contrato, MEI, dashboard..." />
          </label>
          <span class="plan-indicator">${isCompletePlan() ? 'Completo ilimitado' : 'Free com limites'}</span>
          <button class="icon-button" type="button" aria-label="Notificações">●</button>
          <button class="secondary-action" type="button" data-logout>Sair</button>
        </header>
        <main id="app-content" class="main-content">${pageTemplate()}</main>
        <footer class="app-footer">
          <span>Status: operacional</span>
          <span>Atalhos: / busca · D documentos · P planos</span>
          <a href="mailto:suporte@resolvajato.local">Suporte ágil</a>
        </footer>
      </div>
    </div>
  `;
}

function pageTemplate() {
  if (state.page === 'busca') return searchPage();
  if (state.page === 'documentos') return documentPage();
  if (state.page === 'tarefas') return tasksPage();
  if (state.page === 'clientes') return clientsPage();
  if (state.page === 'analytics') return analyticsPage();
  if (state.page === 'planos') return plansPage();
  return dashboardPage();
}

function dashboardPage() {
  return `
    <section class="page-hero">
      <div>
        <p class="eyebrow">Painel inicial</p>
        <h1>Bem-vindo ao seu centro de execução.</h1>
        <p>Escolha uma funcionalidade no menu lateral. Cada página abre neste mesmo container, mantendo header, footer e navegação sempre à mão.</p>
      </div>
      <button class="primary-action" type="button" data-page="busca">Começar pela busca</button>
    </section>
    <section class="metric-grid">
      <article><span>Busca média</span><strong>42 ms</strong><p>Pronta para Elasticsearch.</p></article>
      <article><span>Documentos</span><strong>Autosave</strong><p>Salvamento com debounce.</p></article>
      <article><span>Plano</span><strong>${isCompletePlan() ? 'Completo' : 'Free'}</strong><p>Controles por recurso.</p></article>
      <article><span>BI</span><strong>Power BI</strong><p>Eventos preparados para análise.</p></article>
    </section>
    <section class="internal-grid">
      ${resources.slice(0, 4).map(resourceCard).join('')}
    </section>
  `;
}

function searchPage() {
  const results = filteredResources();
  return `
    <section class="page-hero compact">
      <div>
        <p class="eyebrow">Busca Jato</p>
        <h1>Encontre o recurso certo sem navegar por telas demais.</h1>
        <p>A estrutura de busca do projeto atual foi mantida e reposicionada como funcionalidade interna da aplicação.</p>
      </div>
    </section>
    <section class="tool-panel">
      <div class="filters">
        <label>Busca<input id="resource-search" type="search" value="${state.query}" placeholder="Contrato, MEI, currículo, ABNT..." /></label>
        <label>Categoria
          <select id="category-filter">
            ${option('todos', 'Todas', state.category)}
            ${option('documentos', 'Documentos', state.category)}
            ${option('negocios', 'Negócios', state.category)}
            ${option('estudos', 'Estudos', state.category)}
            ${option('governo', 'Governo', state.category)}
            ${option('dados', 'Dados', state.category)}
          </select>
        </label>
        <label>Plano
          <select id="plan-filter">
            ${option('todos', 'Todos', state.plan)}
            ${option('free', 'Free', state.plan)}
            ${option('completo', 'Completo', state.plan)}
          </select>
        </label>
      </div>
      <div class="result-summary"><strong>${results.length} resultados</strong><span>Busca local agora, Elasticsearch na arquitetura final</span></div>
      <div class="internal-grid">${results.map(resourceCard).join('')}</div>
    </section>
  `;
}

function documentPage() {
  if (state.proposalMode === 'list') return proposalListPage();
  const proposal = currentProposal();
  if (!proposal) return proposalListPage();
  syncDocumentFromProposal();
  return `
    <section class="page-hero compact">
      <div>
        <p class="eyebrow">Propostas comerciais</p>
        <h1>${escapeHtml(proposal.number)} · ${statusLabel(proposal.status)}</h1>
        <p>Cadastro nos moldes do AeroSuite, sem aba de produto: cliente, proposta, envios, histórico e ações comerciais.</p>
      </div>
      <div class="proposal-hero-actions">
        <button class="secondary-action" type="button" data-proposal-back>Voltar</button>
        <button class="secondary-action" type="button" data-proposal-duplicate="${proposal.id}">Duplicar</button>
        <button class="primary-action" type="button" data-proposal-email>Enviar e-mail</button>
      </div>
    </section>

    <section class="proposal-status-strip">
      ${['RASCUNHO', 'ENVIADA', 'APROVADA', 'REJEITADA', 'CANCELADA'].map((status) => `
        <button class="${proposal.status === status ? 'active' : ''}" type="button" data-proposal-status="${status}">
          <span>${statusLabel(status)}</span>
        </button>
      `).join('')}
    </section>

    <section class="document-workspace proposal-workspace">
      <form class="document-editor proposal-editor">
        <div class="editor-head">
          <div><span>Proposta ativa</span><h2>${escapeHtml(proposal.title)}</h2></div>
          <label class="toggle"><input id="autosave-toggle" type="checkbox" ${state.autosave ? 'checked' : ''} /> Autosave</label>
        </div>

        <div class="proposal-tabs" role="tablist">
          ${proposalTabButton('cliente', 'Cliente')}
          ${proposalTabButton('proposta', 'Proposta')}
          ${proposalTabButton('historico', 'Histórico e envios')}
        </div>

        ${proposalTabTemplate(proposal)}
        <p class="save-status">${state.saveStatus}</p>
      </form>
      <aside class="preview-panel">
        <div class="preview-toolbar">
          <strong>Preview</strong>
          <label>Zoom ${state.zoom}%<input id="zoom-range" type="range" min="70" max="145" value="${state.zoom}" /></label>
          <button class="icon-button" type="button" data-rotate aria-label="Rotacionar">↻</button>
        </div>
        <div class="preview-stage">
          <article class="document-preview" style="transform: scale(${state.zoom / 100}) rotate(${state.rotation}deg)">
            ${proposal.logo ? `<img class="proposal-logo-preview" src="${proposal.logo}" alt="Logo da proposta" />` : '<span>Resolva Jato</span>'}
            <h3>${state.document.title}</h3>
            <p>Cliente: <strong>${state.document.client}</strong></p>
            <p>Valor: <strong>${state.document.value}</strong></p>
            <hr />
            <p>${state.document.scope}</p>
            <footer>Gerado com histórico, versões e controle de plano.</footer>
          </article>
        </div>
      </aside>
    </section>
  `;
}

function proposalListPage() {
  const proposals = filteredProposals();
  const totals = {
    draft: state.proposals.filter((item) => item.status === 'RASCUNHO').length,
    sent: state.proposals.filter((item) => item.status === 'ENVIADA').length,
    approved: state.proposals.filter((item) => item.status === 'APROVADA').length
  };

  return `
    <section class="page-hero compact">
      <div>
        <p class="eyebrow">Comercial</p>
        <h1>Propostas comerciais</h1>
        <p>Histórico, busca, duplicação, status, impressão e envio por e-mail ou WhatsApp no mesmo fluxo.</p>
      </div>
      <button class="primary-action" type="button" data-proposal-new>Nova proposta</button>
    </section>

    <section class="proposal-metrics">
      <article><span>Rascunhos</span><strong>${totals.draft}</strong></article>
      <article><span>Enviadas</span><strong>${totals.sent}</strong></article>
      <article><span>Aprovadas</span><strong>${totals.approved}</strong></article>
      <article><span>Total</span><strong>${state.proposals.length}</strong></article>
    </section>

    <section class="proposal-list-panel">
      <div class="filters proposal-filters">
        <label>Busca<input id="proposal-search" type="search" value="${escapeHtml(state.proposalQuery)}" placeholder="Cliente, número, e-mail ou título..." /></label>
        <label>Status
          <select id="proposal-status-filter">
            ${option('todos', 'Todos', state.proposalStatus)}
            ${option('RASCUNHO', 'Rascunho', state.proposalStatus)}
            ${option('ENVIADA', 'Enviada', state.proposalStatus)}
            ${option('APROVADA', 'Aprovada', state.proposalStatus)}
            ${option('REJEITADA', 'Rejeitada', state.proposalStatus)}
            ${option('CANCELADA', 'Cancelada', state.proposalStatus)}
          </select>
        </label>
      </div>

      <div class="proposal-table">
        <div class="proposal-table__head">
          <span>Número</span><span>Cliente</span><span>Valor</span><span>Data</span><span>Status</span><span>Ações</span>
        </div>
        ${proposals.map(proposalRow).join('') || '<div class="proposal-empty">Nenhuma proposta encontrada.</div>'}
      </div>
    </section>
  `;
}

function proposalRow(proposal) {
  return `
    <article class="proposal-row">
      <span class="proposal-number">${escapeHtml(proposal.number)}</span>
      <span class="proposal-client"><strong>${escapeHtml(proposal.client || 'Cliente não informado')}</strong><small>${escapeHtml(proposal.email || proposal.contact || '')}</small></span>
      <span class="proposal-value">${escapeHtml(proposal.value || 'R$ 0,00')}</span>
      <span>${escapeHtml(proposal.proposalDate || '-')}</span>
      <span class="proposal-status ${statusClass(proposal.status)}">${statusLabel(proposal.status)}</span>
      <span class="proposal-actions">
        <button type="button" title="Abrir" data-proposal-open="${proposal.id}">Ver</button>
        <button type="button" title="Duplicar" data-proposal-duplicate="${proposal.id}">Copiar</button>
        <button type="button" title="Excluir" data-proposal-delete="${proposal.id}">Excluir</button>
      </span>
    </article>
  `;
}

function proposalTabButton(tab, label) {
  return `<button class="${state.proposalTab === tab ? 'active' : ''}" type="button" data-proposal-tab="${tab}">${label}</button>`;
}

function proposalTabTemplate(proposal) {
  if (state.proposalTab === 'historico') {
    return `
      <div class="proposal-tab-panel">
        <div class="proposal-action-grid">
          <button class="secondary-action" type="button" data-proposal-email>Enviar por e-mail</button>
          <button class="secondary-action" type="button" data-proposal-whatsapp>Enviar por WhatsApp</button>
          <button class="secondary-action" type="button" data-proposal-print>Imprimir/PDF</button>
          <button class="secondary-action" type="button" data-proposal-duplicate="${proposal.id}">Duplicar proposta</button>
        </div>
        <div class="history-list">
          ${(proposal.history || []).map((item) => `
            <article>
              <span>${escapeHtml(item.at)}</span>
              <strong>${escapeHtml(item.action)}</strong>
              <p>${escapeHtml(item.detail)}</p>
            </article>
          `).join('') || '<p>Nenhum histórico registrado.</p>'}
        </div>
      </div>
    `;
  }

  if (state.proposalTab === 'proposta') {
    return `
      <div class="proposal-tab-panel">
        <div class="proposal-form-grid">
          <label>Título<input data-proposal-field="title" value="${escapeHtml(proposal.title)}" /></label>
          <label>Valor<input data-proposal-field="value" value="${escapeHtml(proposal.value)}" /></label>
          <label>Data<input type="date" data-proposal-field="proposalDate" value="${escapeHtml(proposal.proposalDate)}" /></label>
          <label>Validade<input type="date" data-proposal-field="validUntil" value="${escapeHtml(proposal.validUntil)}" /></label>
          <label>Prazo de entrega<input data-proposal-field="deadline" value="${escapeHtml(proposal.deadline)}" /></label>
          <label>Forma de pagamento<input data-proposal-field="payment" value="${escapeHtml(proposal.payment)}" /></label>
          <label class="full-width">Escopo<textarea data-proposal-field="scope">${escapeHtml(proposal.scope)}</textarea></label>
          <label class="full-width">Observações<textarea data-proposal-field="notes">${escapeHtml(proposal.notes)}</textarea></label>
          <label class="full-width">Condições gerais<textarea data-proposal-field="terms">${escapeHtml(proposal.terms)}</textarea></label>
        </div>
        <label class="drop-zone logo-upload" tabindex="0">
          <input id="proposal-logo-input" type="file" accept="image/*" hidden />
          <strong>${proposal.logo ? 'Trocar logo da proposta' : 'Adicionar logo da proposta'}</strong>
          <span>PNG, JPG ou SVG. A imagem aparece no preview com alta qualidade.</span>
        </label>
      </div>
    `;
  }

  return `
    <div class="proposal-tab-panel">
      <div class="cliente-search-section">
        <h3>Dados do cliente</h3>
        <p>Sem aba Produto: todos os dados abaixo alimentam a proposta e o histórico comercial.</p>
      </div>
      <div class="proposal-form-grid">
        <label>Nome/Razão social<input data-proposal-field="client" value="${escapeHtml(proposal.client)}" /></label>
        <label>CNPJ/CPF<input data-proposal-field="document" value="${escapeHtml(proposal.document)}" /></label>
        <label>Contato<input data-proposal-field="contact" value="${escapeHtml(proposal.contact)}" /></label>
        <label>E-mail<input type="email" data-proposal-field="email" value="${escapeHtml(proposal.email)}" /></label>
        <label>Telefone/WhatsApp<input data-proposal-field="phone" value="${escapeHtml(proposal.phone)}" /></label>
        <label class="full-width">Endereço<input data-proposal-field="address" value="${escapeHtml(proposal.address)}" /></label>
      </div>
    </div>
  `;
}

function tasksPage() {
  return `
    <section class="page-hero compact">
      <div><p class="eyebrow">Tarefas e Kanban</p><h1>Organize o fluxo de execução por etapas.</h1></div>
    </section>
    <section class="kanban-board">
      ${state.tasks.map((task) => `<article draggable="true" class="kanban-card"><span>${task.status}</span><strong>${task.label}</strong><p>Arraste visual previsto para dnd-kit na versão React.</p></article>`).join('')}
    </section>
  `;
}

function clientsPage() {
  return `
    <section class="page-hero compact">
      <div><p class="eyebrow">Clientes e histórico</p><h1>Linha do tempo de cada cliente.</h1><p>Área preparada para MySQL com auditoria estrita, versões e concorrência otimista.</p></div>
    </section>
    <section class="table-panel">
      <table>
        <thead><tr><th>Cliente</th><th>Última tarefa</th><th>Plano</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>Mercado Central</td><td>Proposta premium</td><td>Completo</td><td>Em revisão</td></tr>
          <tr><td>Studio Norte</td><td>Contrato de serviços</td><td>Free</td><td>Concluído</td></tr>
          <tr><td>Consultoria Lima</td><td>Histórico comercial</td><td>Completo</td><td>Ativo</td></tr>
        </tbody>
      </table>
    </section>
  `;
}

function analyticsPage() {
  return `
    <section class="page-hero compact">
      <div><p class="eyebrow">Analytics Power BI</p><h1>Indicadores de uso, conversão e produtividade.</h1><p>Mock visual para o espaço de Power BI Embedded no plano Completo.</p></div>
    </section>
    <section class="analytics-grid">
      <article><span>Conversão</span><strong>18%</strong><div class="bar" style="--value: 72%"></div></article>
      <article><span>Tarefas concluídas</span><strong>142</strong><div class="bar" style="--value: 84%"></div></article>
      <article><span>Docs gerados</span><strong>67</strong><div class="bar" style="--value: 58%"></div></article>
    </section>
  `;
}

function plansPage() {
  return `
    <section class="page-hero compact">
      <div><p class="eyebrow">Planos e limites</p><h1>Free para começar. Completo para usar sem limite.</h1></div>
    </section>
    <section class="public-plans internal">
      <article>
        <span>Free</span>
        <h3>R$ 0</h3>
        <p>Busca, modelos básicos e limites claros.</p>
      </article>
      <article class="featured">
        <span>Completo</span>
        <h3>R$ 4,99 <small>/mês</small></h3>
        <p>Uso ilimitado, documentos, histórico, anexos, analytics e autosave.</p>
        <button class="primary-action" type="button" data-upgrade>${isCompletePlan() ? 'Plano ativo' : 'Ativar demonstração Completo'}</button>
      </article>
    </section>
  `;
}

function option(value, label, selected) {
  return `<option value="${value}" ${value === selected ? 'selected' : ''}>${label}</option>`;
}

function resourceCard(item) {
  const locked = item.plan === 'completo' && !isCompletePlan();
  return `
    <article class="resource-card ${locked ? 'locked' : ''}">
      <div><span>${item.categoryLabel}</span><span>${item.plan === 'completo' ? 'Completo' : 'Free'}</span></div>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <footer>${item.tags.map((tag) => `<small>${tag}</small>`).join('')}</footer>
      ${locked ? '<button class="secondary-action" type="button" data-page="planos">Desbloquear</button>' : ''}
    </article>
  `;
}

function render() {
  app.innerHTML = state.authenticated ? appTemplate() : landingTemplate();
  bindEvents();
}

function renderPageOnly() {
  const content = document.querySelector('#app-content');
  if (content) {
    content.innerHTML = pageTemplate();
    bindEvents();
  }
}

function bindEvents() {
  document.querySelectorAll('[data-open-auth]').forEach((button) => button.addEventListener('click', openAuth));
  document.querySelectorAll('[data-page]').forEach((button) => button.addEventListener('click', () => setPage(button.dataset.page)));
  document.querySelector('[data-logout]')?.addEventListener('click', logout);
  document.querySelector('[data-upgrade]')?.addEventListener('click', upgradePlan);
  document.querySelector('[data-rotate]')?.addEventListener('click', () => {
    state.rotation = (state.rotation + 90) % 360;
    renderPageOnly();
  });
  document.querySelector('[data-toggle-menu]')?.addEventListener('click', () => document.querySelector('.sidebar')?.classList.toggle('mobile-open'));

  document.querySelector('#feature-search')?.addEventListener('input', (event) => {
    state.featureQuery = event.target.value;
    const nav = document.querySelector('.sidebar-nav');
    if (nav) {
      nav.innerHTML = sidebarSectionsTemplate();
      nav.querySelectorAll('[data-page]').forEach((button) => button.addEventListener('click', () => setPage(button.dataset.page)));
    }
  });

  const globalQuery = document.querySelector('#global-query');
  globalQuery?.addEventListener('input', (event) => {
    state.query = event.target.value;
    if (state.page !== 'busca') state.page = 'busca';
    render();
  });

  document.querySelector('#resource-search')?.addEventListener('input', (event) => {
    state.query = event.target.value;
    renderPageOnly();
  });
  document.querySelector('#category-filter')?.addEventListener('change', (event) => {
    state.category = event.target.value;
    renderPageOnly();
  });
  document.querySelector('#plan-filter')?.addEventListener('change', (event) => {
    state.plan = event.target.value;
    renderPageOnly();
  });
  document.querySelector('[data-proposal-new]')?.addEventListener('click', createProposal);
  document.querySelector('[data-proposal-back]')?.addEventListener('click', backToProposalList);
  document.querySelectorAll('[data-proposal-open]').forEach((button) => {
    button.addEventListener('click', () => openProposal(button.dataset.proposalOpen));
  });
  document.querySelectorAll('[data-proposal-duplicate]').forEach((button) => {
    button.addEventListener('click', () => duplicateProposal(button.dataset.proposalDuplicate));
  });
  document.querySelectorAll('[data-proposal-delete]').forEach((button) => {
    button.addEventListener('click', () => deleteProposal(button.dataset.proposalDelete));
  });
  document.querySelectorAll('[data-proposal-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      state.proposalTab = button.dataset.proposalTab;
      renderPageOnly();
    });
  });
  document.querySelectorAll('[data-proposal-status]').forEach((button) => {
    button.addEventListener('click', () => setProposalStatus(button.dataset.proposalStatus));
  });
  document.querySelector('#proposal-search')?.addEventListener('input', (event) => {
    state.proposalQuery = event.target.value;
    renderPageOnly();
  });
  document.querySelector('#proposal-status-filter')?.addEventListener('change', (event) => {
    state.proposalStatus = event.target.value;
    renderPageOnly();
  });
  document.querySelector('[data-proposal-email]')?.addEventListener('click', () => registerProposalAction('email'));
  document.querySelector('[data-proposal-whatsapp]')?.addEventListener('click', () => registerProposalAction('whatsapp'));
  document.querySelector('[data-proposal-print]')?.addEventListener('click', () => registerProposalAction('print'));
  document.querySelectorAll('[data-proposal-field]').forEach((field) => {
    field.addEventListener('input', (event) => {
      if (!state.autosave) {
        const proposal = currentProposal();
        if (proposal) proposal[event.target.dataset.proposalField] = event.target.value;
        syncDocumentFromProposal();
        return;
      }
      updateProposalField(event.target.dataset.proposalField, event.target.value);
    });
  });
  document.querySelector('#proposal-logo-input')?.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    const proposal = currentProposal();
    if (!file || !proposal) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      proposal.logo = String(reader.result || '');
      addProposalHistory(proposal, 'Logo atualizado', file.name);
      state.saveStatus = 'Logo aplicado na proposta';
      saveProposals();
      renderPageOnly();
    });
    reader.readAsDataURL(file);
  });
  document.querySelector('#autosave-toggle')?.addEventListener('change', (event) => {
    state.autosave = event.target.checked;
    scheduleAutosave();
  });
  document.querySelector('#zoom-range')?.addEventListener('input', (event) => {
    state.zoom = Number(event.target.value);
    renderPageOnly();
  });
  document.querySelectorAll('[data-doc]').forEach((field) => {
    field.addEventListener('input', (event) => {
      state.document[event.target.dataset.doc] = event.target.value;
      scheduleAutosave();
    });
  });
}

authForm.addEventListener('submit', (event) => {
  event.preventDefault();
  authRequest('/api/auth/register');
});

document.querySelector('#auth-login').addEventListener('click', () => authRequest('/api/auth/login'));
document.querySelector('#auth-close').addEventListener('click', () => loginDialog.close());

render();
