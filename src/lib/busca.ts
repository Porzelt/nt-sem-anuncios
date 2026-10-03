// Busca de texto em todo o NT. Lógica pura (sem imports de app) para
// testar no Node: recebe os textos já carregados e devolve os resultados.
//
// A comparação ignora acentos e maiúsculas. A normalização é feita
// caractere a caractere e preserva o comprimento, então as posições
// encontradas no texto normalizado valem também no texto original (para
// destacar o trecho).

export type Versiculo = {
  livro: string;
  capitulo: number;
  versiculo: number;
  /** Texto exibido (sem os colchetes de acréscimo). */
  texto: string;
  /** Mesmo texto, sem acentos e em minúsculas, com o mesmo comprimento. */
  normalizado: string;
};

export type Resultado = Versiculo & {
  /** Trechos [início, fim) a destacar em `texto`. */
  trechos: [number, number][];
};

export function normalizar(s: string): string {
  let saida = '';
  for (const c of s) {
    const base = c.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    saida += base.length === c.length ? base : c.toLowerCase();
  }
  return saida;
}

export function semColchetes(s: string): string {
  return s.replace(/\[([^\]]*)\]/g, '$1');
}

/** Monta o índice a partir de [{ id, capitulos: string[][] }] na ordem canônica. */
export function montarIndice(livros: { id: string; capitulos: string[][] }[]): Versiculo[] {
  const indice: Versiculo[] = [];
  for (const { id, capitulos } of livros) {
    capitulos.forEach((versiculos, c) => {
      versiculos.forEach((bruto, v) => {
        const texto = semColchetes(bruto);
        indice.push({ livro: id, capitulo: c + 1, versiculo: v + 1, texto, normalizado: normalizar(texto) });
      });
    });
  }
  return indice;
}

export const MINIMO_CARACTERES = 2;

/**
 * Todas as palavras da consulta precisam aparecer no versículo (em
 * qualquer ordem). Versículos com a frase exata vêm primeiro; depois,
 * a ordem canônica.
 */
export function buscar(indice: Versiculo[], consulta: string, limite = 300) {
  const frase = normalizar(consulta).replace(/\s+/g, ' ').trim();
  if (frase.length < MINIMO_CARACTERES) return { total: 0, resultados: [] as Resultado[] };
  const palavras = [...new Set(frase.split(' '))];

  const exatos: Resultado[] = [];
  const outros: Resultado[] = [];
  for (const v of indice) {
    if (!palavras.every((p) => v.normalizado.includes(p))) continue;
    const temFrase = palavras.length > 1 && v.normalizado.includes(frase);
    const termos = temFrase ? [frase] : palavras;
    const r = { ...v, trechos: localizar(v.normalizado, termos) };
    (temFrase ? exatos : outros).push(r);
  }
  const todos = [...exatos, ...outros];
  return { total: todos.length, resultados: todos.slice(0, limite) };
}

function localizar(texto: string, termos: string[]): [number, number][] {
  const trechos: [number, number][] = [];
  for (const termo of termos) {
    let i = texto.indexOf(termo);
    while (i !== -1) {
      trechos.push([i, i + termo.length]);
      i = texto.indexOf(termo, i + termo.length);
    }
  }
  trechos.sort((a, b) => a[0] - b[0]);
  // Junta trechos sobrepostos.
  const unidos: [number, number][] = [];
  for (const t of trechos) {
    const ultimo = unidos[unidos.length - 1];
    if (ultimo && t[0] <= ultimo[1]) ultimo[1] = Math.max(ultimo[1], t[1]);
    else unidos.push([...t]);
  }
  return unidos;
}
