import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, SectionList, StyleSheet, View } from 'react-native';

import { BarraProgresso } from '@/components/barra-progresso';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FonteLeitura, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { alternarLido, todosLidos } from '@/lib/lidos';
import { buscarLivro, GRUPOS, LIVROS, TOTAL_CAPITULOS, type Livro } from '@/lib/livros';
import { ajustarPosicaoAoAlternar, lerPosicao, type Posicao } from '@/lib/posicao';
import { lerOfensiva, marcoDe, marcoParaCelebrar } from '@/lib/ofensiva';
import { TEMAS } from '@/lib/temas';

const SECOES = GRUPOS.map((g) => ({
  titulo: g.nome,
  data: LIVROS.filter((l) => l.grupo === g.id),
}));

export default function Inicio() {
  const router = useRouter();
  const theme = useTheme();
  const [posicao, setPosicao] = useState<Posicao | null>(null);
  const [lidos, setLidos] = useState<Record<string, number[]>>({});
  const [ofensiva, setOfensiva] = useState(lerOfensiva);

  useFocusEffect(
    useCallback(() => {
      setPosicao(lerPosicao());
      setLidos(todosLidos());
      const o = lerOfensiva();
      setOfensiva(o);
      const novo = marcoParaCelebrar(o.atual);
      if (novo) Alert.alert(`🔥 ${novo.nome}`, novo.celebracao);
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
    ajustarPosicaoAoAlternar(livro.id, 1, alternarLido(livro.id, 1));
    setLidos(todosLidos());
    setPosicao(lerPosicao());
    setOfensiva(lerOfensiva());
  }

  function abrir(livro: Livro) {
    if (livro.capitulos === 1) router.push(`/${livro.id}/1`);
    else router.push(`/${livro.id}`);
  }

  // Sem posição salva (primeira abertura), o destaque sugere Mateus 1.
  const destino = posicao ?? { livro: 'mat', capitulo: 1 };
  const livroDestino = buscarLivro(destino.livro)!;
  const pctTotal = Math.round((totalLidos / TOTAL_CAPITULOS) * 100);

  // Tom acolhedor: convida, nunca cobra.
  const mensagemOfensiva = ofensiva.leuHoje
    ? 'Leitura de hoje feita ✓'
    : ofensiva.atual > 0
      ? 'Leia um capítulo hoje para continuar'
      : ofensiva.jaLeu
        ? 'Que bom te ver de volta. Que tal um capítulo hoje?'
        : 'Leia um capítulo por dia e acompanhe aqui';
  const diasSeguidos = ofensiva.atual === 1 ? '1 dia seguido' : `${ofensiva.atual} dias seguidos`;
  const marco = marcoDe(ofensiva.atual);

  const cabecalho = (
    <View style={styles.cabecalho}>
      <Pressable
        accessibilityRole="search"
        style={[styles.busca, { backgroundColor: theme.backgroundElement }]}
        onPress={() => router.push('/busca')}>
        <ThemedText themeColor="textSecondary">Buscar no Novo Testamento…</ThemedText>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.destaque,
          { backgroundColor: theme.tint, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() => router.push(`/${destino.livro}/${destino.capitulo}`)}>
        <ThemedText type="small" style={{ color: theme.tintText, opacity: 0.85 }}>
          {posicao ? 'Continuar lendo' : 'Comece por aqui'}
        </ThemedText>
        <ThemedText style={[styles.destaqueTitulo, { color: theme.tintText, fontFamily: FonteLeitura.titulo }]}>
          {`${livroDestino.nome} ${destino.capitulo}`}
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: theme.tintText }}>
          Ler agora →
        </ThemedText>
      </Pressable>

      <Pressable
        accessibilityLabel={`${diasSeguidos}. ${mensagemOfensiva}. Toque para configurar o lembrete.`}
        style={({ pressed }) => [
          styles.ofensiva,
          {
            backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
            borderColor: marco?.cor ?? 'transparent',
          },
        ]}
        onPress={() => router.push('/ajustes')}
        // Só em desenvolvimento: segurar simula os marcos para ver as cores.
        onLongPress={
          __DEV__
            ? () => {
                const seguinte = [7, 30, 100, 365, 0].find((d) => d > ofensiva.atual) ?? 0;
                setOfensiva({ ...ofensiva, atual: seguinte });
              }
            : undefined
        }>
        <ThemedText style={[styles.chama, { opacity: ofensiva.atual > 0 ? 1 : 0.35 }]}>🔥</ThemedText>
        <View style={styles.textoOfensiva}>
          <ThemedText type="smallBold">
            {ofensiva.recorde > 1 ? `${diasSeguidos} · recorde ${ofensiva.recorde}` : diasSeguidos}
          </ThemedText>
          {marco && (
            <ThemedText type="smallBold" style={{ color: marco.cor }}>
              {`✦ ${marco.nome}`}
            </ThemedText>
          )}
          <ThemedText type="small" style={{ color: ofensiva.leuHoje ? theme.lidoTexto : theme.textSecondary }}>
            {mensagemOfensiva}
          </ThemedText>
        </View>
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

      <View style={styles.temas}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.tituloTemas}>
          PARA MOMENTOS DE…
        </ThemedText>
        <View style={styles.chips}>
          {TEMAS.map((t) => (
            <Pressable
              key={t.id}
              accessibilityLabel={`${t.nome}: ${t.oferece}`}
              style={({ pressed }) => [
                styles.chip,
                { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
              ]}
              onPress={() => router.push(`/tema/${t.id}`)}>
              <ThemedText type="small">{t.nome}</ThemedText>
            </Pressable>
          ))}
        </View>
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
  temas: { gap: Spacing.two },
  tituloTemas: { letterSpacing: 1, paddingHorizontal: Spacing.one },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
  },
  busca: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
  destaque: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  destaqueTitulo: { fontSize: 30, lineHeight: 40, fontWeight: 'normal' },
  ofensiva: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.two,
    borderWidth: 2,
  },
  chama: { fontSize: 28, lineHeight: 36 },
  textoOfensiva: { flex: 1, gap: 2 },
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
