const onlyDigits = (value: string) => value.replace(/\D+/g, '');

/** Formata telefone BR: (11) 99999-9999 (celular) ou (11) 3333-4444 (fixo). */
export function formatPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Formata CEP BR: 12345-678. */
export function formatCep(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/** Formata CPF: 123.456.789-00. */
export function formatCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/** Formata CNPJ: 12.345.678/0001-90. */
export function formatCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

/** Formata CPF ou CNPJ conforme a quantidade de dígitos. */
export function formatCpfCnpj(value: string): string {
  const digits = onlyDigits(value);
  return digits.length > 11 ? formatCnpj(value) : formatCpf(value);
}

/**
 * Máscara monetária BRL a partir de dígitos digitados.
 * Ex.: "150000" -> "R$ 1.500,00".
 */
export function formatCurrencyInput(value: string): string {
  const digits = onlyDigits(value);
  if (!digits) return '';
  const cents = Number(digits) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(cents);
}

/** Converte texto monetário mascarado em número. Ex.: "R$ 1.500,00" -> 1500. */
export function parseCurrency(value: string): number {
  const digits = onlyDigits(value);
  if (!digits) return 0;
  return Number(digits) / 100;
}

/** Formata número como moeda BRL. */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number.isFinite(value) ? value : 0);
}

const UNITS = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
const TEENS = [
  'dez',
  'onze',
  'doze',
  'treze',
  'quatorze',
  'quinze',
  'dezesseis',
  'dezessete',
  'dezoito',
  'dezenove'
];
const TENS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const HUNDREDS = [
  '',
  'cento',
  'duzentos',
  'trezentos',
  'quatrocentos',
  'quinhentos',
  'seiscentos',
  'setecentos',
  'oitocentos',
  'novecentos'
];

function threeDigitsToWords(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'cem';
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (hundred) parts.push(HUNDREDS[hundred]);
  if (rest) {
    if (rest < 10) parts.push(UNITS[rest]);
    else if (rest < 20) parts.push(TEENS[rest - 10]);
    else {
      const ten = Math.floor(rest / 10);
      const unit = rest % 10;
      parts.push(unit ? `${TENS[ten]} e ${UNITS[unit]}` : TENS[ten]);
    }
  }
  return parts.join(' e ');
}

function integerToWords(value: number): string {
  if (value === 0) return 'zero';
  const groups: number[] = [];
  let remaining = value;
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const scales: [string, string][] = [
    ['', ''],
    ['mil', 'mil'],
    ['milhão', 'milhões'],
    ['bilhão', 'bilhões']
  ];

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i -= 1) {
    const group = groups[i];
    if (group === 0) continue;
    const words = threeDigitsToWords(group);
    if (i === 1) {
      parts.push(group === 1 ? 'mil' : `${words} mil`);
    } else if (i >= 2) {
      const [singular, plural] = scales[i];
      parts.push(`${words} ${group === 1 ? singular : plural}`);
    } else {
      parts.push(words);
    }
  }

  return parts.join(' e ');
}

/** Valor monetário por extenso em português. Ex.: 1500.5 -> "mil e quinhentos reais e cinquenta centavos". */
export function currencyToWords(value: number): string {
  if (!Number.isFinite(value)) return '';
  const rounded = Math.round(value * 100) / 100;
  const reais = Math.floor(rounded);
  const cents = Math.round((rounded - reais) * 100);

  const parts: string[] = [];
  if (reais > 0) {
    parts.push(`${integerToWords(reais)} ${reais === 1 ? 'real' : 'reais'}`);
  }
  if (cents > 0) {
    parts.push(`${integerToWords(cents)} ${cents === 1 ? 'centavo' : 'centavos'}`);
  }
  if (parts.length === 0) return 'zero real';
  const text = parts.join(' e ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}
