import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FonteLeitura, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { buscar, montarIndice, MINIMO_CARACTERES, type Resultado, type Versiculo } from '@/lib/busca';
import { buscarLivro, LIVROS } from '@/lib/livros';
import { carregarLivro } from '@/lib/texto';

// O índice (7957 versículos) é montado uma vez e reaproveitado.
let indiceCache: Versiculo[] | null = null;
function obterIndice() {
  indiceCache ??= montarIndice(LIVROS.map((l) => ({ id: l.id, capitulos: carregarLivro(l.id) })));
  return indiceCache;
}

export default function Busca() {
  const router = useRouter();
  const theme = useTheme();
  const [consulta, setConsulta] = useState('');
  const [termo, setTermo] = useState('');
  const [indice, setIndice] = useState<Versiculo[] | null>(indiceCache);

  // Monta o índice depois da primeira renderização, para a tela abrir na hora.
  useEffect(() => {
    if (indice) return;
    const t = setTimeout(() => setIndice(obterIndice()), 50);
    return () => clearTimeout(t);
  }, [indice]);

  // Espera o usuário parar de digitar antes de buscar.
  useEffect(() => {
    const t = setTimeout(() => setTermo(consulta), 250);
    return () => clearTimeout(t);
  }, [consulta]);

  const { total, resultados } = useMemo(
    () => (indice ? buscar(indice, termo) : { total: 0, resultados: [] as Resultado[] }),
    [indice, termo],
  );

  const curta = termo.trim().length < MINIMO_CARACTERES;

  return (
    <ThemedView style={styles.tela}>
      <KeyboardAvoidingView style={styles.tela} behavior="padding">
        <View style={styles.campoArea}>
          <TextInput
            value={consulta}
            onChangeText={setConsulta}
            placeholder="Palavra ou frase"
            placeholderTextColor={theme.textSecondary}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
            style={[styles.campo, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          />
          {!curta && indice && (
            <ThemedText type="small" themeColor="textSecondary">
              {total === 0
                ? 'Nenhum versículo encontrado.'
                : total > resultados.length
                  ? `${total} versículos · mostrando os ${resultados.length} primeiros`
                  : `${total} ${total === 1 ? 'versículo' : 'versículos'}`}
            </ThemedText>
          )}
        </View>

        {!indice ? (
          <ActivityIndicator style={styles.carregando} color={theme.textSecondary} />
        ) : curta ? (
          <ThemedText themeColor="textSecondary" style={styles.dica}>
            Busque em todo o Novo Testamento. Acentos e maiúsculas não fazem diferença.
          </ThemedText>
        ) : (
          <FlatList
            data={resultados}
            keyExtractor={(r) => `${r.livro}-${r.capitulo}-${r.versiculo}`}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={styles.lista}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.item, pressed && { backgroundColor: theme.backgroundSelected }]}
                onPress={() => router.push(`/${item.livro}/${item.capitulo}?v=${item.versiculo}`)}>
                <ThemedText type="smallBold">
                  {`${buscarLivro(item.livro)?.nome} ${item.capitulo}:${item.versiculo}`}
                </ThemedText>
                <TextoDestacado resultado={item} />
              </Pressable>
            )}
          />
        )}
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

function TextoDestacado({ resultado }: { resultado: Resultado }) {
  const theme = useTheme();
  const partes: { texto: string; destaque: boolean }[] = [];
  let inicio = 0;
  for (const [a, b] of resultado.trechos) {
    if (a > inicio) partes.push({ texto: resultado.texto.slice(inicio, a), destaque: false });
    partes.push({ texto: resultado.texto.slice(a, b), destaque: true });
    inicio = b;
  }
  if (inicio < resultado.texto.length) partes.push({ texto: resultado.texto.slice(inicio), destaque: false });

  return (
    <Text style={[styles.texto, { color: theme.text }]}>
      {partes.map((p, i) => (
        <Text key={i} style={p.destaque ? { backgroundColor: theme.selecao } : undefined}>
          {p.texto}
        </Text>
      ))}
    </Text>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  campoArea: { padding: Spacing.three, gap: Spacing.two },
  campo: {
    fontSize: 17,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
  carregando: { marginTop: Spacing.five },
  dica: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  lista: { paddingBottom: Spacing.six },
  item: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.one,
  },
  texto: { fontFamily: FonteLeitura.regular, fontSize: 16, lineHeight: 24 },
});
