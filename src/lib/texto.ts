// Texto bíblico empacotado no app. Cada livro é um JSON string[][]
// (capítulos → versículos) gerado por scripts/converter-blivre.mjs.
// O require precisa ser estático para o Metro empacotar os arquivos;
// o JSON só é avaliado quando o livro é aberto pela primeira vez.

type TextoLivro = string[][];

const carregadores: Record<string, () => TextoLivro> = {
  mat: () => require('@/assets/texto/mat.json'),
  mar: () => require('@/assets/texto/mar.json'),
  luk: () => require('@/assets/texto/luk.json'),
  joh: () => require('@/assets/texto/joh.json'),
  act: () => require('@/assets/texto/act.json'),
  rom: () => require('@/assets/texto/rom.json'),
  '1co': () => require('@/assets/texto/1co.json'),
  '2co': () => require('@/assets/texto/2co.json'),
  gal: () => require('@/assets/texto/gal.json'),
  eph: () => require('@/assets/texto/eph.json'),
  phi: () => require('@/assets/texto/phi.json'),
  col: () => require('@/assets/texto/col.json'),
  '1th': () => require('@/assets/texto/1th.json'),
  '2th': () => require('@/assets/texto/2th.json'),
  '1ti': () => require('@/assets/texto/1ti.json'),
  '2ti': () => require('@/assets/texto/2ti.json'),
  tit: () => require('@/assets/texto/tit.json'),
  phm: () => require('@/assets/texto/phm.json'),
  heb: () => require('@/assets/texto/heb.json'),
  jam: () => require('@/assets/texto/jam.json'),
  '1pe': () => require('@/assets/texto/1pe.json'),
  '2pe': () => require('@/assets/texto/2pe.json'),
  '1jo': () => require('@/assets/texto/1jo.json'),
  '2jo': () => require('@/assets/texto/2jo.json'),
  '3jo': () => require('@/assets/texto/3jo.json'),
  jud: () => require('@/assets/texto/jud.json'),
  rev: () => require('@/assets/texto/rev.json'),
};

export function carregarLivro(id: string): TextoLivro {
  const carregar = carregadores[id];
  if (!carregar) throw new Error(`Livro desconhecido: ${id}`);
  return carregar();
}
