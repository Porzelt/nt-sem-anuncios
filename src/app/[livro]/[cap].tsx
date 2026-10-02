import * as Clipboard from 'expo-clipboard';
import { useKeepAwake } from 'expo-keep-awake';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { montarCitacao } from '@/lib/citacao';
import { buscarLivro, LIVROS, separarAcrescimos } from '@/lib/livros';
import { marcarLido } from '@/lib/lidos';
import { salvarPosicao } from '@/lib/posicao';
import { usePreferencias } from '@/lib/preferencias';
import { carregarLivro } from '@/lib/texto';

export default function Leitura() {
  useKeepAwake();
  const params = useLocalSearchParams<{ livro: string; cap: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const livro = buscarLivro(params.livro);
  const texto = useMemo(() => (livro ? carregarLivro(livro.id) : []), [livro]);
  const inicial = Math.min(Math.max(Number(params.cap) || 1, 1), texto.length || 1);
  const [capitulo, setCapitulo] = useState(inicial);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [aviso, setAviso] = useState('');
  const lista = useRef<FlatList<string[]>>(null);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(''), 1800);
    return () => clearTimeout(t);
  }, [aviso]);

  if (!livro) return <ThemedText>Livro não encontrado.</ThemedText>;

  const proximoLivro = LIVROS[LIVROS.indexOf(livro) + 1];

  function mudarCapitulo(cap: number) {
    if (cap === capitulo) return;
    setCapitulo(cap);
    setSelecionados([]);
  }

  function aoTerminarDeslize(e: NativeSyntheticEvent<NativeScrollEvent>) {
    mudarCapitulo(Math.round(e.nativeEvent.contentOffset.x / width) + 1);
  }

  function irPara(cap: number) {
    lista.current?.scrollToIndex({ index: cap - 1, animated: true });
    mudarCapitulo(cap);
  }

  // Botão do fim do capítulo: confirma a leitura (marca como lido) e
  // aponta o "Continuar lendo" para o capítulo seguinte.
  function concluir(cap: number) {
    marcarLido(livro!.id, cap);
    if (cap < texto.length) {
      salvarPosicao({ livro: livro!.id, capitulo: cap + 1 });
      irPara(cap + 1);
    } else if (proximoLivro) {
      salvarPosicao({ livro: proximoLivro.id, capitulo: 1 });
      router.replace(`/${proximoLivro.id}/1`);
    } else {
      setAviso('Leitura concluída ✓');
    }
  }

  function alternar(numero: number) {
    setSelecionados((atual) =>
      atual.includes(numero) ? atual.filter((n) => n !== numero) : [...atual, numero],
    );
  }

  const citacao = () => montarCitacao(livro.nome, capitulo, texto[capitulo - 1], selecionados);

  async function copiar() {
    await Clipboard.setStringAsync(citacao());
    setSelecionados([]);
    setAviso('Copiado');
  }

  async function compartilhar() {
    await Share.share({ message: citacao() });
    setSelecionados([]);
  }

  return (
    <ThemedView style={styles.tela}>
      <Stack.Screen
        options={{
          title: `${livro.nome} ${capitulo}`,
          // Tocar no título abre a grade de capítulos do livro.
          headerTitle:
            texto.length > 1
              ? () => (
                  <Pressable
                    hitSlop={8}
                    accessibilityLabel="Escolher capítulo"
                    onPress={() => router.dismissTo(`/${livro.id}`)}>
                    <ThemedText type="smallBold" style={styles.tituloTopo}>
                      {`${livro.nome} ${capitulo} ▾`}
                    </ThemedText>
                  </Pressable>
                )
              : undefined,
        }}
      />
      <FlatList
        ref={lista}
        data={texto}
        extraData={selecionados}
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
          const rotulo =
            cap < texto.length
              ? `Capítulo ${cap + 1} →`
              : proximoLivro
                ? `${proximoLivro.nome} 1 →`
                : 'Concluir leitura ✓';
          return (
            <View style={{ width }}>
              <PaginaCapitulo
                titulo={`${livro.nome} ${cap}`}
                versiculos={item}
                selecionados={cap === capitulo ? selecionados : []}
                onToque={alternar}
                proximo={{ rotulo, acao: () => concluir(cap) }}
              />
            </View>
          );
        }}
      />

      {(selecionados.length > 0 || aviso) && (
        <View
          style={[
            styles.barra,
            { backgroundColor: theme.backgroundElement, paddingBottom: Spacing.three + insets.bottom },
          ]}>
          {aviso ? (
            <ThemedText type="smallBold">{aviso}</ThemedText>
          ) : (
            <>
              <BotaoBarra rotulo="Copiar" onPress={copiar} />
              <BotaoBarra rotulo="Compartilhar" onPress={compartilhar} />
              <BotaoBarra rotulo="Cancelar" onPress={() => setSelecionados([])} secundario />
            </>
          )}
        </View>
      )}
    </ThemedView>
  );
}

function BotaoBarra({
  rotulo,
  onPress,
  secundario,
}: {
  rotulo: string;
  onPress: () => void;
  secundario?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.botaoBarra, !secundario && { backgroundColor: theme.tint }]}>
      <ThemedText type="smallBold" style={{ color: secundario ? theme.textSecondary : theme.tintText }}>
        {rotulo}
      </ThemedText>
    </Pressable>
  );
}

type PropsPagina = {
  titulo: string;
  versiculos: string[];
  selecionados: number[];
  onToque: (numero: number) => void;
  proximo?: { rotulo: string; acao: () => void };
};

function PaginaCapitulo({ titulo, versiculos, selecionados, onToque, proximo }: PropsPagina) {
  const theme = useTheme();
  const { fonte } = usePreferencias();
  const corpo = { fontSize: fonte, lineHeight: fonte * 1.6 };

  return (
    <ScrollView contentContainerStyle={styles.pagina}>
      <ThemedText style={[styles.titulo, { fontFamily: Fonts.serif }]}>{titulo}</ThemedText>
      <Text style={[corpo, { color: theme.text, fontFamily: Fonts.serif }]}>
        {versiculos.map((versiculo, i) => {
          const numero = i + 1;
          const marcado = selecionados.includes(numero);
          return (
            <Text key={i}>
              <Text
                onPress={() => onToque(numero)}
                style={marcado ? { backgroundColor: theme.selecao } : undefined}>
                <Text style={[styles.numero, { color: theme.textSecondary }]}>{numero} </Text>
                {separarAcrescimos(versiculo).map((trecho, j) => (
                  <Text key={j} style={trecho.acrescimo ? styles.acrescimo : undefined}>
                    {trecho.texto}
                  </Text>
                ))}
              </Text>
              {i < versiculos.length - 1 ? ' ' : ''}
            </Text>
          );
        })}
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
    paddingBottom: 120,
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
  tituloTopo: { fontSize: 18, lineHeight: 24 },
  proximo: {
    alignSelf: 'center',
    marginTop: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
  barra: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  botaoBarra: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
});
