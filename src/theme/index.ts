import { Platform, useColorScheme } from 'react-native';

import { useSettingsStore } from '@/store/settings';

export const darkColors = {
  background: '#080A0B',
  surface: '#111417',
  surfaceElevated: '#171C1F',
  surfaceMuted: '#0C0F11',
  input: '#14181B',
  border: '#242B2F',
  borderStrong: '#364045',
  text: '#F4F7F5',
  textSecondary: '#9BA6A0',
  textMuted: '#6C7772',
  accent: '#C8F751',
  accentText: '#0A0D08',
  accentSoft: 'rgba(200, 247, 81, 0.12)',
  accentBorder: 'rgba(200, 247, 81, 0.38)',
  info: '#63C8FF',
  infoSoft: 'rgba(99, 200, 255, 0.12)',
  success: '#63E0A8',
  successSoft: 'rgba(99, 224, 168, 0.12)',
  warning: '#FFC65C',
  warningSoft: 'rgba(255, 198, 92, 0.12)',
  orange: '#FF9B54',
  orangeSoft: 'rgba(255, 155, 84, 0.12)',
  danger: '#FF6B6B',
  dangerSoft: 'rgba(255, 107, 107, 0.12)',
  purple: '#B9A7FF',
  overlay: 'rgba(0, 0, 0, 0.62)',
  tabBar: '#0B0E10',
  shadow: '#000000',
} as const;

export type ThemeColors = {
  [K in keyof typeof darkColors]: string;
};

export const lightColors: ThemeColors = {
  background: '#F5F6F1',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#ECEFE7',
  input: '#FFFFFF',
  border: '#E0E4DA',
  borderStrong: '#C7CEC0',
  text: '#121611',
  textSecondary: '#5B645D',
  textMuted: '#8A948C',
  accent: '#4F7A00',
  accentText: '#FFFFFF',
  accentSoft: 'rgba(79, 122, 0, 0.10)',
  accentBorder: 'rgba(79, 122, 0, 0.35)',
  info: '#0B7FB8',
  infoSoft: 'rgba(11, 127, 184, 0.10)',
  success: '#1B8A5A',
  successSoft: 'rgba(27, 138, 90, 0.10)',
  warning: '#9A6B00',
  warningSoft: 'rgba(154, 107, 0, 0.10)',
  orange: '#B95B13',
  orangeSoft: 'rgba(185, 91, 19, 0.10)',
  danger: '#C43D3D',
  dangerSoft: 'rgba(196, 61, 61, 0.10)',
  purple: '#6E54C8',
  overlay: 'rgba(0, 0, 0, 0.55)',
  tabBar: '#FFFFFF',
  shadow: '#1B1F1C',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export const fontFamily = {
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  display: 'SpaceGrotesk_600SemiBold',
  displayBold: 'SpaceGrotesk_700Bold',
  mono: Platform.select({ ios: 'Menlo', default: 'monospace' }),
} as const;

export const maxContentWidth = 720;

export function useAppTheme() {
  const systemScheme = useColorScheme();
  const themeMode = useSettingsStore((state) => state.themeMode);
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme !== 'light');

  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
    spacing,
    radius,
    fontFamily,
  };
}
