export interface CompetenciaScore {
  id: number;
  titulo: string;
  nota: number; // 0-200
  comentario: string;
}

export interface RedacaoAnaliseResult {
  palavras: number;
  paragrafos: number;
  frases: number;
  notaTotalEstimada: number;
  competencias: CompetenciaScore[];
  alertas: string[];
  pontosFortes: string[];
}

const CONECTIVOS = [
  'além disso',
  'portanto',
  'contudo',
  'entretanto',
  'dessa forma',
  'desse modo',
  'por conseguinte',
  'assim',
  'nesse sentido',
  'em suma',
  'ademais',
  'outrossim',
  'todavia',
  'no entanto',
  'por fim',
  'sobretudo',
  'ou seja',
  'isto é',
  'em vista disso',
  'diante disso'
];

const PROPOSTA_MARCADORES = [
  'para tanto',
  'a fim de',
  'cabe ao estado',
  'cabe ao governo',
  'é necessário que',
  'faz-se necessário',
  'deve-se',
  'por meio de',
  'com o intuito de',
  'promover',
  'implementar',
  'fiscalizar',
  'criar políticas',
  'ministério',
  'escolas',
  'mídia',
  'ong'
];

const GIRIAS = ['tipo assim', 'ai que', 'né', 'daí', 'coisa', 'trem', 'meu deus', 'pra caramba', 'muito louco'];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function countOccurrences(haystack: string, needle: string) {
  if (!needle) return 0;
  return haystack.split(needle).length - 1;
}

export function analisarRedacao(texto: string): RedacaoAnaliseResult {
  const trimmed = texto.trim();
  const normalized = normalize(trimmed);
  const palavras = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const paragrafos = trimmed ? trimmed.split(/\n{1,}/).map((p) => p.trim()).filter(Boolean).length : 0;
  const frases = trimmed ? (trimmed.match(/[.!?]+/g) || []).length : 0;

  const alertas: string[] = [];
  const pontosFortes: string[] = [];

  // Competência 1 — norma culta (heurística: repetição excessiva de palavras, gírias, tamanho de frases)
  const girias = GIRIAS.reduce((acc, g) => acc + countOccurrences(normalized, g), 0);
  const frasesMuitoLongas = trimmed
    .split(/[.!?]+/)
    .filter((f) => f.trim().split(/\s+/).filter(Boolean).length > 40).length;

  let nota1 = 160;
  if (girias > 0) {
    nota1 -= girias * 30;
    alertas.push('Evite gírias e linguagem informal — a Competência 1 exige norma culta.');
  }
  if (frasesMuitoLongas > 1) {
    nota1 -= 20;
    alertas.push('Algumas frases estão muito longas — pode indicar problema de pontuação/coesão.');
  }
  nota1 = Math.max(0, Math.min(200, nota1));

  // Competência 2 — compreensão do tema e uso de repertório (proxy: tamanho do texto e diversidade lexical)
  const palavrasUnicas = new Set(normalized.match(/[a-zà-ú]+/g) || []).size;
  const diversidadeLexical = palavras > 0 ? palavrasUnicas / palavras : 0;
  let nota2 = 120;
  if (palavras >= 250) nota2 += 40;
  if (palavras >= 350) nota2 += 20;
  if (diversidadeLexical > 0.55) nota2 += 20;
  if (palavras < 150) {
    alertas.push('Texto curto (menos de 150 palavras) — dificulta desenvolver bem o tema.');
    nota2 -= 40;
  }
  nota2 = Math.max(0, Math.min(200, nota2));
  if (diversidadeLexical > 0.55) pontosFortes.push('Boa variedade de vocabulário.');

  // Competência 3 — argumentação (proxy: presença de dados/repertório e nº de parágrafos)
  let nota3 = 120;
  if (paragrafos >= 4) nota3 += 30;
  else {
    alertas.push('Estrutura ideal do ENEM costuma ter 4 a 5 parágrafos (introdução, 2 desenvolvimentos, conclusão).');
    nota3 -= 20;
  }
  if (/\d{4}/.test(trimmed) || /segundo|de acordo com|dados do/i.test(trimmed)) {
    nota3 += 30;
    pontosFortes.push('Uso de dados/repertório sociocultural identificado.');
  }
  nota3 = Math.max(0, Math.min(200, nota3));

  // Competência 4 — coesão (proxy: conectivos)
  const conectivosEncontrados = CONECTIVOS.filter((c) => normalized.includes(c));
  let nota4 = 100;
  nota4 += Math.min(conectivosEncontrados.length * 15, 90);
  if (conectivosEncontrados.length === 0) {
    alertas.push('Nenhum conectivo de coesão identificado (ex: "portanto", "além disso", "entretanto").');
  } else {
    pontosFortes.push(`${conectivosEncontrados.length} conectivo(s) de coesão identificado(s).`);
  }
  nota4 = Math.max(0, Math.min(200, nota4));

  // Competência 5 — proposta de intervenção (proxy: presença de marcadores de proposta no último parágrafo)
  const ultimoParagrafo = normalize(trimmed.split(/\n{1,}/).filter(Boolean).slice(-1)[0] || '');
  const marcadoresProposta = PROPOSTA_MARCADORES.filter((m) => ultimoParagrafo.includes(m));
  let nota5 = 80;
  if (marcadoresProposta.length >= 2) {
    nota5 = 180;
    pontosFortes.push('Proposta de intervenção com agente e ação identificáveis.');
  } else if (marcadoresProposta.length === 1) {
    nota5 = 130;
    alertas.push('Proposta de intervenção incompleta — detalhe agente, ação, meio e finalidade.');
  } else {
    alertas.push(
      'Não identificamos uma proposta de intervenção clara no último parágrafo (agente + ação + meio + finalidade).'
    );
  }
  nota5 = Math.max(0, Math.min(200, nota5));

  const competencias: CompetenciaScore[] = [
    { id: 1, titulo: 'Domínio da norma culta', nota: nota1, comentario: 'Ortografia, gramática e formalidade.' },
    { id: 2, titulo: 'Compreensão do tema', nota: nota2, comentario: 'Desenvolvimento e repertório sobre o tema proposto.' },
    { id: 3, titulo: 'Argumentação', nota: nota3, comentario: 'Organização das ideias e defesa de ponto de vista.' },
    { id: 4, titulo: 'Coesão textual', nota: nota4, comentario: 'Conectivos e articulação entre parágrafos.' },
    { id: 5, titulo: 'Proposta de intervenção', nota: nota5, comentario: 'Agente, ação, meio, finalidade e detalhamento.' }
  ];

  const notaTotalEstimada = competencias.reduce((acc, c) => acc + c.nota, 0);

  if (paragrafos >= 4 && paragrafos <= 5) pontosFortes.push('Estrutura em parágrafos dentro do esperado pelo ENEM.');

  return {
    palavras,
    paragrafos,
    frases,
    notaTotalEstimada,
    competencias,
    alertas,
    pontosFortes
  };
}
