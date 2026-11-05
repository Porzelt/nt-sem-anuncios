// Convite para avaliar na Play Store, junto da comemoração de um marco da
// ofensiva (a partir de 1 semana). "Agora não" dá direito a um único convite
// a mais, a partir de 1 mês; depois disso, nunca mais pergunta.
import Storage from 'expo-sqlite/kv-store';

const CHAVE = 'conviteAvaliacao';

type Estado = 'nunca' | 'adiou' | 'encerrado';

function ler(): Estado {
  const v = Storage.getItemSync(CHAVE);
  return v === 'adiou' || v === 'encerrado' ? v : 'nunca';
}

/**
 * Se deve convidar agora (chamado só quando um marco novo é celebrado).
 * Primeiro convite a partir de 7 dias; o único convite extra, a partir de 30.
 */
export function deveConvidarAvaliacao(diasDoMarco: number): boolean {
  const estado = ler();
  if (estado === 'nunca') return diasDoMarco >= 7;
  if (estado === 'adiou') return diasDoMarco >= 30;
  return false;
}

/** Registra a resposta: avaliou → encerra; adiou → só mais uma vez. */
export function registrarRespostaAvaliacao(avaliou: boolean) {
  const proximo: Estado = avaliou || ler() === 'adiou' ? 'encerrado' : 'adiou';
  Storage.setItemSync(CHAVE, proximo);
}
