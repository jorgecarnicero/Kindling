import { useCallback, useState } from 'react';
import { topics as allTopics } from '@/data/topics';
import type { Category, Topic } from '@/data/types';
import {
  advance,
  createDeck,
  currentTopic,
  isExhausted,
  mixIn,
  mixInOptions,
  remaining,
  reshuffle,
  type DeckFilter,
} from '@/deck/deck';

/**
 * Session deck for the Play screen. The filter is read once on mount; remount the
 * screen (or give it a new `key`) to start a session with a different filter.
 */
export function useTopicDeck(filter: DeckFilter, topics: readonly Topic[] = allTopics) {
  const [deck, setDeck] = useState(() => createDeck(topics, filter));

  const next = useCallback(() => setDeck((d) => advance(d)), []);
  const shuffleAgain = useCallback(() => setDeck((d) => reshuffle(d, topics)), [topics]);
  const addCategory = useCallback((c: Category) => setDeck((d) => mixIn(d, topics, c)), [topics]);

  return {
    current: currentTopic(deck),
    exhausted: isExhausted(deck),
    remaining: remaining(deck),
    mixInOptions: mixInOptions(deck, topics),
    next,
    shuffleAgain,
    addCategory,
  };
}
