import { DEFAULT_LOOK, ITEMS, itemKey, findItem, NONE, OPTIONAL_SLOTS, SLOTS, type Item, type Look, type Slot, type Unlock } from './catalog';

/** What a person has done so far; unlocks are worked out from this, never stored. */
export type Progress = {
  /** Road trip themes finished at least once. */
  completedTrips: readonly string[];
  /** Different days the person has played. */
  daysPlayed: number;
};

export function isUnlocked(unlock: Unlock, p: Progress): boolean {
  switch (unlock.kind) {
    case 'free':
      return true;
    case 'trip':
      return p.completedTrips.includes(unlock.trip);
    case 'trips':
      return p.completedTrips.length >= unlock.count;
    case 'days':
      return p.daysPlayed >= unlock.count;
  }
}

/** Earned (not free) items that are now unlocked. */
export function earnedItems(p: Progress): Item[] {
  return ITEMS.filter((i) => i.unlock.kind !== 'free' && isUnlocked(i.unlock, p));
}

/** Earned items the person hasn't looked at yet (shown as "New"). */
export function newItems(p: Progress, seen: readonly string[]): Item[] {
  const s = new Set(seen);
  return earnedItems(p).filter((i) => !s.has(itemKey(i)));
}

/** How many items are unlocked, out of all of them ("none" choices don't count). */
export function foundCount(p: Progress): { found: number; total: number } {
  const real = ITEMS.filter((i) => i.id !== 'none');
  return { found: real.filter((i) => isUnlocked(i.unlock, p)).length, total: real.length };
}

/**
 * A look that only uses known, unlocked items: anything unknown or not (yet) owned falls
 * back to the default for that slot. Used when loading a saved look.
 */
export function sanitizeLook(look: Partial<Record<string, unknown>> | undefined, p: Progress): Look {
  const out = { ...DEFAULT_LOOK };
  for (const slot of SLOTS) {
    const id = look?.[slot];
    if (typeof id !== 'string') continue;
    const item = findItem(slot, id);
    if (item && isUnlocked(item.unlock, p)) out[slot] = id;
  }
  return out;
}

/** Local calendar day, e.g. "2026-11-10" (days played count the phone's own days). */
export function dayKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

/** Items that `after` unlocks and `before` didn't (e.g. what finishing a trip just earned). */
export function unlockedBetween(before: Progress, after: Progress): Item[] {
  return earnedItems(after).filter((i) => !isUnlocked(i.unlock, before));
}

/** A look with every given item put on (a later item in the same slot wins). */
export function wearingAll(look: Look, items: readonly Item[]): Look {
  const out = { ...look };
  for (const i of items) out[i.slot] = i.id;
  return out;
}

/**
 * A random look from what's owned (only the given slots change; the rest stay as in `base`). Optional slots (hat, glasses, hold) are left empty
 * about half the time so random characters don't all look overdressed.
 */
export function randomLook(
  p: Progress,
  base: Look = DEFAULT_LOOK,
  slots: readonly Slot[] = SLOTS,
  rand: () => number = Math.random,
): Look {
  const out = { ...base };
  for (const slot of slots) {
    const owned = ITEMS.filter((i) => i.slot === slot && i.id !== NONE && isUnlocked(i.unlock, p));
    const optional = OPTIONAL_SLOTS.includes(slot);
    if (optional && rand() < 0.5) out[slot] = NONE;
    else if (owned.length) out[slot] = owned[Math.floor(rand() * owned.length) % owned.length].id;
  }
  return out;
}
