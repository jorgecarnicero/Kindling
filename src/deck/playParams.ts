import { CATEGORIES, DEPTHS, type Category, type Depth } from '@/data/types';
import type { DeckFilter } from './deck';

/** "Up to" depth: Light = light; Medium = light + medium; Deep = everything. */
export function depthsUpTo(max: Depth): Depth[] {
  return DEPTHS.slice(0, DEPTHS.indexOf(max) + 1);
}

/** Route params for /play (all strings, as Expo Router passes them). */
export type PlayParams = {
  source?: string; // 'favorites' | 'surprise' | undefined (= use the filter below)
  categories?: string; // comma-separated category ids; empty/missing = all
  depth?: string; // max depth
};

export function buildPlayParams(categories: readonly Category[], maxDepth: Depth): PlayParams {
  return { categories: categories.join(','), depth: maxDepth };
}

export type PlaySetup = { source: 'bank' | 'favorites'; filter: DeckFilter };

/** Turns route params into a deck setup; unknown values are ignored rather than trusted. */
export function parsePlayParams(p: PlayParams): PlaySetup {
  if (p.source === 'favorites') return { source: 'favorites', filter: {} };
  if (p.source === 'surprise') return { source: 'bank', filter: {} };

  const categories = (p.categories ?? '')
    .split(',')
    .filter((c): c is Category => (CATEGORIES as readonly string[]).includes(c));
  const depth = (DEPTHS as readonly string[]).includes(p.depth ?? '') ? (p.depth as Depth) : undefined;

  return {
    source: 'bank',
    filter: {
      ...(categories.length ? { categories } : {}),
      ...(depth ? { depths: depthsUpTo(depth) } : {}),
    },
  };
}
