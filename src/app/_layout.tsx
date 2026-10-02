import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useNomeTema } from '@/hooks/use-theme';
import { PreferenciasProvider } from '@/lib/preferencias';

export default function RootLayout() {
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
