// Convite para avaliar na Play Store, junto da comemoração de um marco da
// ofensiva (o primeiro é 1 semana). "Agora não" dá direito a um único convite
// a mais, no marco seguinte; depois disso, nunca mais pergunta.
import Storage from 'expo-sqlite/kv-store';

const CHAVE = 'conviteAvaliacao';

type Estado = 'nunca' | 'adiou' | 'encerrado';

function ler(): Estado {
  const v = Storage.getItemSync(CHAVE);
  return v === 'adiou' || v === 'encerrado' ? v : 'nunca';
}

/** Se deve convidar agora (chamado só quando um marco novo é celebrado). */
export function deveConvidarAvaliacao(): boolean {
  return ler() !== 'encerrado';
}

/** Registra a resposta: avaliou → encerra; adiou → só mais uma vez. */
export function registrarRespostaAvaliacao(avaliou: boolean) {
  const proximo: Estado = avaliou || ler() === 'adiou' ? 'encerrado' : 'adiou';
  Storage.setItemSync(CHAVE, proximo);
}
