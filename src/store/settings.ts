import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import i18n from '@/i18n';
import type { Locale, ThemeMode, UserProfile } from '@/types/scan';

interface SettingsState {
  language: Locale;
  themeMode: ThemeMode;
  signedIn: boolean;
  user: UserProfile | null;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setLanguage: (language: Locale) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  signIn: (user: UserProfile) => void;
  signOut: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      themeMode: 'dark',
      signedIn: false,
      user: null,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setLanguage: (language) => {
        void i18n.changeLanguage(language);
        set({ language });
      },
      setThemeMode: (themeMode) => set({ themeMode }),
      signIn: (user) => set({ signedIn: true, user }),
      signOut: () => set({ signedIn: false }),
    }),
    {
      name: 'fixcan.settings.v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ language, themeMode, signedIn, user }) => ({
        language,
        themeMode,
        signedIn,
        user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          void i18n.changeLanguage(state.language);
          state.setHasHydrated(true);
        } else if (typeof window !== 'undefined') {
          useSettingsStore.getState().setHasHydrated(true);
        }
      },
    },
  ),
);
