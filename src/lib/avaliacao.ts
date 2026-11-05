// Pedido de avaliação com a janela oficial do Google Play (dentro do app),
// logo depois da comemoração de marcos da ofensiva: 3 dias, 2 semanas e
// 50 dias. No máximo 3 pedidos; o próprio Google ainda limita quantas vezes a
// janela aparece e não informa se a pessoa avaliou. Seguindo a orientação do
// Google, não há pergunta antes da janela ("gostou?", "dê 5 estrelas").
import Storage from 'expo-sqlite/kv-store';
import * as StoreReview from 'expo-store-review';

const CHAVE = 'pedidosAvaliacao';
const MARCOS_DO_PEDIDO = [3, 14, 50];

/** Se este marco é momento de pedir (cada marco pede uma única vez). */
export function devePedirAvaliacao(diasDoMarco: number): boolean {
  const feitos = Number(Storage.getItemSync(CHAVE) ?? 0) || 0;
  const devidos = MARCOS_DO_PEDIDO.filter((d) => diasDoMarco >= d).length;
  return devidos > feitos;
}

/** Mostra a janela de avaliação do Google Play, se disponível. */
export async function pedirAvaliacao(diasDoMarco: number) {
  Storage.setItemSync(CHAVE, String(MARCOS_DO_PEDIDO.filter((d) => diasDoMarco >= d).length));
  try {
    if (await StoreReview.isAvailableAsync()) await StoreReview.requestReview();
  } catch {
    // Sem a janela (ex.: Expo Go), há o botão "Avaliar" nos Ajustes.
  }
}
