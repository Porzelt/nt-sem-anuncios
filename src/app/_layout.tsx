// Import por peso: o índice do pacote empacotaria os 16 pesos (~4 MB).
import { Literata_400Regular } from '@expo-google-fonts/literata/400Regular';
import { Literata_400Regular_Italic } from '@expo-google-fonts/literata/400Regular_Italic';
import { Literata_600SemiBold } from '@expo-google-fonts/literata/600SemiBold';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useNomeTema } from '@/hooks/use-theme';
import { PreferenciasProvider } from '@/lib/preferencias';

export default function RootLayout() {
  // Fontes vêm empacotadas no app (sem internet); o carregamento é local e rápido.
  const [fontesProntas] = useFonts({
    Literata_400Regular,
    Literata_400Regular_Italic,
    Literata_600SemiBold,
  });
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
      <Stack screenOptions={{ headerShadowVisible: false, headerRight: () => <BotaoAjustes /> }}>
        <Stack.Screen name="index" options={{ title: 'NT Sem Anúncios' }} />
        <Stack.Screen name="ajustes" options={{ title: 'Ajustes', headerRight: () => null }} />
        <Stack.Screen name="sobre" options={{ title: 'Sobre', headerRight: () => null }} />
      </Stack>
    </ThemeProvider>
  );
}
