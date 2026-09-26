import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { buscarLivro, LIVROS, separarAcrescimos } from '@/lib/livros';
import { salvarPosicao } from '@/lib/posicao';
import { carregarLivro } from '@/lib/texto';

const TAMANHO_FONTE = 19;

export default function Leitura() {
  const params = useLocalSearchParams<{ livro: string; cap: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const livro = buscarLivro(params.livro);
  const texto = useMemo(() => (livro ? carregarLivro(livro.id) : []), [livro]);
  const inicial = Math.min(Math.max(Number(params.cap) || 1, 1), texto.length || 1);
  const [capitulo, setCapitulo] = useState(inicial);
  const lista = useRef<FlatList<string[]>>(null);

  useEffect(() => {
    if (livro) salvarPosicao({ livro: livro.id, capitulo });
  }, [livro, capitulo]);

  if (!livro) return <ThemedText>Livro não encontrado.</ThemedText>;

  const indiceLivro = LIVROS.indexOf(livro);
  const proximoLivro = LIVROS[indiceLivro + 1];

  function aoTerminarDeslize(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const pagina = Math.round(e.nativeEvent.contentOffset.x / width);
    setCapitulo(pagina + 1);
  }

  function irPara(cap: number) {
    lista.current?.scrollToIndex({ index: cap - 1, animated: true });
    setCapitulo(cap);
  }

  return (
    <ThemedView style={styles.tela}>
      <Stack.Screen options={{ title: `${livro.nome} ${capitulo}` }} />
      <FlatList
        ref={lista}
        data={texto}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={inicial - 1}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        onMomentumScrollEnd={aoTerminarDeslize}
        keyExtractor={(_, i) => String(i + 1)}
        windowSize={3}
        initialNumToRender={1}
        renderItem={({ item, index }) => {
          const cap = index + 1;
          const ultimo = cap === texto.length;
          return (
            <View style={{ width }}>
              <PaginaCapitulo
                titulo={`${livro.nome} ${cap}`}
                versiculos={item}
                proximo={
                  ultimo
                    ? proximoLivro && {
                        rotulo: `${proximoLivro.nome} 1 →`,
                        acao: () => router.replace(`/${proximoLivro.id}/1`),
                      }
                    : { rotulo: `Capítulo ${cap + 1} →`, acao: () => irPara(cap + 1) }
                }
              />
            </View>
          );
        }}
      />
    </ThemedView>
  );
}

type PropsPagina = {
  titulo: string;
  versiculos: string[];
  proximo?: { rotulo: string; acao: () => void };
};

function PaginaCapitulo({ titulo, versiculos, proximo }: PropsPagina) {
  const theme = useTheme();
  const corpo = { fontSize: TAMANHO_FONTE, lineHeight: TAMANHO_FONTE * 1.6 };

  return (
    <ScrollView contentContainerStyle={styles.pagina}>
      <ThemedText style={[styles.titulo, { fontFamily: Fonts.serif }]}>{titulo}</ThemedText>
      <Text style={[corpo, { color: theme.text, fontFamily: Fonts.serif }]}>
        {versiculos.map((versiculo, i) => (
          <Text key={i}>
            <Text style={[styles.numero, { color: theme.textSecondary }]}>{i + 1} </Text>
            {separarAcrescimos(versiculo).map((trecho, j) => (
              <Text key={j} style={trecho.acrescimo ? styles.acrescimo : undefined}>
                {trecho.texto}
              </Text>
            ))}
            {i < versiculos.length - 1 ? ' ' : ''}
          </Text>
        ))}
      </Text>
      {proximo && (
        <Pressable
          style={[styles.proximo, { backgroundColor: theme.backgroundElement }]}
          onPress={proximo.acao}>
          <ThemedText type="smallBold">{proximo.rotulo}</ThemedText>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  pagina: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
  },
  titulo: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: 600,
    marginBottom: Spacing.three,
  },
  numero: {
    fontSize: 12,
    fontWeight: 700,
  },
  acrescimo: { fontStyle: 'italic' },
  proximo: {
    alignSelf: 'center',
    marginTop: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
});
