// Tela "Sua leitura": a ofensiva em detalhe (dias seguidos, recorde, próximo
// marco, marcos conquistados, calendário das últimas semanas e lembrete).
// Aberta pelo cartão 🔥 do início.
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BarraProgresso } from '@/components/barra-progresso';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FonteLeitura, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { lerLembrete } from '@/lib/lembrete';
import {
  calendarioRecente,
  dataLocal,
  diasDeLeitura,
  lerOfensiva,
  MARCOS,
  marcoDe,
  proximoMarco,
} from '@/lib/ofensiva';

const SEMANAS = 5;
const DIAS_DA_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function ler() {
  const hoje = dataLocal();
  return {
    ofensiva: lerOfensiva(),
    calendario: calendarioRecente(diasDeLeitura(), hoje, SEMANAS),
    lembrete: lerLembrete(),
  };
}

export default function TelaOfensiva() {
  const theme = useTheme();
  const router = useRouter();
  const [dados, setDados] = useState(ler);

  // Recarrega ao voltar (ex.: depois de ajustar o lembrete nos Ajustes).
  useFocusEffect(
    useCallback(() => {
      setDados(ler());
    }, []),
  );

  const { ofensiva, calendario, lembrete } = dados;
  const marcoAtual = marcoDe(ofensiva.atual);
  const proximo = proximoMarco(ofensiva.atual);
  const anterior = marcoAtual?.dias ?? 0;
  const status = ofensiva.leuHoje
    ? 'Leitura de hoje feita ✓'
    : ofensiva.atual > 0
      ? 'Leia um capítulo hoje para continuar'
      : 'Leia um capítulo para começar sua sequência';
  const horario = `${String(lembrete.hora).padStart(2, '0')}:${String(lembrete.minuto).padStart(2, '0')}`;

  return (
    <ThemedView style={styles.tela}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View
          style={[
            styles.destaque,
            { backgroundColor: theme.backgroundElement, borderColor: marcoAtual?.cor ?? 'transparent' },
          ]}>
          <ThemedText style={[styles.chama, { opacity: ofensiva.atual > 0 ? 1 : 0.35 }]}>🔥</ThemedText>
          <ThemedText style={[styles.numero, { fontFamily: FonteLeitura.titulo }]}>{ofensiva.atual}</ThemedText>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {ofensiva.atual === 1 ? 'DIA SEGUIDO' : 'DIAS SEGUIDOS'}
          </ThemedText>
          {marcoAtual && (
            <ThemedText type="smallBold" style={{ color: marcoAtual.cor }}>
              {`✦ ${marcoAtual.nome}`}
            </ThemedText>
          )}
          <ThemedText type="small" style={{ color: ofensiva.leuHoje ? theme.lidoTexto : theme.textSecondary }}>
            {status}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {`Recorde: ${ofensiva.recorde} ${ofensiva.recorde === 1 ? 'dia' : 'dias'}`}
          </ThemedText>
        </View>

        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.secao}>
          PRÓXIMO MARCO
        </ThemedText>
        {proximo ? (
          <View style={styles.bloco}>
            <View style={styles.linha}>
              <ThemedText type="smallBold" style={{ color: proximo.cor }}>
                {proximo.nome}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {proximo.dias - ofensiva.atual === 1 ? 'falta 1 dia' : `faltam ${proximo.dias - ofensiva.atual} dias`}
              </ThemedText>
            </View>
            <BarraProgresso fracao={(ofensiva.atual - anterior) / (proximo.dias - anterior)} altura={6} />
          </View>
        ) : (
          <ThemedText>Você passou por todos os marcos. Que caminhada!</ThemedText>
        )}

        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.secao}>
          MARCOS
        </ThemedText>
        <View style={styles.marcos}>
          {MARCOS.map((m) => {
            const conquistado = ofensiva.recorde >= m.dias;
            return (
              <View
                key={m.dias}
                accessibilityLabel={`${m.nome}${conquistado ? ', conquistado' : ''}`}
                style={[
                  styles.marco,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: conquistado ? m.cor : 'transparent',
                    opacity: conquistado ? 1 : 0.55,
                  },
                ]}>
                <ThemedText type="smallBold" style={{ color: conquistado ? m.cor : theme.textSecondary }}>
                  {conquistado ? `✓ ${m.nome}` : m.nome}
                </ThemedText>
              </View>
            );
          })}
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          Os marcos conquistados contam pelo seu recorde.
        </ThemedText>

        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.secao}>
          ÚLTIMAS SEMANAS
        </ThemedText>
        <View style={styles.calendario}>
          <View style={styles.semana}>
            {DIAS_DA_SEMANA.map((d, i) => (
              <ThemedText key={i} type="small" themeColor="textSecondary" style={styles.cabecalhoDia}>
                {d}
              </ThemedText>
            ))}
          </View>
          {calendario.map((semana, s) => (
            <View key={s} style={styles.semana}>
              {semana.map((d) => (
                <View
                  key={d.dia}
                  accessibilityLabel={`${d.dia}${d.leu ? ', com leitura' : ''}${d.hoje ? ', hoje' : ''}`}
                  style={[
                    styles.dia,
                    d.leu && { backgroundColor: theme.lido },
                    d.hoje && { borderColor: theme.tint, borderWidth: 2 },
                    d.futuro && { opacity: 0.25 },
                  ]}>
                  <ThemedText
                    type={d.leu ? 'smallBold' : 'small'}
                    style={{ color: d.leu ? theme.lidoTexto : theme.textSecondary }}>
                    {Number(d.dia.slice(8))}
                  </ThemedText>
                </View>
              ))}
            </View>
          ))}
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          Dias em verde tiveram pelo menos um capítulo marcado como lido.
        </ThemedText>

        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.secao}>
          COMO FUNCIONA
        </ThemedText>
        <ThemedText>
          Cada dia em que você marca pelo menos um capítulo como lido conta para a sequência. Um dia
          sem leitura por semana é perdoado e não zera a contagem. Dois dias seguidos sem ler, a
          sequência recomeça (o recorde continua guardado).
        </ThemedText>

        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.secao}>
          LEMBRETE DIÁRIO
        </ThemedText>
        <ThemedText>
          {lembrete.ativo
            ? `Ligado, às ${horario}. Só avisa nos dias em que você ainda não leu.`
            : 'Desligado. Um lembrete por dia ajuda a manter a sequência.'}
        </ThemedText>
        <Pressable
          style={({ pressed }) => [
            styles.botao,
            { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
          ]}
          onPress={() => router.push('/ajustes')}>
          <ThemedText>{lembrete.ativo ? 'Ajustar lembrete' : 'Ligar lembrete'}</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const TAMANHO_DIA = 38;

const styles = StyleSheet.create({
  tela: { flex: 1 },
  conteudo: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: Spacing.three,
    gap: Spacing.two,
    paddingBottom: Spacing.six,
  },
  destaque: {
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: 2,
    gap: Spacing.one,
  },
  chama: { fontSize: 44, lineHeight: 56 },
  numero: { fontSize: 56, lineHeight: 68, fontWeight: 'normal' },
  secao: { marginTop: Spacing.four, letterSpacing: 1 },
  bloco: { gap: Spacing.two },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  marcos: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  marco: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: 2,
  },
  calendario: { gap: Spacing.one, alignSelf: 'flex-start' },
  semana: { flexDirection: 'row', gap: Spacing.one },
  cabecalhoDia: { width: TAMANHO_DIA, textAlign: 'center' },
  dia: {
    width: TAMANHO_DIA,
    height: TAMANHO_DIA,
    borderRadius: TAMANHO_DIA / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botao: { padding: Spacing.three, borderRadius: Spacing.two },
});
