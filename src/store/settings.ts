import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Lang } from '@/data/types';

export type LanguagePref = 'system' | Lang;
export type VibrationStrength = 'soft' | 'strong';

export type Settings = {
  /** Tap the card to pause/resume (the Pause button always works). */
  tapToPause: boolean;
  sound: boolean;
  vibration: boolean;
  vibrationStrength: VibrationStrength;
  /** At time's up, draw the next card after a few seconds unless someone taps +1 min. */
  autoAdvance: boolean;
  language: LanguagePref;
};

export const DEFAULT_SETTINGS: Settings = {
  tapToPause: true,
  sound: true,
  vibration: true,
  vibrationStrength: 'soft',
  autoAdvance: false,
  language: 'system',
};

type SettingsStore = Settings & {
  update: (patch: Partial<Settings>) => void;
  resetAll: () => void;
};

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      update: (patch) => set(patch),
      resetAll: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'kindling.settings',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // Persist only the data, never the functions.
      partialize: ({ update, resetAll, ...data }) => data,
      // Fill in any setting added after the user's last save.
      merge: (saved, current) => ({ ...current, ...(saved as Partial<Settings>) }),
    },
  ),
);
