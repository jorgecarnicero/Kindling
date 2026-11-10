import { useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_LOOK, findItem, SLOTS, type Look, type Slot } from '@/characters/catalog';
import { dayKey, isUnlocked, sanitizeLook, type Progress } from '@/characters/unlocks';
import { useTrips } from './trips';

/**
 * The phone owner's character: one phone = one person. Saved on the phone for now under a
 * random profile id, so it can later move to an account without starting over.
 */
type ProfileData = {
  id: string;
  look: Look;
  /** Item keys ("hat:hat_bucket") already looked at in the backpack, so they're no longer "New". */
  seen: string[];
  /** Different days played (counted once per calendar day). */
  daysPlayed: number;
  lastDay: string | null;
  /** The owner has made their character (the first-time "Make your character" step is done). */
  created: boolean;
};

type ProfileStore = ProfileData & {
  /** Put on an item (only known items the owner has unlocked). */
  wear: (slot: Slot, id: string) => void;
  /** Replace the whole look (locked or unknown items fall back to the default). */
  setLook: (look: Look) => void;
  finishSetup: () => void;
  /** Count today as a day played (no-op if already counted). */
  recordDay: (date?: Date) => void;
  markSeen: (keys: readonly string[]) => void;
};

function newId(): string {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useProfile = create<ProfileStore>()(
  persist(
    (set) => ({
      id: newId(),
      look: DEFAULT_LOOK,
      seen: [],
      daysPlayed: 0,
      lastDay: null,
      created: false,
      wear: (slot, id) =>
        set((s) => {
          const item = findItem(slot, id);
          if (!item || s.look[slot] === id || !isUnlocked(item.unlock, currentProgress())) return s;
          return { look: { ...s.look, [slot]: id } };
        }),
      setLook: (look) => set({ look: sanitizeLook(look, currentProgress()) }),
      finishSetup: () => set({ created: true }),
      recordDay: (date = new Date()) =>
        set((s) => {
          const today = dayKey(date);
          return s.lastDay === today ? s : { lastDay: today, daysPlayed: s.daysPlayed + 1 };
        }),
      markSeen: (keys) =>
        set((s) => {
          const fresh = keys.filter((k) => !s.seen.includes(k));
          return fresh.length ? { seen: [...s.seen, ...fresh] } : s;
        }),
    }),
    {
      name: 'kindling.profile',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ id, look, seen, daysPlayed, lastDay, created }) => ({ id, look, seen, daysPlayed, lastDay, created }),
      // Never trust a saved value: unknown items fall back to the default look.
      merge: (saved, current) => {
        const s = (saved ?? {}) as Partial<Record<keyof ProfileData, unknown>>;
        const savedLook = (s.look && typeof s.look === 'object' ? s.look : {}) as Record<string, unknown>;
        const look = { ...DEFAULT_LOOK };
        for (const slot of SLOTS) {
          const id = savedLook[slot];
          if (typeof id === 'string' && findItem(slot, id)) look[slot] = id;
        }
        return {
          ...current,
          id: typeof s.id === 'string' && s.id ? s.id : current.id,
          look,
          seen: Array.isArray(s.seen) ? [...new Set(s.seen.filter((k): k is string => typeof k === 'string'))] : [],
          daysPlayed:
            typeof s.daysPlayed === 'number' && Number.isFinite(s.daysPlayed) && s.daysPlayed >= 0
              ? Math.floor(s.daysPlayed)
              : 0,
          lastDay: typeof s.lastDay === 'string' ? s.lastDay : null,
          created: s.created === true,
        };
      },
    },
  ),
);

function currentProgress(): Progress {
  return { completedTrips: useTrips.getState().completed, daysPlayed: useProfile.getState().daysPlayed };
}

/**
 * Count today as a day played, once the saved profile has loaded (counting before that would
 * be overwritten by the saved count).
 */
export function recordPlayDay(date: Date = new Date()): void {
  const run = () => {
    useProfile.getState().recordDay(date);
  };
  if (useProfile.persist.hasHydrated()) {
    run();
    return;
  }
  const unsub = useProfile.persist.onFinishHydration(() => {
    unsub();
    run();
  });
}

/** The look to draw: anything not (or no longer) unlocked shows as the default. */
export function useLook(): Look {
  const look = useProfile((s) => s.look);
  const progress = useProgress();
  return useMemo(() => sanitizeLook(look, progress), [look, progress]);
}

/** What unlocks are worked out from: finished trips and days played. */
export function useProgress(): Progress {
  const completedTrips = useTrips((s) => s.completed);
  const daysPlayed = useProfile((s) => s.daysPlayed);
  return useMemo(() => ({ completedTrips, daysPlayed }), [completedTrips, daysPlayed]);
}
