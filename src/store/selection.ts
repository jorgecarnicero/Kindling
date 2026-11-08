import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { CATEGORIES, DEPTHS, type Category, type Depth } from '@/data/types';

/** Home's category + depth choice, remembered between sessions. */
type SelectionStore = {
  /** Empty = all categories. Kept in CATEGORIES order. */
  categories: Category[];
  maxDepth: Depth;
  toggleCategory: (c: Category) => void;
  clearCategories: () => void;
  setMaxDepth: (d: Depth) => void;
};

export const DEFAULT_MAX_DEPTH: Depth = 'light';

export const useSelection = create<SelectionStore>()(
  persist(
    (set) => ({
      categories: [],
      maxDepth: DEFAULT_MAX_DEPTH,
      toggleCategory: (c) =>
        set((s) => {
          const next = s.categories.includes(c) ? s.categories.filter((x) => x !== c) : [...s.categories, c];
          return { categories: CATEGORIES.filter((x) => next.includes(x)) };
        }),
      clearCategories: () => set({ categories: [] }),
      setMaxDepth: (maxDepth) => set({ maxDepth }),
    }),
    {
      name: 'kindling.selection',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ categories, maxDepth }) => ({ categories, maxDepth }),
      // Drop anything no longer valid (e.g. a renamed category) instead of trusting old saves.
      merge: (saved, current) => {
        const s = (saved ?? {}) as Partial<{ categories: unknown; maxDepth: unknown }>;
        const categories = Array.isArray(s.categories)
          ? CATEGORIES.filter((c) => (s.categories as unknown[]).includes(c))
          : current.categories;
        const maxDepth = (DEPTHS as readonly unknown[]).includes(s.maxDepth) ? (s.maxDepth as Depth) : current.maxDepth;
        return { ...current, categories, maxDepth };
      },
    },
  ),
);
