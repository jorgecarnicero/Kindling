import type { Category, Depth, Topic } from '@/data/types';
import { topics } from '@/data/topics';
import {
  advance,
  createDeck,
  currentTopic,
  isExhausted,
  mixIn,
  mixInOptions,
  remaining,
  reshuffle,
  shuffle,
} from '../deck';

const t = (id: string, category: Category, depth: Depth = 'light'): Topic => ({
  id,
  category,
  depth,
  groupSize: ['pair'],
  text: { en: id, es: id },
});

const sample = [
  t('a1', 'couples'),
  t('a2', 'couples'),
  t('a3', 'couples', 'deep'),
  t('b1', 'stories'),
  t('b2', 'stories', 'deep'),
  t('c1', 'family'),
];

function drawAll(deck: ReturnType<typeof createDeck>) {
  const ids: string[] = [];
  while (!isExhausted(deck)) {
    ids.push(currentTopic(deck)!.id);
    deck = advance(deck);
  }
  return { ids, deck };
}

describe('shuffle', () => {
  it('keeps every item exactly once and does not mutate input', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect([...out].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('createDeck', () => {
  it('with no filter draws every topic', () => {
    expect(drawAll(createDeck(sample, {})).ids.sort()).toEqual(sample.map((x) => x.id).sort());
  });

  it('filters by category and depth', () => {
    const { ids } = drawAll(createDeck(sample, { categories: ['couples'], depths: ['light'] }));
    expect(ids.sort()).toEqual(['a1', 'a2']);
  });

  it('is exhausted immediately when nothing matches', () => {
    const deck = createDeck(sample, { categories: ['team_building'] });
    expect(isExhausted(deck)).toBe(true);
    expect(currentTopic(deck)).toBeNull();
  });
});

describe('drawing', () => {
  it('never repeats a topic within a session', () => {
    const { ids } = drawAll(createDeck(sample, {}));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('counts remaining cards after the current one', () => {
    let deck = createDeck(sample, { categories: ['couples'] });
    expect(remaining(deck)).toBe(2);
    deck = advance(advance(deck));
    expect(remaining(deck)).toBe(0);
    deck = advance(deck);
    expect(remaining(deck)).toBe(0);
    expect(isExhausted(deck)).toBe(true);
  });

  it('advance is a no-op once exhausted', () => {
    const { deck } = drawAll(createDeck(sample, { categories: ['family'] }));
    expect(advance(deck)).toBe(deck);
  });
});

describe('when the deck runs out', () => {
  it('reshuffle starts over with the same filter', () => {
    const { deck } = drawAll(createDeck(sample, { categories: ['couples'] }));
    const again = reshuffle(deck, sample);
    expect(isExhausted(again)).toBe(false);
    expect(drawAll(again).ids.sort()).toEqual(['a1', 'a2', 'a3']);
  });

  it('offers only categories outside the filter that have topics at this depth', () => {
    const deck = createDeck(sample, { categories: ['couples'], depths: ['deep'] });
    expect(mixInOptions(deck, sample)).toEqual(['stories']);
  });

  it('offers nothing when already drawing from every category', () => {
    expect(mixInOptions(createDeck(sample, {}), sample)).toEqual([]);
  });

  it('mixIn continues the session with the new category only', () => {
    const { deck, ids: seen } = drawAll(createDeck(sample, { categories: ['couples'], depths: ['light'] }));
    const mixed = mixIn(deck, sample, 'stories');
    const { ids } = drawAll(mixed);
    expect(ids).toEqual(['b1']);
    expect(ids.some((id) => seen.includes(id))).toBe(false);
    expect(mixInOptions(mixed, sample)).toEqual(['family']);
  });
});

describe('topic bank', () => {
  it('loads and has unique ids', () => {
    expect(topics.length).toBeGreaterThan(0);
    expect(new Set(topics.map((x) => x.id)).size).toBe(topics.length);
  });
});
