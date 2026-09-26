import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { buscarLivro } from '@/lib/livros';

export default function Capitulos() {
  const { livro: id } = useLocalSearchParams<{ livro: string }>();
  const router = useRouter();
  const theme = useTheme();
  const livro = buscarLivro(id);

  if (!livro) return <ThemedText>Livro não encontrado.</ThemedText>;

  const numeros = Array.from({ length: livro.capitulos }, (_, i) => i + 1);

  return (
    <ThemedView style={styles.tela}>
      <Stack.Screen options={{ title: livro.nome }} />
      <ScrollView contentContainerStyle={styles.grade}>
        {numeros.map((n) => (
          <Pressable
            key={n}
            style={({ pressed }) => [
              styles.celula,
              { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
            ]}
            onPress={() => router.push(`/${livro.id}/${n}`)}>
            <ThemedText type="smallBold">{n}</ThemedText>
          </Pressable>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  celula: {
    width: 56,
    height: 56,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
