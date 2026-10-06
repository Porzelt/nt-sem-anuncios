import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SeletorSegmentado } from '@/components/seletor-segmentado';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useFonteLeitura } from '@/hooks/use-fonte-leitura';
import { useTheme } from '@/hooks/use-theme';
import {
  FONTE_MAX,
  FONTE_MIN,
  usePreferencias,
  type Diagramacao,
  type FamiliaFonte,
  type Tema,
} from '@/lib/preferencias';

const TEMAS: { valor: Tema; rotulo: string }[] = [
  { valor: 'sistema', rotulo: 'Sistema' },
  { valor: 'claro', rotulo: 'Claro' },
  { valor: 'sepia', rotulo: 'Sépia' },
  { valor: 'escuro', rotulo: 'Escuro' },
];

const FAMILIAS: { valor: FamiliaFonte; rotulo: string }[] = [
  { valor: 'serifada', rotulo: 'Serifada' },
  { valor: 'semSerifa', rotulo: 'Sem serifa' },
  { valor: 'sistema', rotulo: 'Do celular' },
];

const DIAGRAMACOES: { valor: Diagramacao; rotulo: string }[] = [
  { valor: 'paragrafo', rotulo: 'Parágrafo' },
  { valor: 'linhas', rotulo: 'Um por linha' },
];

const ALINHAMENTOS: { valor: 'esquerda' | 'justificado'; rotulo: string }[] = [
  { valor: 'esquerda', rotulo: 'À esquerda' },
  { valor: 'justificado', rotulo: 'Justificado' },
];

export default function Ajustes() {
  const theme = useTheme();
  const { tema, fonte, familia, diagramacao, justificar, alterar } = usePreferencias();
  const fonteLeitura = useFonteLeitura();
  const router = useRouter();

  return (
    <ThemedView style={styles.tela}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          TEMA
        </ThemedText>
        <SeletorSegmentado opcoes={TEMAS} valor={tema} onChange={(t) => alterar({ tema: t })} />

        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.secao}>
          TAMANHO DA LETRA
        </ThemedText>
        <View style={styles.linhaFonte}>
          <BotaoFonte delta={-1} rotulo="A−" />
          <ThemedText themeColor="textSecondary">{fonte}</ThemedText>
          <BotaoFonte delta={1} rotulo="A+" />
        </View>

        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.secao}>
          FONTE
        </ThemedText>
        <SeletorSegmentado opcoes={FAMILIAS} valor={familia} onChange={(f) => alterar({ familia: f })} />

        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.secao}>
          VERSÍCULOS
        </ThemedText>
        <SeletorSegmentado
          opcoes={DIAGRAMACOES}
          valor={diagramacao}
          onChange={(d) => alterar({ diagramacao: d })}
        />
        <SeletorSegmentado
          opcoes={ALINHAMENTOS}
          valor={justificar ? 'justificado' : 'esquerda'}
          onChange={(a) => alterar({ justificar: a === 'justificado' })}
        />

        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.secao}>
          PRÉVIA
        </ThemedText>
        <Text
          style={[
            fonteLeitura.regular,
            {
              fontSize: fonte,
              lineHeight: fonte * 1.6,
              color: theme.text,
              textAlign: justificar ? 'justify' : 'left',
            },
          ]}>
          <Text style={[styles.numero, { color: theme.textSecondary }]}>1 </Text>
          No princípio era a Palavra, e a Palavra estava junto de Deus, e a Palavra era Deus.
          {diagramacao === 'linhas' ? '\n' : ' '}
          <Text style={[styles.numero, { color: theme.textSecondary }]}>2 </Text>
          Esta estava no princípio junto de Deus.
        </Text>

        <Pressable
          style={[styles.sobre, { backgroundColor: theme.backgroundElement }]}
          onPress={() => router.push('/sobre')}>
            <ThemedText>Sobre o app e créditos da tradução</ThemedText>
          </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

function BotaoFonte({ delta, rotulo }: { delta: number; rotulo: string }) {
  const theme = useTheme();
  const { fonte, alterar } = usePreferencias();
  const novo = fonte + delta;
  const desativado = novo < FONTE_MIN || novo > FONTE_MAX;
  return (
    <Pressable
      disabled={desativado}
      accessibilityLabel={delta > 0 ? 'Aumentar fonte' : 'Diminuir fonte'}
      style={[styles.botaoFonte, { backgroundColor: theme.backgroundElement, opacity: desativado ? 0.4 : 1 }]}
      onPress={() => alterar({ fonte: novo })}>
      <ThemedText type="smallBold" style={{ fontSize: delta > 0 ? 22 : 15 }}>
        {rotulo}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  conteudo: { padding: Spacing.four, gap: Spacing.three },
  secao: { marginTop: Spacing.three },
  linhaFonte: { flexDirection: 'row', alignItems: 'center', gap: Spacing.four },
  botaoFonte: {
    width: 56,
    height: 48,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numero: { fontSize: 12, fontWeight: 700 },
  sobre: { marginTop: Spacing.five, padding: Spacing.three, borderRadius: Spacing.two },
});
