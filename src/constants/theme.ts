/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

// `selecao` é o fundo de um versículo selecionado; `tint`/`tintText`, botões ativos.
export const Colors = {
  light: {
    text: '#1A1A1A',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    tint: '#3D5A80',
    tintText: '#ffffff',
    selecao: '#FFF1B8',
  },
  dark: {
    text: '#E8E6E3',
    background: '#121212',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#A0A4AA',
    tint: '#8FB3DE',
    tintText: '#121212',
    selecao: '#4A4120',
  },
  sepia: {
    text: '#433422',
    background: '#F4ECD8',
    backgroundElement: '#EADFC4',
    backgroundSelected: '#DFD0AE',
    textSecondary: '#7A6650',
    tint: '#8A5A2B',
    tintText: '#F4ECD8',
    selecao: '#E8D28A',
  },
} as const;

export type NomeTema = keyof typeof Colors;
export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
