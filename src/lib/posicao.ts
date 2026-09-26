// "Continuar de onde parei": guarda o último capítulo aberto.
import Storage from 'expo-sqlite/kv-store';

import { buscarLivro } from '@/lib/livros';

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
