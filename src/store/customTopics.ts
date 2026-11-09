import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Topic } from '@/data/types';

/** A topic someone wrote. One text for every language: it's theirs, in their words. */
export type CustomTopic = {
  id: string;
  text: string;
  starter?: string;
  followUp?: string;
  createdAt: number;
};

export type CustomTopicInput = { text: string; starter?: string; followUp?: string };

export const LIMITS = { text: 200, starter: 140, followUp: 140 };

/** Trims, drops empty optional fields and enforces the length limits. Null = no question. */
export function cleanInput(input: CustomTopicInput): CustomTopicInput | null {
  const text = input.text.trim().slice(0, LIMITS.text);
  if (!text) return null;
  const starter = input.starter?.trim().slice(0, LIMITS.starter);
  const followUp = input.followUp?.trim().slice(0, LIMITS.followUp);
  return { text, ...(starter ? { starter } : {}), ...(followUp ? { followUp } : {}) };
}

function newId(now: number): string {
  return `own-${now.toString(36)}${Math.floor(Math.random() * 1296)
    .toString(36)
    .padStart(2, '0')}`;
}

type Store = {
  /** Newest first. */
  topics: CustomTopic[];
  add: (input: CustomTopicInput) => CustomTopic | null;
  update: (id: string, input: CustomTopicInput) => void;
  remove: (id: string) => void;
};

export const useCustomTopics = create<Store>()(
  persist(
    (set) => ({
      topics: [],
      add: (input) => {
        const clean = cleanInput(input);
        if (!clean) return null;
        const now = Date.now();
        const topic: CustomTopic = { id: newId(now), createdAt: now, ...clean };
        set((s) => ({ topics: [topic, ...s.topics] }));
        return topic;
      },
      update: (id, input) => {
        const clean = cleanInput(input);
        if (!clean) return;
        set((s) => ({
          topics: s.topics.map((t) => (t.id === id ? { id: t.id, createdAt: t.createdAt, ...clean } : t)),
        }));
      },
      remove: (id) => set((s) => ({ topics: s.topics.filter((t) => t.id !== id) })),
    }),
    {
      name: 'kindling.customTopics',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ topics }) => ({ topics }),
      // Keep only well-formed entries from storage.
      merge: (saved, current) => {
        const list = (saved as { topics?: unknown })?.topics;
        const topics = Array.isArray(list)
          ? list.filter(
              (t): t is CustomTopic =>
                !!t && typeof t.id === 'string' && typeof t.text === 'string' && t.text.trim() !== '',
            )
          : [];
        return { ...current, topics };
      },
    },
  ),
);

/** A custom topic shaped like a bank topic, so the deck, card and favorites can use it. */
export function toTopic(t: CustomTopic): Topic {
  return {
    id: t.id,
    category: 'yours',
    depth: 'light',
    groupSize: ['pair', 'small', 'party'],
    text: { en: t.text, es: t.text },
    ...(t.starter ? { starter: { en: t.starter, es: t.starter } } : {}),
    ...(t.followUp ? { followUps: { en: [t.followUp], es: [t.followUp] } } : {}),
  };
}

/** Bank topics plus your own, for building decks and resolving favorites. */
export function useAllTopics(bank: readonly Topic[]): Topic[] {
  const custom = useCustomTopics((s) => s.topics);
  return [...bank, ...custom.map(toTopic)];
}

/** True once saved custom topics have loaded from device storage. */
export function useCustomTopicsHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useCustomTopics.persist.hasHydrated());
  useEffect(() => {
    if (useCustomTopics.persist.hasHydrated()) setHydrated(true);
    return useCustomTopics.persist.onFinishHydration(() => setHydrated(true));
  }, []);
  return hydrated;
}
