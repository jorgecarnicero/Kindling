import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Topic } from '@/data/types';

type FavoritesStore = {
  /** Topic ids, newest first. Ids are stable; never renumber topics in topics.json. */
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
};

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [id, ...s.ids] })),
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
    }),
    {
      name: 'kindling.favorites',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ ids }) => ({ ids }),
    },
  ),
);

/** True once saved favorites have loaded from device storage. */
export function useFavoritesHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useFavorites.persist.hasHydrated());
  useEffect(() => {
    if (useFavorites.persist.hasHydrated()) setHydrated(true);
    return useFavorites.persist.onFinishHydration(() => setHydrated(true));
  }, []);
  return hydrated;
}

/** Saved topics in saved order (newest first), skipping ids no longer in the bank. */
export function favoriteTopics(ids: readonly string[], all: readonly Topic[]): Topic[] {
  const byId = new Map(all.map((t) => [t.id, t]));
  return ids.map((id) => byId.get(id)).filter((t): t is Topic => t !== undefined);
}
