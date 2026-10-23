// Import por peso: o índice do pacote empacotaria os 16 pesos (~4 MB).
import { Literata_400Regular } from '@expo-google-fonts/literata/400Regular';
import { Literata_400Regular_Italic } from '@expo-google-fonts/literata/400Regular_Italic';
import { Literata_600SemiBold } from '@expo-google-fonts/literata/600SemiBold';
import { AtkinsonHyperlegible_400Regular } from '@expo-google-fonts/atkinson-hyperlegible/400Regular';
import { AtkinsonHyperlegible_400Regular_Italic } from '@expo-google-fonts/atkinson-hyperlegible/400Regular_Italic';
import { AtkinsonHyperlegible_700Bold } from '@expo-google-fonts/atkinson-hyperlegible/700Bold';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useNomeTema } from '@/hooks/use-theme';
import { reagendarLembretes } from '@/lib/lembrete';
import { PreferenciasProvider } from '@/lib/preferencias';

export default function RootLayout() {
  // Fontes vêm empacotadas no app (sem internet); o carregamento é local e rápido.
  const [fontesProntas] = useFonts({
    Literata_400Regular,
    Literata_400Regular_Italic,
    Literata_600SemiBold,
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_400Regular_Italic,
    AtkinsonHyperlegible_700Bold,
  });
  // Renova a janela de lembretes (14 dias) a cada abertura do app.
  useEffect(() => {
    void reagendarLembretes();
  }, []);
  if (!fontesProntas) return null;

  return (
    <PreferenciasProvider>
      <Navegacao />
    </PreferenciasProvider>
  );
}

function BotaoAjustes() {
  const router = useRouter();
  return (
    <Pressable hitSlop={12} accessibilityLabel="Ajustes de leitura" onPress={() => router.push('/ajustes')}>
      <ThemedText type="smallBold" style={{ fontSize: 18 }}>
        Aa
      </ThemedText>
    </Pressable>
  );
}

function Navegacao() {
  const nome = useNomeTema();
  const cores = Colors[nome];
  // Com o celular deitado, o recorte da câmera fica na lateral: o conteúdo
  // das telas respeita essas margens (o cabeçalho já respeita sozinho).
  const insets = useSafeAreaInsets();
  const base = nome === 'dark' ? DarkTheme : DefaultTheme;
  const temaNavegacao = {
    ...base,
    colors: {
      ...base.colors,
      primary: cores.tint,
      background: cores.background,
      card: cores.background,
      text: cores.text,
      border: cores.backgroundSelected,
    },
  };

  return (
    <ThemeProvider value={temaNavegacao}>
      <StatusBar style={nome === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerRight: () => <BotaoAjustes />,
          contentStyle: { paddingLeft: insets.left, paddingRight: insets.right },
        }}>
        <Stack.Screen name="index" options={{ title: 'Novo Testamento' }} />
        <Stack.Screen name="ajustes" options={{ title: 'Ajustes', headerRight: () => null }} />
        <Stack.Screen name="sobre" options={{ title: 'Sobre', headerRight: () => null }} />
        <Stack.Screen name="busca" options={{ title: 'Buscar', headerRight: () => null }} />
      </Stack>
    </ThemeProvider>
  );
}
