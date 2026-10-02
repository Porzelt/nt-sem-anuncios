import { Colors, type NomeTema } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePreferencias } from '@/lib/preferencias';

/** Tema efetivo: a escolha do usuário, ou o do sistema se for "sistema". */
export function useNomeTema(): NomeTema {
  const { tema } = usePreferencias();
  const scheme = useColorScheme();
  if (tema === 'claro') return 'light';
  if (tema === 'escuro') return 'dark';
  if (tema === 'sepia') return 'sepia';
  return scheme === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
  return Colors[useNomeTema()];
}
