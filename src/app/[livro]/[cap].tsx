import * as Clipboard from 'expo-clipboard';
import { useKeepAwake } from 'expo-keep-awake';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
  type TextLayoutEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useFonteLeitura } from '@/hooks/use-fonte-leitura';
import { useTheme } from '@/hooks/use-theme';
import { semColchetes } from '@/lib/busca';
import { faixaDeVersiculos, montarCitacao } from '@/lib/citacao';
import { buscarLivro, LIVROS, separarAcrescimos } from '@/lib/livros';
import { alternarLido, capitulosLidos, marcarLido } from '@/lib/lidos';
import { ajustarPosicaoAoAlternar, capituloSeguinte, salvarPosicao } from '@/lib/posicao';
import { usePreferencias } from '@/lib/preferencias';
import { carregarLivro } from '@/lib/texto';

export default function Leitura() {
  useKeepAwake();
  const params = useLocalSearchParams<{ livro: string; cap: string; v?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  // Largura útil de cada página: a tela menos as margens laterais seguras
  // (recorte da câmera com o celular deitado), aplicadas no _layout.
  const { width: larguraTela } = useWindowDimensions();
  const width = larguraTela - insets.left - insets.right;
  const livro = buscarLivro(params.livro);
  const texto = useMemo(() => (livro ? carregarLivro(livro.id) : []), [livro]);
  const inicial = Math.min(Math.max(Number(params.cap) || 1, 1), texto.length || 1);
  const [capitulo, setCapitulo] = useState(inicial);
  // Versículo vindo da busca: a página inicial rola até ele e o destaca.
  const versoAlvo = Number(params.v) || undefined;
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [aviso, setAviso] = useState('');
  const [lidos, setLidos] = useState(() => capitulosLidos(params.livro));
  const lista = useRef<FlatList<string[]>>(null);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(''), 1800);
    return () => clearTimeout(t);
  }, [aviso]);

  // Ao girar a tela a largura muda e o deslocamento antigo apontaria para
  // outro ponto: realinha a página no capítulo atual.
  const realinhar = useEffectEvent(() => {
    lista.current?.scrollToIndex({ index: capitulo - 1, animated: false });
  });
  useEffect(() => {
    realinhar();
  }, [width]);

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

  // Botão "Marcar como lido": marca (ou desmarca) sem sair do capítulo.
  function alternarLeitura(cap: number) {
    if (lidos.includes(cap)) {
      ajustarPosicaoAoAlternar(livro!.id, cap, alternarLido(livro!.id, cap));
    } else {
      marcarLido(livro!.id, cap);
      const seguinte = capituloSeguinte(livro!.id, cap);
      if (seguinte) salvarPosicao(seguinte);
      setAviso('Capítulo marcado como lido ✓');
    }
    setLidos(capitulosLidos(livro!.id));
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

  function pesquisar() {
    // Abre o navegador do celular; o app em si continua sem acesso à internet.
    const consulta = `${livro!.nome} ${capitulo}:${faixaDeVersiculos(selecionados)}`;
    Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(consulta)}`);
    setSelecionados([]);
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
        extraData={[selecionados, lidos]}
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
                versoAlvo={cap === inicial ? versoAlvo : undefined}
                onToque={alternar}
                proximo={{ rotulo, acao: () => concluir(cap) }}
                lido={lidos.includes(cap)}
                onMarcarLido={() => alternarLeitura(cap)}
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
              <BotaoBarra rotulo="Pesquisar" onPress={pesquisar} />
              <BotaoBarra rotulo="✕" onPress={() => setSelecionados([])} secundario />
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
  versoAlvo?: number;
  proximo?: { rotulo: string; acao: () => void };
  lido: boolean;
  onMarcarLido: () => void;
};

function PaginaCapitulo({
  titulo,
  versiculos,
  selecionados,
  onToque,
  versoAlvo,
  proximo,
  lido,
  onMarcarLido,
}: PropsPagina) {
  const theme = useTheme();
  const { fonte, diagramacao, justificar } = usePreferencias();
  const fonteLeitura = useFonteLeitura();
  // Mesmo comprimento (1 caractere) nos dois modos: o cálculo de rolagem até o
  // versículo (aoMedirLinhas) continua valendo.
  const separador = diagramacao === 'linhas' ? '\n' : ' ';
  const corpo = {
    fontSize: fonte,
    lineHeight: fonte * 1.6,
    textAlign: justificar ? ('justify' as const) : ('left' as const),
  };
  const rolagem = useRef<ScrollViewInstance>(null);
  const topoTexto = useRef(0);
  const jaRolou = useRef(false);
  const [destacado, setDestacado] = useState(versoAlvo);

  useEffect(() => {
    if (!destacado) return;
    const t = setTimeout(() => setDestacado(undefined), 3000);
    return () => clearTimeout(t);
  }, [destacado]);

  // O capítulo é um único <Text>; para achar a altura do versículo, soma o
  // comprimento dos versículos anteriores e procura a linha que o contém.
  function aoMedirLinhas(e: TextLayoutEvent) {
    if (!versoAlvo || jaRolou.current) return;
    jaRolou.current = true;
    let deslocamento = 0;
    for (let i = 0; i < versoAlvo - 1; i++) {
      deslocamento += String(i + 1).length + 1 + semColchetes(versiculos[i]).length + 1;
    }
    let acumulado = 0;
    for (const linha of e.nativeEvent.lines) {
      acumulado += linha.text.length;
      if (acumulado > deslocamento) {
        rolagem.current?.scrollTo({ y: Math.max(topoTexto.current + linha.y - Spacing.three, 0), animated: false });
        return;
      }
    }
  }

  return (
    <ScrollView ref={rolagem} contentContainerStyle={styles.pagina}>
      <ThemedText style={[styles.titulo, fonteLeitura.titulo]}>{titulo}</ThemedText>
      <Text
        onLayout={(e) => (topoTexto.current = e.nativeEvent.layout.y)}
        onTextLayout={aoMedirLinhas}
        style={[corpo, fonteLeitura.regular, { color: theme.text }]}>
        {versiculos.map((versiculo, i) => {
          const numero = i + 1;
          const marcado = selecionados.includes(numero);
          return (
            <Text key={i}>
              <Text
                onPress={() => onToque(numero)}
                style={marcado || destacado === numero ? { backgroundColor: theme.selecao } : undefined}>
                <Text style={[styles.numero, { color: theme.textSecondary }]}>{numero} </Text>
                {separarAcrescimos(versiculo).map((trecho, j) => (
                  <Text key={j} style={trecho.acrescimo ? fonteLeitura.italico : undefined}>
                    {trecho.texto}
                  </Text>
                ))}
              </Text>
              {i < versiculos.length - 1 ? separador : ''}
            </Text>
          );
        })}
      </Text>
      <View style={styles.fimCapitulo}>
        <Pressable
          accessibilityLabel={lido ? 'Desmarcar capítulo como lido' : 'Marcar capítulo como lido'}
          style={[styles.botaoFim, { backgroundColor: lido ? theme.lido : theme.backgroundElement }]}
          onPress={onMarcarLido}>
          <ThemedText type="smallBold" style={lido ? { color: theme.lidoTexto } : undefined}>
            {lido ? '✓ Lido' : '✓ Marcar como lido'}
          </ThemedText>
        </Pressable>
        {proximo && (
          <Pressable
            style={[styles.botaoFim, { backgroundColor: theme.backgroundElement }]}
            onPress={proximo.acao}>
            <ThemedText type="smallBold">{proximo.rotulo}</ThemedText>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  pagina: {
    // Deitado ou em tablet, linhas muito longas cansam: a coluna para em 720.
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: 120,
  },
  titulo: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: 'normal',
    marginBottom: Spacing.three,
  },
  numero: {
    fontSize: 12,
    fontWeight: 700,
  },
  tituloTopo: { fontSize: 18, lineHeight: 24 },
  fimCapitulo: {
    marginTop: Spacing.five,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  botaoFim: {
    paddingHorizontal: Spacing.three,
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
