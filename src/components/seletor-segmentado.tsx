import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Opcao<T extends string> = { valor: T; rotulo: string };

type Props<T extends string> = {
  opcoes: Opcao<T>[];
  valor: T;
  onChange: (valor: T) => void;
};

export function SeletorSegmentado<T extends string>({ opcoes, valor, onChange }: Props<T>) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      {opcoes.map((opcao) => {
        const ativa = opcao.valor === valor;
        return (
          <Pressable
            key={opcao.valor}
            style={[styles.opcao, ativa && { backgroundColor: theme.tint }]}
            onPress={() => onChange(opcao.valor)}>
            <ThemedText
              type="smallBold"
              style={{ color: ativa ? theme.tintText : theme.textSecondary }}>
              {opcao.rotulo}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: Spacing.two,
    padding: Spacing.one,
    gap: Spacing.one,
  },
  opcao: {
    flex: 1,
    alignItems: 'center',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
  },
});
