import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ErrorBoundary } from '@/components/error-boundary';
import i18n from '@/i18n';
import { useScansStore } from '@/store/scans';
import { useSettingsStore } from '@/store/settings';
import { useAppTheme } from '@/theme';

void SplashScreen.preventAutoHideAsync();

/**
 * Never keep the splash/blank screen forever: after this delay the app renders
 * with fallback fonts and whatever local data has loaded so far.
 */
const BOOT_TIMEOUT_MS = 3000;

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  const settingsHydrated = useSettingsStore((state) => state.hasHydrated);
  const language = useSettingsStore((state) => state.language);
  const scansHydrated = useScansStore((state) => state.hasHydrated);
  const seeded = useScansStore((state) => state.seeded);
  const seedDemoScans = useScansStore((state) => state.seedDemoScans);
  const relocalizeDemoScans = useScansStore((state) => state.relocalizeDemoScans);
  const { colors, isDark } = useAppTheme();

  const [bootTimedOut, setBootTimedOut] = useState(false);

  useEffect(() => {
    console.log('[FixCan] root layout mounted');
    const timer = setTimeout(() => setBootTimedOut(true), BOOT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  const ready = bootTimedOut || ((fontsLoaded || Boolean(fontError)) && settingsHydrated && scansHydrated);

  useEffect(() => {
    void i18n.changeLanguage(language);
  }, [language]);

  useEffect(() => {
    if (scansHydrated && !seeded) {
      seedDemoScans(language);
    }
  }, [language, scansHydrated, seeded, seedDemoScans]);

  useEffect(() => {
    if (scansHydrated && seeded) {
      relocalizeDemoScans(language);
    }
  }, [language, relocalizeDemoScans, scansHydrated, seeded]);

  useEffect(() => {
    if (fontError) {
      console.warn('[FixCan] fonts failed to load, using fallback fonts', fontError);
    }
  }, [fontError]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    console.log('[FixCan] boot ready', {
      fontsLoaded,
      fontError: Boolean(fontError),
      settingsHydrated,
      scansHydrated,
      bootTimedOut,
    });
    SplashScreen.hideAsync().catch((error) => {
      console.warn('[FixCan] could not hide splash screen', error);
    });
  }, [bootTimedOut, fontError, fontsLoaded, ready, scansHydrated, settingsHydrated]);

  if (!ready) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
          <Stack.Screen name="scan/[id]" />
          <Stack.Screen
            name="profile"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
        </Stack>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
