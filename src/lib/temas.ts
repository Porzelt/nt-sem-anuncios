// Versículos sugeridos por tema ("Para momentos de…"). Curadoria manual,
// revisada pelo Henrique (veja docs/revisao-temas.md, gerado por
// scripts/conferir-temas.mjs, que também valida cada referência).
// Sem imports de app: lido pelo script no Node.

/** Uma passagem: livro (id de LIVROS), capítulo e versículo inicial/final. */
export type Passagem = { livro: string; cap: number; de: number; ate?: number };

export type Tema = {
  id: string;
  /** Como a pessoa se sente ou o que procura. */
  nome: string;
  /** O que os versículos oferecem. */
  oferece: string;
  passagens: Passagem[];
};

const p = (livro: string, cap: number, de: number, ate?: number): Passagem => ({ livro, cap, de, ate });

export const TEMAS: Tema[] = [
  {
    id: 'tristeza',
    nome: 'Tristeza',
    oferece: 'Esperança e consolo',
    passagens: [
      p('mat', 5, 4),
      p('joh', 16, 22),
      p('joh', 16, 33),
      p('rom', 15, 13),
      p('2co', 1, 3, 4),
      p('2co', 4, 16, 18),
      p('rom', 8, 18),
      p('1pe', 5, 10),
      p('rev', 21, 4),
    ],
  },
  {
    id: 'ansiedade',
    nome: 'Ansiedade',
    oferece: 'Paz',
    passagens: [
      p('phi', 4, 6, 7),
      p('1pe', 5, 7),
      p('joh', 14, 27),
      p('mat', 6, 25, 27),
      p('mat', 6, 33, 34),
      p('mat', 11, 28, 30),
      p('col', 3, 15),
      p('2th', 3, 16),
    ],
  },
  {
    id: 'medo',
    nome: 'Medo',
    oferece: 'Coragem e confiança',
    passagens: [
      p('2ti', 1, 7),
      p('joh', 14, 1),
      p('mat', 10, 29, 31),
      p('heb', 13, 6),
      p('luk', 12, 32),
      p('rom', 8, 31),
      p('mar', 6, 50),
      p('1jo', 4, 18),
    ],
  },
  {
    id: 'solidao',
    nome: 'Solidão',
    oferece: 'A presença de Deus',
    passagens: [
      p('mat', 28, 20),
      p('heb', 13, 5),
      p('joh', 14, 18),
      p('rom', 8, 38, 39),
      p('jam', 4, 8),
      p('rev', 3, 20),
      p('joh', 15, 15),
      p('mat', 18, 20),
    ],
  },
  {
    id: 'culpa',
    nome: 'Culpa',
    oferece: 'Perdão e recomeço',
    passagens: [
      p('1jo', 1, 9),
      p('rom', 8, 1),
      p('eph', 1, 7),
      p('luk', 15, 20),
      p('col', 1, 13, 14),
      p('2co', 5, 17),
      p('heb', 8, 12),
      p('act', 3, 19),
    ],
  },
  {
    id: 'luto',
    nome: 'Luto',
    oferece: 'Consolo e vida eterna',
    passagens: [
      p('joh', 11, 25, 26),
      p('1th', 4, 13, 14),
      p('joh', 14, 1, 3),
      p('1co', 15, 54, 55),
      p('phi', 1, 21),
      p('2co', 5, 1),
      p('mat', 5, 4),
      p('rev', 21, 4),
    ],
  },
  {
    id: 'cansaco',
    nome: 'Cansaço',
    oferece: 'Força para continuar',
    passagens: [
      p('mat', 11, 28),
      p('phi', 4, 13),
      p('2co', 12, 9),
      p('gal', 6, 9),
      p('heb', 12, 1, 2),
      p('eph', 6, 10),
      p('2co', 4, 8, 9),
      p('1co', 15, 58),
    ],
  },
  {
    id: 'duvida',
    nome: 'Dúvida',
    oferece: 'Fé',
    passagens: [
      p('heb', 11, 1),
      p('mar', 9, 24),
      p('rom', 10, 17),
      p('heb', 11, 6),
      p('joh', 20, 29),
      p('mar', 11, 22, 24),
      p('mat', 17, 20),
      p('jam', 1, 5, 6),
    ],
  },
  {
    id: 'decisoes',
    nome: 'Decisões',
    oferece: 'Sabedoria',
    passagens: [
      p('jam', 1, 5),
      p('jam', 3, 17),
      p('rom', 12, 2),
      p('phi', 4, 8),
      p('mat', 7, 7, 8),
      p('eph', 5, 15, 17),
      p('col', 3, 16),
    ],
  },
  {
    id: 'gratidao',
    nome: 'Gratidão',
    oferece: 'Louvor e alegria',
    passagens: [
      p('1th', 5, 16, 18),
      p('col', 3, 17),
      p('eph', 5, 20),
      p('phi', 4, 4),
      p('jam', 1, 17),
      p('heb', 13, 15),
      p('col', 2, 6, 7),
      p('2co', 9, 15),
    ],
  },
  {
    id: 'amor',
    nome: 'Amar o próximo',
    oferece: 'O que é o amor',
    passagens: [
      p('1co', 13, 4, 7),
      p('joh', 13, 34, 35),
      p('1jo', 4, 7, 8),
      p('joh', 3, 16),
      p('rom', 12, 10),
      p('joh', 15, 13),
      p('1jo', 4, 19),
      p('rom', 13, 10),
      p('col', 3, 14),
    ],
  },
];

export function buscarTema(id: string): Tema | undefined {
  return TEMAS.find((t) => t.id === id);
}
