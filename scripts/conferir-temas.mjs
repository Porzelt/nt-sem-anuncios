// Confere as referências de src/lib/temas.ts contra o texto e gera
// docs/revisao-temas.md (temas com o texto completo, para revisão humana).
// Uso: node scripts/conferir-temas.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const { TEMAS } = await import('../src/lib/temas.ts');
const { buscarLivro } = await import('../src/lib/livros.ts');

const texto = (id) => JSON.parse(readFileSync(join(raiz, 'assets/texto', `${id}.json`), 'utf8'));
const erros = [];
const linhas = [
  '# Revisão: versículos por tema',
  '',
  'Gerado por `node scripts/conferir-temas.mjs` a partir de `src/lib/temas.ts`.',
  'Texto da Bíblia Livre (BLIVRE). Revise se cada versículo combina com o tema.',
  '',
];

let total = 0;
for (const tema of TEMAS) {
  linhas.push(`## ${tema.nome} → ${tema.oferece}`, '');
  for (const { livro, cap, de, ate = de } of tema.passagens) {
    const l = buscarLivro(livro);
    const caps = l && texto(livro);
    const vs = caps?.[cap - 1]?.slice(de - 1, ate);
    const ref = `${l?.nome ?? livro} ${cap}:${de}${ate !== de ? `-${ate}` : ''}`;
    if (!vs || vs.length !== ate - de + 1 || ate < de) {
      erros.push(`${tema.id}: referência inválida ${ref}`);
      continue;
    }
    total++;
    const corpo = vs.map((v, i) => (vs.length > 1 ? `${de + i} ` : '') + v.replace(/\[([^\]]*)\]/g, '$1')).join(' ');
    linhas.push(`- **${ref}** — ${corpo}`);
  }
  linhas.push('');
}

if (erros.length) {
  console.error(erros.join('\n'));
  process.exit(1);
}
writeFileSync(join(raiz, 'docs/revisao-temas.md'), linhas.join('\n'));
console.log(`OK: ${TEMAS.length} temas, ${total} passagens válidas. Revisão em docs/revisao-temas.md`);
