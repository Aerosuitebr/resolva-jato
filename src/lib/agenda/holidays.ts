import type { AgendaHoliday } from './types';

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function easterDate(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export function getBrazilHolidays(year: number): AgendaHoliday[] {
  const easter = easterDate(year);
  const fixed: AgendaHoliday[] = [
    { date: `${year}-01-01`, name: 'Confraternizacao Universal', type: 'national' },
    { date: `${year}-04-21`, name: 'Tiradentes', type: 'national' },
    { date: `${year}-05-01`, name: 'Dia do Trabalho', type: 'national' },
    { date: `${year}-09-07`, name: 'Independência do Brasil', type: 'national' },
    { date: `${year}-10-12`, name: 'Nossa Senhora Aparecida', type: 'national' },
    { date: `${year}-11-02`, name: 'Finados', type: 'national' },
    { date: `${year}-11-15`, name: 'Proclamacao da Republica', type: 'national' },
    { date: `${year}-11-20`, name: 'Consciência Negra', type: 'national' },
    { date: `${year}-12-25`, name: 'Natal', type: 'national' }
  ];

  const movable: AgendaHoliday[] = [
    { date: toDateKey(addDays(easter, -48)), name: 'Carnaval', type: 'optional' },
    { date: toDateKey(addDays(easter, -47)), name: 'Carnaval', type: 'optional' },
    { date: toDateKey(addDays(easter, -46)), name: 'Quarta-feira de Cinzas', type: 'optional' },
    { date: toDateKey(addDays(easter, -2)), name: 'Sexta-feira Santa', type: 'national' },
    { date: toDateKey(easter), name: 'Páscoa', type: 'national' },
    { date: toDateKey(addDays(easter, 60)), name: 'Corpus Christi', type: 'optional' }
  ];

  return [...fixed, ...movable].sort((a, b) => a.date.localeCompare(b.date));
}
