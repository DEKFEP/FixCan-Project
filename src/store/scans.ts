import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getMockScans } from '@/data/mockScans';
import { deleteScanImage } from '@/lib/image';
import type { Locale, Scan } from '@/types/scan';

interface ScansState {
  scans: Scan[];
  seeded: boolean;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  seedDemoScans: (locale: Locale) => void;
  addScan: (scan: Scan) => void;
  removeScan: (id: string) => void;
  clearScans: () => void;
  relocalizeDemoScans: (locale: Locale) => void;
}

export const useScansStore = create<ScansState>()(
  persist(
    (set, get) => ({
      scans: [],
      seeded: false,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      seedDemoScans: (locale) => {
        if (get().seeded) {
          return;
        }
        set({ scans: getMockScans(locale), seeded: true });
      },
      addScan: (scan) => set((state) => ({ scans: [scan, ...state.scans] })),
      removeScan: (id) => {
        const scan = get().scans.find((item) => item.id === id);
        if (scan?.imageUri) {
          deleteScanImage(scan.imageUri);
        }
        set((state) => ({ scans: state.scans.filter((item) => item.id !== id) }));
      },
      clearScans: () => {
        for (const scan of get().scans) {
          if (scan.imageUri) {
            deleteScanImage(scan.imageUri);
          }
        }
        set({ scans: [], seeded: true });
      },
      relocalizeDemoScans: (locale) => {
        const localized = new Map(getMockScans(locale).map((scan) => [scan.id, scan]));
        set((state) => ({
          scans: state.scans.map((scan) => {
            if (!scan.isDemo) {
              return scan;
            }
            const next = localized.get(scan.id);
            if (!next) {
              return scan;
            }
            return {
              ...next,
              createdAt: scan.createdAt,
              imageUri: scan.imageUri ?? next.imageUri,
            };
          }),
        }));
      },
    }),
    {
      name: 'fixcan.scans.v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ scans, seeded }) => ({ scans, seeded }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        } else if (typeof window !== 'undefined') {
          useScansStore.getState().setHasHydrated(true);
        }
      },
    },
  ),
);
