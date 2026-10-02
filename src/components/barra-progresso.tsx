import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** Barra fina de progresso; `fracao` entre 0 e 1. */
export function BarraProgresso({ fracao, altura = 4 }: { fracao: number; altura?: number }) {
  const theme = useTheme();
  const pct = `${Math.round(Math.min(Math.max(fracao, 0), 1) * 100)}%` as const;
  return (
    <View style={[styles.trilho, { height: altura, backgroundColor: theme.backgroundSelected }]}>
      <View style={{ width: pct, height: '100%', backgroundColor: theme.lidoTexto }} />
    </View>
  );
}

const styles = StyleSheet.create({
  trilho: { borderRadius: 999, overflow: 'hidden' },
});
