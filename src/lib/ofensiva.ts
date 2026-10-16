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

/** Poucos marcos, bem espaçados, para cada um ter peso. */
export const MARCOS: Marco[] = [
  { dias: 7, nome: '1 semana', cor: '#E8822E', celebracao: 'Uma semana de leitura! 🙌' },
  { dias: 30, nome: '1 mês', cor: '#D9480F', celebracao: 'Um mês lendo a Palavra! Que constância bonita.' },
  { dias: 100, nome: '100 dias', cor: '#7B4FD6', celebracao: '100 dias de leitura! Que caminhada.' },
  { dias: 365, nome: '1 ano', cor: '#C9A227', celebracao: 'Um ano inteiro de leitura! 🎉' },
];

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
  // Só os últimos ~400 dias importam para a sequência.
  Storage.setItemSync(CHAVE_DIAS, JSON.stringify([...dias, hoje].slice(-400)));
}

export function lerOfensiva(): Ofensiva & { recorde: number } {
  const o = calcularOfensiva(lerDias(), dataLocal());
  const salvo = Number(Storage.getItemSync(CHAVE_RECORDE) ?? 0) || 0;
  const recorde = Math.max(salvo, o.atual);
  if (recorde !== salvo) Storage.setItemSync(CHAVE_RECORDE, String(recorde));
  return { ...o, recorde };
}
