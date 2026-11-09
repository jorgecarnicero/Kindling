import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Lang } from '@/data/types';

export type LanguagePref = 'system' | Lang;
export type VibrationStrength = 'soft' | 'strong';
/** Auto follows the phone's light/dark mode; Day = Matchbox, Night = Campfire. */
export type Appearance = 'auto' | 'day' | 'night';

/** Topic length choices in seconds; 0 = timer off (cards only). */
export const TIMER_OPTIONS = [30, 60, 120, 180, 300, 0] as const;
export type TimerSeconds = (typeof TIMER_OPTIONS)[number];

/** Campfire ambience: off, only in night mode (the fire is lit), or always. */
export const AMBIENCE_OPTIONS = ['off', 'night', 'always'] as const;
export type Ambience = (typeof AMBIENCE_OPTIONS)[number];
export const AMBIENCE_VOLUMES = ['soft', 'medium', 'loud'] as const;
export type AmbienceVolume = (typeof AMBIENCE_VOLUMES)[number];

export type Settings = {
  appearance: Appearance;
  ambience: Ambience;
  ambienceVolume: AmbienceVolume;
  /** How long each topic lasts; 0 = no timer. */
  timerSeconds: TimerSeconds;
  /** Tap the card to pause/resume (the Pause button always works). */
  tapToPause: boolean;
  sound: boolean;
  vibration: boolean;
  vibrationStrength: VibrationStrength;
  /** At time's up, draw the next card after a few seconds unless someone taps +1 min. */
  autoAdvance: boolean;
  /** Road trip: read each stop aloud with the phone's voice (the speaker button). */
  readAloud: boolean;
  language: LanguagePref;
};

export const DEFAULT_SETTINGS: Settings = {
  appearance: 'auto',
  ambience: 'night',
  ambienceVolume: 'soft',
  timerSeconds: 60,
  tapToPause: true,
  sound: true,
  vibration: true,
  vibrationStrength: 'soft',
  autoAdvance: false,
  readAloud: false,
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
      merge: (saved, current) => {
        const merged = { ...current, ...(saved as Partial<Settings>) };
        // Never trust an old or corrupted timer value.
        if (!(TIMER_OPTIONS as readonly number[]).includes(merged.timerSeconds))
          merged.timerSeconds = DEFAULT_SETTINGS.timerSeconds;
        if (!(AMBIENCE_OPTIONS as readonly string[]).includes(merged.ambience))
          merged.ambience = DEFAULT_SETTINGS.ambience;
        if (!(AMBIENCE_VOLUMES as readonly string[]).includes(merged.ambienceVolume))
          merged.ambienceVolume = DEFAULT_SETTINGS.ambienceVolume;
        if (typeof merged.readAloud !== 'boolean') merged.readAloud = DEFAULT_SETTINGS.readAloud;
        return merged;
      },
    },
  ),
);
