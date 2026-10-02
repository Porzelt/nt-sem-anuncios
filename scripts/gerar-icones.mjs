// Gera os PNGs de ícone/splash a partir de assets/icone/origem.webp
// (arte do ícone: livro aberto com "NT", fundo azul liso).
// Uso: node scripts/gerar-icones.mjs
//
// O fundo azul é removido por cor (tolerância com borda suave) para obter
// o livro isolado, usado no ícone adaptativo, no monocromático e no splash.
// As letras têm a mesma cor do fundo, então saem vazadas — de propósito.

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const origem = join(raiz, 'assets/icone/origem.webp');
const destino = (nome) => join(raiz, 'assets/images', nome);

export const FUNDO = [54, 84, 120]; // #365478, igual ao app.json
const TOLERANCIA_MIN = 28; // até aqui é fundo (transparente)
const TOLERANCIA_MAX = 70; // a partir daqui é desenho (opaco)

async function livroSemFundo() {
  const { data, info } = await sharp(origem).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const d = Math.hypot(data[i] - FUNDO[0], data[i + 1] - FUNDO[1], data[i + 2] - FUNDO[2]);
    const a = Math.min(Math.max((d - TOLERANCIA_MIN) / (TOLERANCIA_MAX - TOLERANCIA_MIN), 0), 1);
    rgba[j] = data[i];
    rgba[j + 1] = data[i + 1];
    rgba[j + 2] = data[i + 2];
    rgba[j + 3] = Math.round(a * 255);
  }
  return sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

/** Centraliza `imagem` reduzida a `escala` do lado num quadro transparente. */
async function centralizar(imagem, lado, escala) {
  const interno = Math.round(lado * escala);
  const reduzida = await sharp(imagem).resize(interno, interno).toBuffer();
  return sharp({ create: { width: lado, height: lado, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: reduzida, gravity: 'center' }])
    .png();
}

const livro = await livroSemFundo();

await sharp(origem).resize(1024, 1024).png().toFile(destino('icon.png'));
await sharp(origem).resize(48, 48).png().toFile(destino('favicon.png'));
// Adaptativo: o Android recorta em círculo/squircle; 0.8 mantém o livro na zona segura.
await (await centralizar(livro, 1024, 0.8)).toFile(destino('android-icon-foreground.png'));
// Monocromático (ícones temáticos do Android 13+): só a forma, em branco.
const mono = await sharp(livro).ensureAlpha().extractChannel('alpha').toBuffer();
const branco = await sharp({ create: { width: 1254, height: 1254, channels: 3, background: '#ffffff' } })
  .joinChannel(mono)
  .png()
  .toBuffer();
await (await centralizar(branco, 1024, 0.8)).toFile(destino('android-icon-monochrome.png'));
await sharp(livro).resize(512, 512).png().toFile(destino('splash-icon.png'));
console.log('Ícones gerados em assets/images/.');
