// Converte o VPL da Bíblia Livre (TR) em um JSON por livro do NT.
// Uso: node scripts/converter-blivre.mjs
// Entrada: fonte/bliv-tr_vpl.txt (release 2018.2.0 do github.com/blivre/BibliaLivre)
// Saída:   assets/texto/<id>.json  →  string[][] (capítulos → versículos)
// Também confere o resultado contra src/lib/livros.ts e aborta se divergir.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const { LIVROS } = await import('../src/lib/livros.ts');

const linhas = readFileSync(join(raiz, 'fonte/bliv-tr_vpl.txt'), 'utf8')
  .replace(/^﻿/, '')
  .split(/\r?\n/)
  .filter(Boolean);

const ids = new Set(LIVROS.map((l) => l.id));
const livros = new Map();
for (const linha of linhas) {
  const m = /^(\w{3}) (\d+):(\d+) (.*)$/.exec(linha);
  if (!m) throw new Error(`Linha fora do formato: ${linha.slice(0, 60)}`);
  const id = m[1].toLowerCase();
  if (!ids.has(id)) continue; // Antigo Testamento
  const cap = Number(m[2]);
  const vers = Number(m[3]);
  const texto = m[4].trim();
  if (!livros.has(id)) livros.set(id, []);
  const caps = livros.get(id);
  caps[cap - 1] ??= [];
  if (caps[cap - 1].length !== vers - 1) throw new Error(`Versículo fora de ordem: ${linha.slice(0, 20)}`);
  caps[cap - 1].push(texto);
}

const erros = [];
let total = 0;
mkdirSync(join(raiz, 'assets/texto'), { recursive: true });
for (const livro of LIVROS) {
  const caps = livros.get(livro.id);
  if (!caps) { erros.push(`${livro.id}: ausente`); continue; }
  if (caps.length !== livro.capitulos) erros.push(`${livro.id}: ${caps.length} capítulos, esperado ${livro.capitulos}`);
  if (caps.some((c) => !c?.length)) erros.push(`${livro.id}: capítulo vazio`);
  total += caps.flat().length;
  writeFileSync(join(raiz, 'assets/texto', `${livro.id}.json`), JSON.stringify(caps));
}
if (total !== 7957) erros.push(`total de versículos ${total}, esperado 7957`);
if (erros.length) {
  console.error(erros.join('\n'));
  process.exit(1);
}
console.log(`OK: ${LIVROS.length} livros, ${total} versículos.`);
