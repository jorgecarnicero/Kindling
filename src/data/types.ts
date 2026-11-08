// Keep these lists in sync with scripts/validate_topics.py.
export const CATEGORIES = [
  'get_to_know',
  'deep_talk',
  'random_facts',
  'stories',
  'would_you_rather',
  'light_debate',
  'couples',
  'family',
  'team_building',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const DEPTHS = ['light', 'medium', 'deep'] as const;
export type Depth = (typeof DEPTHS)[number];

export const GROUP_SIZES = ['pair', 'small', 'party'] as const;
export type GroupSize = (typeof GROUP_SIZES)[number];

export const LANGUAGES = ['en', 'es'] as const;
export type Lang = (typeof LANGUAGES)[number];

export type Localized<T> = Record<Lang, T>;

export type Topic = {
  id: string;
  category: Category;
  depth: Depth;
  groupSize: GroupSize[];
  text: Localized<string>;
  /** Shown only when someone adds time. */
  followUps?: Localized<string[]>;
};
