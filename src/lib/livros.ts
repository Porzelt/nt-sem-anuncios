// Metadados dos 27 livros do Novo Testamento, na ordem canônica.
// `id` é o código do livro no arquivo VPL da Bíblia Livre, em minúsculas,
// e também o nome do JSON em assets/texto/. Sem imports de app: este
// arquivo é lido pelo script de conferência no Node.

export type Livro = {
  id: string;
  nome: string;
  abreviacao: string;
  capitulos: number;
  grupo: Grupo;
};

export type Grupo = 'evangelhos' | 'historico' | 'paulo' | 'gerais' | 'profecia';

export const GRUPOS: { id: Grupo; nome: string }[] = [
  { id: 'evangelhos', nome: 'Evangelhos' },
  { id: 'historico', nome: 'Histórico' },
  { id: 'paulo', nome: 'Cartas de Paulo' },
  { id: 'gerais', nome: 'Cartas gerais' },
  { id: 'profecia', nome: 'Profecia' },
];

export const LIVROS: Livro[] = [
  { id: 'mat', nome: 'Mateus', abreviacao: 'Mt', capitulos: 28, grupo: 'evangelhos' },
  { id: 'mar', nome: 'Marcos', abreviacao: 'Mc', capitulos: 16, grupo: 'evangelhos' },
  { id: 'luk', nome: 'Lucas', abreviacao: 'Lc', capitulos: 24, grupo: 'evangelhos' },
  { id: 'joh', nome: 'João', abreviacao: 'Jo', capitulos: 21, grupo: 'evangelhos' },
  { id: 'act', nome: 'Atos', abreviacao: 'At', capitulos: 28, grupo: 'historico' },
  { id: 'rom', nome: 'Romanos', abreviacao: 'Rm', capitulos: 16, grupo: 'paulo' },
  { id: '1co', nome: '1 Coríntios', abreviacao: '1Co', capitulos: 16, grupo: 'paulo' },
  { id: '2co', nome: '2 Coríntios', abreviacao: '2Co', capitulos: 13, grupo: 'paulo' },
  { id: 'gal', nome: 'Gálatas', abreviacao: 'Gl', capitulos: 6, grupo: 'paulo' },
  { id: 'eph', nome: 'Efésios', abreviacao: 'Ef', capitulos: 6, grupo: 'paulo' },
  { id: 'phi', nome: 'Filipenses', abreviacao: 'Fp', capitulos: 4, grupo: 'paulo' },
  { id: 'col', nome: 'Colossenses', abreviacao: 'Cl', capitulos: 4, grupo: 'paulo' },
  { id: '1th', nome: '1 Tessalonicenses', abreviacao: '1Ts', capitulos: 5, grupo: 'paulo' },
  { id: '2th', nome: '2 Tessalonicenses', abreviacao: '2Ts', capitulos: 3, grupo: 'paulo' },
  { id: '1ti', nome: '1 Timóteo', abreviacao: '1Tm', capitulos: 6, grupo: 'paulo' },
  { id: '2ti', nome: '2 Timóteo', abreviacao: '2Tm', capitulos: 4, grupo: 'paulo' },
  { id: 'tit', nome: 'Tito', abreviacao: 'Tt', capitulos: 3, grupo: 'paulo' },
  { id: 'phm', nome: 'Filemom', abreviacao: 'Fm', capitulos: 1, grupo: 'paulo' },
  { id: 'heb', nome: 'Hebreus', abreviacao: 'Hb', capitulos: 13, grupo: 'gerais' },
  { id: 'jam', nome: 'Tiago', abreviacao: 'Tg', capitulos: 5, grupo: 'gerais' },
  { id: '1pe', nome: '1 Pedro', abreviacao: '1Pe', capitulos: 5, grupo: 'gerais' },
  { id: '2pe', nome: '2 Pedro', abreviacao: '2Pe', capitulos: 3, grupo: 'gerais' },
  { id: '1jo', nome: '1 João', abreviacao: '1Jo', capitulos: 5, grupo: 'gerais' },
  { id: '2jo', nome: '2 João', abreviacao: '2Jo', capitulos: 1, grupo: 'gerais' },
  { id: '3jo', nome: '3 João', abreviacao: '3Jo', capitulos: 1, grupo: 'gerais' },
  { id: 'jud', nome: 'Judas', abreviacao: 'Jd', capitulos: 1, grupo: 'gerais' },
  { id: 'rev', nome: 'Apocalipse', abreviacao: 'Ap', capitulos: 22, grupo: 'profecia' },
];

export const TOTAL_CAPITULOS = LIVROS.reduce((soma, l) => soma + l.capitulos, 0);

export function buscarLivro(id: string): Livro | undefined {
  return LIVROS.find((livro) => livro.id === id);
}

/** Palavras entre colchetes no texto são acréscimos do tradutor (itálico). */
export type Trecho = { texto: string; acrescimo: boolean };

export function separarAcrescimos(versiculo: string): Trecho[] {
  const trechos: Trecho[] = [];
  const regex = /\[([^\]]*)\]/g;
  let inicio = 0;
  for (const m of versiculo.matchAll(regex)) {
    if (m.index > inicio) trechos.push({ texto: versiculo.slice(inicio, m.index), acrescimo: false });
    trechos.push({ texto: m[1], acrescimo: true });
    inicio = m.index + m[0].length;
  }
  if (inicio < versiculo.length) trechos.push({ texto: versiculo.slice(inicio), acrescimo: false });
  return trechos;
}
