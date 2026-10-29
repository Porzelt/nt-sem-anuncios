// Links da Play Store para divulgação: compartilhar o app, avaliar e
// assinatura no versículo compartilhado. Não usa internet no app: só abre a
// Play Store (ou o navegador) e entrega o texto para o Compartilhar do Android.
import { Linking, Share } from 'react-native';

const PACOTE = 'com.porzelt.ntsemanuncios';
const LINK_LOJA = `https://play.google.com/store/apps/details?id=${PACOTE}`;

/** Link da loja com a origem (utm_source), para medir de onde vêm as instalações. */
export function linkLoja(origem: 'versiculo' | 'convite'): string {
  return `${LINK_LOJA}&referrer=utm_source%3D${origem}`;
}

/** Linha acrescentada ao versículo compartilhado (desligável nos Ajustes). */
export function assinaturaVersiculo(): string {
  return `Lido no app Novo Testamento Sem Anúncios\n${linkLoja('versiculo')}`;
}

export async function compartilharApp() {
  await Share.share({
    message:
      'Estou lendo o Novo Testamento neste app gratuito: sem anúncios, sem cadastro e sem precisar ' +
      `de internet.\n${linkLoja('convite')}`,
  });
}

/** Abre a página do app na Play Store (ou no navegador, se não houver loja). */
export async function abrirAvaliacao() {
  try {
    await Linking.openURL(`market://details?id=${PACOTE}`);
  } catch {
    await Linking.openURL(LINK_LOJA);
  }
}
