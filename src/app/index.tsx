import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { buscarLivro, LIVROS, type Livro } from '@/lib/livros';
import { lerPosicao, type Posicao } from '@/lib/posicao';

export default function ListaDeLivros() {
  const router = useRouter();
  const theme = useTheme();
  const [posicao, setPosicao] = useState<Posicao | null>(null);

  useFocusEffect(useCallback(() => setPosicao(lerPosicao()), []));

  function abrir(livro: Livro) {
    if (livro.capitulos === 1) router.push(`/${livro.id}/1`);
    else router.push(`/${livro.id}`);
  }

  const continuar = posicao && buscarLivro(posicao.livro);

  return (
    <ThemedView style={styles.tela}>
      <FlatList
        data={LIVROS}
        keyExtractor={(livro) => livro.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          continuar ? (
            <Pressable
              style={[styles.continuar, { backgroundColor: theme.backgroundElement }]}
              onPress={() => router.push(`/${posicao.livro}/${posicao.capitulo}`)}>
              <ThemedText type="small" themeColor="textSecondary">
                Continuar lendo
              </ThemedText>
              <ThemedText type="smallBold">
                {continuar.nome} {posicao.capitulo}
              </ThemedText>
            </Pressable>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.item, pressed && { backgroundColor: theme.backgroundSelected }]}
            onPress={() => abrir(item)}>
            <ThemedText>{item.nome}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {`${item.capitulos} ${item.capitulos === 1 ? 'capítulo' : 'capítulos'}`}
            </ThemedText>
          </Pressable>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  lista: { paddingVertical: Spacing.two },
  continuar: {
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.half,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
});
