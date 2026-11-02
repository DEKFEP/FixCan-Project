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
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import i18n from '@/i18n';
import { useScansStore } from '@/store/scans';
import { useSettingsStore } from '@/store/settings';
import { useAppTheme } from '@/theme';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
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
    if (fontsLoaded && settingsHydrated && scansHydrated) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, scansHydrated, settingsHydrated]);

  if (!fontsLoaded || !settingsHydrated || !scansHydrated) {
    return null;
  }

  return (
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
  );
}
