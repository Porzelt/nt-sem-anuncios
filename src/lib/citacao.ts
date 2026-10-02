// Monta o texto copiado/compartilhado a partir dos versículos selecionados.
// Lógica pura (sem imports de app) para testar direto no Node.

/** [1,2,3,5,7,8] → "1-3,5,7-8" */
export function faixaDeVersiculos(numeros: number[]): string {
  const ordenados = [...new Set(numeros)].sort((a, b) => a - b);
  const partes: string[] = [];
  let i = 0;
  while (i < ordenados.length) {
    let fim = i;
    while (fim + 1 < ordenados.length && ordenados[fim + 1] === ordenados[fim] + 1) fim++;
    partes.push(fim === i ? `${ordenados[i]}` : `${ordenados[i]}-${ordenados[fim]}`);
    i = fim + 1;
  }
  return partes.join(',');
}

/**
 * `versiculos` é o capítulo inteiro (índice 0 = versículo 1); `selecionados`
 * são números de versículo. Colchetes de acréscimo são removidos do texto.
 */
export function montarCitacao(
  nomeLivro: string,
  capitulo: number,
  versiculos: string[],
  selecionados: number[],
): string {
  const numeros = [...new Set(selecionados)].sort((a, b) => a - b);
  const corpo = numeros
    .map((n) => {
      const texto = versiculos[n - 1].replace(/\[([^\]]*)\]/g, '$1');
      return numeros.length > 1 ? `${n} ${texto}` : texto;
    })
    .join(' ');
  return `${corpo}\n— ${nomeLivro} ${capitulo}:${faixaDeVersiculos(numeros)} (BLIVRE)`;
}
