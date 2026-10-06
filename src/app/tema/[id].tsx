import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useFonteLeitura } from '@/hooks/use-fonte-leitura';
import { useTheme } from '@/hooks/use-theme';
import { semColchetes } from '@/lib/busca';
import { buscarLivro } from '@/lib/livros';
import { usePreferencias } from '@/lib/preferencias';
import { buscarTema } from '@/lib/temas';
import { carregarLivro } from '@/lib/texto';

export default function TelaTema() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const fonteLeitura = useFonteLeitura();
  const { fonte } = usePreferencias();
  const tema = buscarTema(id);

  const itens = useMemo(
    () =>
      (tema?.passagens ?? []).map(({ livro, cap, de, ate = de }) => {
        const versiculos = carregarLivro(livro)[cap - 1].slice(de - 1, ate);
        return {
          chave: `${livro}-${cap}-${de}`,
          livro,
          cap,
          de,
          referencia: `${buscarLivro(livro)?.nome} ${cap}:${de}${ate !== de ? `-${ate}` : ''}`,
          texto: versiculos.map((v) => semColchetes(v)).join(' '),
        };
      }),
    [tema],
  );

  if (!tema) return <ThemedText>Tema não encontrado.</ThemedText>;

  // Um pouco menor que a leitura, para caber mais na tela.
  const tamanho = Math.max(fonte - 2, 15);

  return (
    <ThemedView style={styles.tela}>
      <Stack.Screen options={{ title: tema.nome }} />
      <FlatList
        data={itens}
        keyExtractor={(i) => i.chave}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <ThemedText type="small" themeColor="textSecondary" style={styles.cabecalho}>
            {`${tema.oferece} · toque para ler o capítulo`}
          </ThemedText>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.cartao,
              { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
            ]}
            onPress={() => router.push(`/${item.livro}/${item.cap}?v=${item.de}`)}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              {item.referencia}
            </ThemedText>
            <Text style={[fonteLeitura.regular, { fontSize: tamanho, lineHeight: tamanho * 1.5, color: theme.text }]}>
              {item.texto}
            </Text>
          </Pressable>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  lista: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  cabecalho: { paddingHorizontal: Spacing.one },
  cartao: { padding: Spacing.three, borderRadius: Spacing.two, gap: Spacing.two },
});
