import { CATEGORIES, type Category, type Depth, type Lang, type Topic } from '@/data/types';

/**
 * Follow-up to show after `extensions` "+1 min" taps: none before the first,
 * then each follow-up in order, cycling if time keeps being added.
 */
export function followUpFor(topic: Topic, lang: Lang, extensions: number): string | undefined {
  const list = topic.followUps?.[lang];
  if (!list?.length || extensions <= 0) return undefined;
  return list[(extensions - 1) % list.length];
}

/** Empty or missing list = no restriction (the "Random" button). */
export type DeckFilter = { categories?: Category[]; depths?: Depth[] };

/**
 * A session's draw order. `order[position]` is the current card; everything before it
 * has been seen this session. `position === order.length` means the deck is exhausted.
 */
export type Deck = {
  filter: DeckFilter;
  order: Topic[];
  position: number;
};

type Random = () => number;

export function matches(topic: Topic, filter: DeckFilter): boolean {
  const { categories, depths } = filter;
  if (categories?.length && !categories.includes(topic.category)) return false;
  if (depths?.length && !depths.includes(topic.depth)) return false;
  return true;
}

/** Fisher–Yates; returns a new array. */
export function shuffle<T>(items: readonly T[], random: Random = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function createDeck(all: readonly Topic[], filter: DeckFilter, random?: Random): Deck {
  return { filter, order: shuffle(all.filter((t) => matches(t, filter)), random), position: 0 };
}

export function currentTopic(deck: Deck): Topic | null {
  return deck.order[deck.position] ?? null;
}

export function isExhausted(deck: Deck): boolean {
  return deck.position >= deck.order.length;
}

export function remaining(deck: Deck): number {
  return Math.max(0, deck.order.length - deck.position - 1);
}

/** Next / Skip: move to the following card. No-op once exhausted. */
export function advance(deck: Deck): Deck {
  return isExhausted(deck) ? deck : { ...deck, position: deck.position + 1 };
}

/** "Shuffle again": start over with the same filter; repeats are now allowed. */
export function reshuffle(deck: Deck, all: readonly Topic[], random?: Random): Deck {
  return createDeck(all, deck.filter, random);
}

/** Categories that could be added to this deck and would bring at least one new topic. */
export function mixInOptions(deck: Deck, all: readonly Topic[]): Category[] {
  const current = deck.filter.categories;
  if (!current?.length) return []; // already drawing from every category
  return CATEGORIES.filter(
    (c) => !current.includes(c) && all.some((t) => t.category === c && matches(t, { depths: deck.filter.depths })),
  );
}

/** "Mix in another category": queue that category's topics (same depth filter) after the current position. */
export function mixIn(deck: Deck, all: readonly Topic[], category: Category, random?: Random): Deck {
  const current = deck.filter.categories;
  if (!current?.length || current.includes(category)) return deck;
  const filter = { ...deck.filter, categories: [...current, category] };
  const added = all.filter((t) => t.category === category && matches(t, filter));
  return { filter, order: [...deck.order, ...shuffle(added, random)], position: deck.position };
}
