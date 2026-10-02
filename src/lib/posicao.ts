// "Continuar lendo": aponta para o próximo capítulo a ler.
import Storage from 'expo-sqlite/kv-store';

import { buscarLivro, LIVROS } from '@/lib/livros';

const CHAVE = 'posicao';

export type Posicao = { livro: string; capitulo: number };

export function salvarPosicao(posicao: Posicao) {
  Storage.setItemSync(CHAVE, JSON.stringify(posicao));
}

export function lerPosicao(): Posicao | null {
  try {
    const bruto = Storage.getItemSync(CHAVE);
    if (!bruto) return null;
    const p = JSON.parse(bruto) as Posicao;
    const livro = buscarLivro(p.livro);
    if (!livro || p.capitulo < 1 || p.capitulo > livro.capitulos) return null;
    return p;
  } catch {
    return null;
  }
}

/** Capítulo seguinte, passando para o próximo livro; null no fim do NT. */
export function capituloSeguinte(livroId: string, capitulo: number): Posicao | null {
  const i = LIVROS.findIndex((l) => l.id === livroId);
  if (capitulo < LIVROS[i].capitulos) return { livro: livroId, capitulo: capitulo + 1 };
  const proximo = LIVROS[i + 1];
  return proximo ? { livro: proximo.id, capitulo: 1 } : null;
}

/**
 * Ajusta o "Continuar lendo" quando o usuário marca/desmarca um capítulo
 * segurando o cartão: desmarcar um capítulo anterior à posição (no mesmo
 * livro) volta a posição para ele; marcar o capítulo da posição avança.
 */
export function ajustarPosicaoAoAlternar(livroId: string, capitulo: number, agoraLido: boolean) {
  const atual = lerPosicao();
  if (!agoraLido) {
    if (!atual || (atual.livro === livroId && atual.capitulo > capitulo)) {
      salvarPosicao({ livro: livroId, capitulo });
    }
  } else if (atual && atual.livro === livroId && atual.capitulo === capitulo) {
    const seguinte = capituloSeguinte(livroId, capitulo);
    if (seguinte) salvarPosicao(seguinte);
  }
}
