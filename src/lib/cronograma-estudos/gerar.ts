export interface Materia {
  nome: string;
  peso: number; // 1-5, importância/dificuldade relativa
}

export interface CronogramaInput {
  materias: Materia[];
  diasSemana: number[]; // 0=domingo ... 6=sábado, dias disponíveis
  horasPorDia: number;
  semanas: number;
  incluirRevisao: boolean;
}

export interface SessaoEstudo {
  materia: string;
  minutos: number;
}

export interface DiaCronograma {
  semana: number;
  diaSemana: number;
  sessoes: SessaoEstudo[];
}

const NOME_DIA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function gerarCronograma(input: CronogramaInput): DiaCronograma[] {
  const { materias, diasSemana, horasPorDia, semanas, incluirRevisao } = input;
  if (materias.length === 0 || diasSemana.length === 0) return [];

  const pesoTotal = materias.reduce((acc, m) => acc + m.peso, 0);
  const minutosPorDia = horasPorDia * 60;
  const dias: DiaCronograma[] = [];

  const diasOrdenados = [...diasSemana].sort((a, b) => a - b);

  let cursor = 0;
  const cicloMaterias = [...materias].sort((a, b) => b.peso - a.peso);

  for (let semana = 1; semana <= semanas; semana += 1) {
    diasOrdenados.forEach((diaSemana, idx) => {
      const isDiaRevisao = incluirRevisao && idx === diasOrdenados.length - 1;

      let sessoes: SessaoEstudo[];
      if (isDiaRevisao) {
        const minutosPorMateria = Math.max(15, Math.round(minutosPorDia / materias.length));
        sessoes = materias.map((m) => ({ materia: `Revisão: ${m.nome}`, minutos: minutosPorMateria }));
      } else {
        // Aloca 2 matérias por dia priorizando peso, alternando o "cursor" pra distribuir bem.
        const materiasHoje: Materia[] = [];
        const quantidade = Math.min(2, cicloMaterias.length);
        for (let i = 0; i < quantidade; i += 1) {
          materiasHoje.push(cicloMaterias[(cursor + i) % cicloMaterias.length]);
        }
        cursor = (cursor + quantidade) % cicloMaterias.length;

        const pesoDoDia = materiasHoje.reduce((acc, m) => acc + m.peso, 0) || 1;
        sessoes = materiasHoje.map((m) => ({
          materia: m.nome,
          minutos: Math.max(20, Math.round((m.peso / pesoDoDia) * minutosPorDia))
        }));
      }

      dias.push({ semana, diaSemana, sessoes });
    });
  }

  return dias;
}

export function nomeDia(diaSemana: number) {
  return NOME_DIA[diaSemana] ?? '';
}

export function formatarMinutos(minutos: number) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}min`;
}
