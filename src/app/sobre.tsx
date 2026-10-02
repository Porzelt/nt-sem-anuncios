import Constants from 'expo-constants';
import { Linking, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

function LinkExterno({ url, children }: { url: string; children: string }) {
  return (
    <ThemedText themeColor="tint" onPress={() => Linking.openURL(url)}>
      {children}
    </ThemedText>
  );
}

export default function Sobre() {
  return (
    <ThemedView style={styles.tela}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          NT SEM ANÚNCIOS · versão {Constants.expoConfig?.version}
        </ThemedText>
        <ThemedText>
          Leitura do Novo Testamento gratuita, sem anúncios, sem login e sem coleta de dados. Funciona
          totalmente offline: o app nem tem permissão de acesso à internet.
        </ThemedText>
        <ThemedText>
          Este app não tem vínculo com nenhuma igreja, denominação ou editora.
        </ThemedText>

        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.secao}>
          TRADUÇÃO
        </ThemedText>
        <ThemedText>
          A Bíblia Livre (BLIVRE), Copyright © Diego Santos, Mario Sérgio, e Marco Teles. Texto do
          Novo Testamento baseado no Textus Receptus.
        </ThemedText>
        <LinkExterno url="https://sites.google.com/site/biblialivre/">
          sites.google.com/site/biblialivre
        </LinkExterno>
        <ThemedText>
          Distribuída sob a licença Creative Commons Atribuição 3.0 Brasil (CC BY 3.0 BR).
        </ThemedText>
        <LinkExterno url="https://creativecommons.org/licenses/by/3.0/br/">
          creativecommons.org/licenses/by/3.0/br
        </LinkExterno>
        <ThemedText themeColor="textSecondary" type="small">
          O texto não foi alterado. Palavras que a tradução marca entre colchetes (acréscimos do
          tradutor para dar sentido em português) aparecem em itálico.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  conteudo: { padding: Spacing.four, gap: Spacing.three },
  secao: { marginTop: Spacing.three },
});
