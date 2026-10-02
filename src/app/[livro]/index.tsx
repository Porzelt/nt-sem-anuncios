import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { alternarLido, capitulosLidos } from '@/lib/lidos';
import { buscarLivro } from '@/lib/livros';
import { ajustarPosicaoAoAlternar } from '@/lib/posicao';

export default function Capitulos() {
  const { livro: id } = useLocalSearchParams<{ livro: string }>();
  const router = useRouter();
  const theme = useTheme();
  const livro = buscarLivro(id);
  const [lidos, setLidos] = useState<number[]>([]);

  useFocusEffect(useCallback(() => setLidos(capitulosLidos(id)), [id]));

  if (!livro) return <ThemedText>Livro não encontrado.</ThemedText>;

  const numeros = Array.from({ length: livro.capitulos }, (_, i) => i + 1);

  function alternar(n: number) {
    ajustarPosicaoAoAlternar(livro!.id, n, alternarLido(livro!.id, n));
    setLidos(capitulosLidos(livro!.id));
  }

  return (
    <ThemedView style={styles.tela}>
      <Stack.Screen options={{ title: livro.nome }} />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <ThemedText type="small" themeColor="textSecondary">
          {`${lidos.length} de ${livro.capitulos} lidos · segure um capítulo para marcar ou desmarcar`}
        </ThemedText>
        <View style={styles.grade}>
          {numeros.map((n) => {
            const lido = lidos.includes(n);
            const fundo = lido ? theme.lido : theme.backgroundElement;
            return (
              <Pressable
                key={n}
                accessibilityLabel={`Capítulo ${n}${lido ? ', lido' : ''}`}
                style={({ pressed }) => [
                  styles.celula,
                  { backgroundColor: pressed ? theme.backgroundSelected : fundo },
                ]}
                onPress={() => router.push(`/${livro.id}/${n}`)}
                onLongPress={() => alternar(n)}>
                <ThemedText type="smallBold" style={lido ? { color: theme.lidoTexto } : undefined}>
                  {lido ? `${n} ✓` : n}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  conteudo: { padding: Spacing.three, gap: Spacing.three },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  celula: {
    width: 56,
    height: 56,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
