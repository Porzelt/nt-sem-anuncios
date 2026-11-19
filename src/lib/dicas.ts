// Dica do gesto de pinça: nas 3 primeiras vezes que a pessoa faz pinça no
// texto (tentando aumentar a letra), o app mostra que o ajuste fica no Aa do topo.
import Storage from 'expo-sqlite/kv-store';

const CHAVE = 'dicaPincaV2';
const VEZES = 3;

export function deveMostrarDicaPinca(): boolean {
  return (Number(Storage.getItemSync(CHAVE) ?? 0) || 0) < VEZES;
}

export function registrarDicaPinca() {
  const vezes = Number(Storage.getItemSync(CHAVE) ?? 0) || 0;
  Storage.setItemSync(CHAVE, String(vezes + 1));
}

