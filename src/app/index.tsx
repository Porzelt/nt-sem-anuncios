import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';

import { BarraProgresso } from '@/components/barra-progresso';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { alternarLido, todosLidos } from '@/lib/lidos';
import { buscarLivro, GRUPOS, LIVROS, TOTAL_CAPITULOS, type Livro } from '@/lib/livros';
import { lerPosicao, type Posicao } from '@/lib/posicao';

const SECOES = GRUPOS.map((g) => ({
  titulo: g.nome,
  data: LIVROS.filter((l) => l.grupo === g.id),
}));

export default function Inicio() {
  const router = useRouter();
  const theme = useTheme();
  const [posicao, setPosicao] = useState<Posicao | null>(null);
  const [lidos, setLidos] = useState<Record<string, number[]>>({});

  useFocusEffect(
    useCallback(() => {
      setPosicao(lerPosicao());
      setLidos(todosLidos());
    }, []),
  );

  const lidosNoLivro = (livro: Livro) => lidos[livro.id]?.length ?? 0;
  const totalLidos = LIVROS.reduce((soma, l) => soma + lidosNoLivro(l), 0);

  function descricao(livro: Livro) {
    const n = lidosNoLivro(livro);
    if (n === livro.capitulos) return 'lido ✓';
    if (n > 0) return `${n}/${livro.capitulos} lidos`;
    return `${livro.capitulos} ${livro.capitulos === 1 ? 'capítulo' : 'capítulos'}`;
  }

  // Livros de 1 capítulo não têm grade: segurar o livro marca/desmarca.
  function segurar(livro: Livro) {
    if (livro.capitulos !== 1) return;
    alternarLido(livro.id, 1);
    setLidos(todosLidos());
  }

  function abrir(livro: Livro) {
    if (livro.capitulos === 1) router.push(`/${livro.id}/1`);
    else router.push(`/${livro.id}`);
  }

  // Sem posição salva (primeira abertura), o destaque sugere Mateus 1.
  const destino = posicao ?? { livro: 'mat', capitulo: 1 };
  const livroDestino = buscarLivro(destino.livro)!;
  const pctTotal = Math.round((totalLidos / TOTAL_CAPITULOS) * 100);

  const cabecalho = (
    <View style={styles.cabecalho}>
      <Pressable
        style={({ pressed }) => [
          styles.destaque,
          { backgroundColor: theme.tint, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() => router.push(`/${destino.livro}/${destino.capitulo}`)}>
        <ThemedText type="small" style={{ color: theme.tintText, opacity: 0.85 }}>
          {posicao ? 'Continuar lendo' : 'Comece por aqui'}
        </ThemedText>
        <ThemedText style={[styles.destaqueTitulo, { color: theme.tintText, fontFamily: Fonts.serif }]}>
          {`${livroDestino.nome} ${destino.capitulo}`}
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: theme.tintText }}>
          Ler agora →
        </ThemedText>
      </Pressable>

      <View style={styles.progressoGeral}>
        <View style={styles.linhaProgresso}>
          <ThemedText type="small" themeColor="textSecondary">
            Novo Testamento
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {`${pctTotal}% lido · ${totalLidos}/${TOTAL_CAPITULOS} capítulos`}
          </ThemedText>
        </View>
        <BarraProgresso fracao={totalLidos / TOTAL_CAPITULOS} altura={6} />
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.tela}>
      <SectionList
        sections={SECOES}
        keyExtractor={(livro) => livro.id}
        extraData={lidos}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={cabecalho}
        renderSectionHeader={({ section }) => (
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.secao}>
            {section.titulo.toUpperCase()}
          </ThemedText>
        )}
        renderItem={({ item }) => {
          const n = lidosNoLivro(item);
          return (
            <Pressable
              style={({ pressed }) => [styles.item, pressed && { backgroundColor: theme.backgroundSelected }]}
              onPress={() => abrir(item)}
              onLongPress={() => segurar(item)}>
              <View style={styles.linhaItem}>
                <ThemedText>{item.nome}</ThemedText>
                <ThemedText
                  type="small"
                  numberOfLines={1}
                  style={{ color: n === item.capitulos ? theme.lidoTexto : theme.textSecondary }}>
                  {descricao(item)}
                </ThemedText>
              </View>
              {n > 0 && n < item.capitulos && <BarraProgresso fracao={n / item.capitulos} altura={3} />}
            </Pressable>
          );
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  lista: { paddingBottom: Spacing.five },
  cabecalho: { padding: Spacing.three, gap: Spacing.four },
  destaque: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  destaqueTitulo: { fontSize: 30, lineHeight: 38, fontWeight: 600 },
  progressoGeral: { gap: Spacing.two, paddingHorizontal: Spacing.one },
  linhaProgresso: { flexDirection: 'row', justifyContent: 'space-between' },
  secao: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.one,
    letterSpacing: 1,
  },
  item: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  linhaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
