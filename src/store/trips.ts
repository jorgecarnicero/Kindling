import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { trips } from '@/roadtrip/roadTrip';

type TripsStore = {
  /** Ids of road trip themes driven to the end of the road at least once. */
  completed: string[];
  markCompleted: (id: string) => void;
};

export const useTrips = create<TripsStore>()(
  persist(
    (set) => ({
      completed: [],
      markCompleted: (id) => set((s) => (s.completed.includes(id) ? s : { completed: [...s.completed, id] })),
    }),
    {
      name: 'kindling.trips',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ completed }) => ({ completed }),
      // Keep only ids of themes that still exist.
      merge: (saved, current) => {
        const s = (saved ?? {}) as Partial<{ completed: unknown }>;
        const known = new Set(trips.map((t) => t.id));
        const completed = Array.isArray(s.completed)
          ? [...new Set(s.completed.filter((id): id is string => typeof id === 'string' && known.has(id)))]
          : current.completed;
        return { ...current, completed };
      },
    },
  ),
);
