// Capítulos marcados como lidos, por livro: { mat: [1, 2], ... }.
// Marcados pelo botão "próximo" no fim do capítulo, ou segurando o
// cartão do capítulo na grade (alterna).
import Storage from 'expo-sqlite/kv-store';

import { convidarLembreteUmaVez, reagendarLembretes } from '@/lib/lembrete';
import { registrarLeituraHoje } from '@/lib/ofensiva';

const CHAVE = 'lidos';

type Lidos = Record<string, number[]>;

function ler(): Lidos {
  try {
    return JSON.parse(Storage.getItemSync(CHAVE) ?? '{}') as Lidos;
  } catch {
    return {};
  }
}

function gravar(lidos: Lidos) {
  Storage.setItemSync(CHAVE, JSON.stringify(lidos));
}

/** Marcar um capítulo conta para a ofensiva e cancela o lembrete de hoje. */
function contarLeitura() {
  registrarLeituraHoje();
  void reagendarLembretes();
  convidarLembreteUmaVez();
}

export function capitulosLidos(livro: string): number[] {
  return ler()[livro] ?? [];
}

export function todosLidos(): Lidos {
  return ler();
}

export function marcarLido(livro: string, capitulo: number) {
  const lidos = ler();
  const atual = lidos[livro] ?? [];
  if (atual.includes(capitulo)) return;
  lidos[livro] = [...atual, capitulo];
  gravar(lidos);
  contarLeitura();
}

/** Alterna e devolve se o capítulo ficou lido. */
export function alternarLido(livro: string, capitulo: number): boolean {
  const lidos = ler();
  const atual = lidos[livro] ?? [];
  lidos[livro] = atual.includes(capitulo)
    ? atual.filter((c) => c !== capitulo)
    : [...atual, capitulo];
  gravar(lidos);
  const agoraLido = lidos[livro].includes(capitulo);
  if (agoraLido) contarLeitura();
  return agoraLido;
}
