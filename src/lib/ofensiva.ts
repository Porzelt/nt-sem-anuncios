// Ofensiva: dias seguidos com pelo menos um capítulo marcado como lido.
// Um dia perdido é perdoado (folga) se não houve outra folga nos 6 dias
// anteriores; hoje ainda sem leitura não quebra a sequência.
import Storage from 'expo-sqlite/kv-store';

const CHAVE_DIAS = 'diasLeitura';
const CHAVE_RECORDE = 'recordeOfensiva';

/** Data local no formato AAAA-MM-DD. */
export function dataLocal(d = new Date()): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function diaAnterior(dia: string): string {
  const [a, m, d] = dia.split('-').map(Number);
  return dataLocal(new Date(a, m - 1, d - 1));
}

export type Ofensiva = {
  /** Dias seguidos (folgas não contam como dia, mas não quebram). */
  atual: number;
  leuHoje: boolean;
  /** Algum dia já foi lido (para a mensagem de "volta"). */
  jaLeu: boolean;
};

/** Lógica pura (testável no Node). */
export function calcularOfensiva(dias: Iterable<string>, hoje: string): Ofensiva {
  const lidos = new Set(dias);
  const leuHoje = lidos.has(hoje);
  let d = leuHoje ? hoje : diaAnterior(hoje);
  let atual = 0;
  let diasDesdeFolga = Infinity;
  for (;;) {
    if (lidos.has(d)) {
      atual++;
      diasDesdeFolga++;
    } else if (diasDesdeFolga >= 6 && lidos.has(diaAnterior(d))) {
      diasDesdeFolga = 0;
    } else {
      break;
    }
    d = diaAnterior(d);
  }
  return { atual, leuHoje, jaLeu: lidos.size > 0 };
}

export type Marco = { dias: number; nome: string; cor: string; celebracao: string };

/**
 * Marcos da ofensiva, do começo do hábito até anos de leitura. Mais próximos no
 * início (para incentivar quem está começando) e mais espaçados depois.
 */
export const MARCOS: Marco[] = [
  { dias: 3, nome: '3 dias', cor: '#E0A21B', celebracao: 'Três dias seguidos! Um ótimo começo.' },
  { dias: 7, nome: '1 semana', cor: '#E8822E', celebracao: 'Uma semana de leitura! 🙌' },
  { dias: 14, nome: '2 semanas', cor: '#E2662A', celebracao: 'Duas semanas seguidas! O hábito está se formando.' },
  { dias: 21, nome: '3 semanas', cor: '#DB5524', celebracao: 'Três semanas lendo! Já virou parte do seu dia.' },
  { dias: 30, nome: '1 mês', cor: '#D9480F', celebracao: 'Um mês lendo a Palavra! Que constância bonita.' },
  { dias: 50, nome: '50 dias', cor: '#C2255C', celebracao: '50 dias de leitura! Continue firme.' },
  { dias: 100, nome: '100 dias', cor: '#7B4FD6', celebracao: '100 dias de leitura! Que caminhada.' },
  { dias: 200, nome: '200 dias', cor: '#4C6EF5', celebracao: '200 dias seguidos! Uma caminhada admirável.' },
  { dias: 365, nome: '1 ano', cor: '#C9A227', celebracao: 'Um ano inteiro de leitura! 🎉' },
  { dias: 500, nome: '500 dias', cor: '#0CA678', celebracao: '500 dias de leitura! Que perseverança.' },
  { dias: 730, nome: '2 anos', cor: '#B8860B', celebracao: 'Dois anos lendo todos os dias! 🎉' },
  { dias: 1000, nome: '1000 dias', cor: '#9C36B5', celebracao: 'Mil dias de leitura! Glória a Deus por essa constância.' },
];

/** Próximo marco ainda não alcançado com essa quantidade de dias. */
export function proximoMarco(dias: number): Marco | undefined {
  return MARCOS.find((m) => m.dias > dias);
}

/** Maior marco alcançado com essa quantidade de dias. */
export function marcoDe(dias: number): Marco | undefined {
  return MARCOS.filter((m) => dias >= m.dias).at(-1);
}

const CHAVE_CELEBRADO = 'marcoCelebrado';

/** Marco recém-alcançado ainda não celebrado (marca como celebrado). */
export function marcoParaCelebrar(dias: number): Marco | undefined {
  const marco = marcoDe(dias);
  const celebrado = Number(Storage.getItemSync(CHAVE_CELEBRADO) ?? 0) || 0;
  if (!marco || marco.dias <= celebrado) return undefined;
  Storage.setItemSync(CHAVE_CELEBRADO, String(marco.dias));
  return marco;
}

/**
 * Calendário das últimas `semanas` semanas (domingo a sábado), terminando na
 * semana de hoje. Cada dia indica se houve leitura e se é futuro. Lógica pura.
 */
export function calendarioRecente(
  dias: Iterable<string>,
  hoje: string,
  semanas: number,
): { dia: string; leu: boolean; futuro: boolean; hoje: boolean }[][] {
  const lidos = new Set(dias);
  const [a, m, d] = hoje.split('-').map(Number);
  const dataHoje = new Date(a, m - 1, d);
  const inicio = new Date(a, m - 1, d - dataHoje.getDay() - (semanas - 1) * 7);
  const linhas = [];
  for (let s = 0; s < semanas; s++) {
    const semana = [];
    for (let i = 0; i < 7; i++) {
      const data = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + s * 7 + i);
      const dia = dataLocal(data);
      semana.push({ dia, leu: lidos.has(dia), futuro: data > dataHoje, hoje: dia === hoje });
    }
    linhas.push(semana);
  }
  return linhas;
}

/** Dias (AAAA-MM-DD) em que houve leitura. */
export function diasDeLeitura(): string[] {
  return lerDias();
}

function lerDias(): string[] {
  try {
    return JSON.parse(Storage.getItemSync(CHAVE_DIAS) ?? '[]') as string[];
  } catch {
    return [];
  }
}

export function registrarLeituraHoje() {
  const hoje = dataLocal();
  const dias = lerDias();
  if (dias.includes(hoje)) return;
  // Guarda ~3 anos: o bastante para o marco de 1000 dias (cerca de 13 KB).
  Storage.setItemSync(CHAVE_DIAS, JSON.stringify([...dias, hoje].slice(-1200)));
}

export function lerOfensiva(): Ofensiva & { recorde: number } {
  const o = calcularOfensiva(lerDias(), dataLocal());
  const salvo = Number(Storage.getItemSync(CHAVE_RECORDE) ?? 0) || 0;
  const recorde = Math.max(salvo, o.atual);
  if (recorde !== salvo) Storage.setItemSync(CHAVE_RECORDE, String(recorde));
  return { ...o, recorde };
}
