// Lembrete diário de leitura (opcional, desligado por padrão). Notificações
// locais, agendadas no próprio celular — sem internet. Agendamos dia a dia
// para os próximos 14 dias e pulamos hoje se já houve leitura; reagendamos
// ao abrir o app e ao marcar um capítulo.
import Constants, { ExecutionEnvironment } from 'expo-constants';
import Storage from 'expo-sqlite/kv-store';
import { Alert, Platform } from 'react-native';

import { lerOfensiva } from '@/lib/ofensiva';

// Carregado sob demanda e nunca no Expo Go (falta um módulo nativo lá e o
// import derrubaria o app). No build funciona normalmente.
type ModuloNotificacoes = typeof import('expo-notifications');
let modulo: ModuloNotificacoes | null | undefined;
function notificacoes(): ModuloNotificacoes | null {
  if (modulo === undefined) {
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return (modulo = null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      modulo = require('expo-notifications') as ModuloNotificacoes;
    } catch {
      modulo = null;
    }
  }
  return modulo;
}

const CHAVE = 'lembrete';
const CANAL = 'lembrete';
const DIAS = 14;

export type Lembrete = { ativo: boolean; hora: number; minuto: number };

const PADRAO: Lembrete = { ativo: false, hora: 21, minuto: 0 };
const CHAVE_CONVITE = 'conviteLembrete';

const MENSAGENS = [
  'Que tal um capítulo hoje? 📖',
  'Um momento de leitura te espera.',
  'Seu Novo Testamento está aqui quando quiser.',
];

export function lerLembrete(): Lembrete {
  try {
    return { ...PADRAO, ...JSON.parse(Storage.getItemSync(CHAVE) ?? '{}') };
  } catch {
    return PADRAO;
  }
}

/** Salva e reagenda. Devolve false se o usuário negou a permissão. */
export async function salvarLembrete(lembrete: Lembrete): Promise<boolean> {
  if (lembrete.ativo) {
    const Notifications = notificacoes();
    if (!Notifications) return false;
    const atual = await Notifications.getPermissionsAsync();
    const status = atual.granted ? atual : await Notifications.requestPermissionsAsync();
    if (!status.granted) return false;
  }
  Storage.setItemSync(CHAVE, JSON.stringify(lembrete));
  await reagendarLembretes();
  return true;
}

/**
 * Na primeira leitura marcada, convida (uma única vez) a ligar o lembrete.
 * Não dá para ligar sozinho: o Android 13+ exige pedir a permissão.
 */
export function convidarLembreteUmaVez() {
  if (Storage.getItemSync(CHAVE_CONVITE) || lerLembrete().ativo) return;
  Storage.setItemSync(CHAVE_CONVITE, '1');
  Alert.alert(
    'Primeiro capítulo lido! 🔥',
    'Quer um lembrete diário às 21h para manter a leitura? Ele só aparece nos dias em que você ainda não leu. Dá para mudar o horário em Ajustes (Aa).',
    [
      { text: 'Agora não', style: 'cancel' },
      { text: 'Ativar', onPress: () => void salvarLembrete({ ...lerLembrete(), ativo: true }) },
    ],
  );
}

export async function reagendarLembretes() {
  const Notifications = notificacoes();
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const { ativo, hora, minuto } = lerLembrete();
    if (!ativo) return;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CANAL, {
        name: 'Lembrete diário',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const { atual, leuHoje } = lerOfensiva();
    const agora = new Date();
    for (let i = 0; i < DIAS; i++) {
      const quando = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + i, hora, minuto);
      if (quando <= agora || (i === 0 && leuHoje)) continue;
      // Só o lembrete de hoje cita a sequência (a de amanhã ainda não se sabe).
      const corpo =
        i === 0 && atual > 1
          ? `Você está há ${atual} dias lendo. Um capítulo mantém a sequência 🔥`
          : MENSAGENS[(quando.getDate() + i) % MENSAGENS.length];
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Novo Testamento', body: corpo },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: quando,
          channelId: CANAL,
        },
      });
    }
  } catch {
    // Notificação é um extra: falhar aqui não pode atrapalhar a leitura.
  }
}
