import { FONTES_LEITURA } from '@/constants/theme';
import { usePreferencias } from '@/lib/preferencias';

/** Estilos (regular, itálico, título) da fonte de leitura escolhida pelo usuário. */
export function useFonteLeitura() {
  return FONTES_LEITURA[usePreferencias().familia];
}
