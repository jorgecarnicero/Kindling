import { LANGUAGES } from '@/data/types';
import { trips } from '@/roadtrip/roadTrip';
import { DEFAULT_LOOK, findItem, ITEMS, itemKey, NONE, OPTIONAL_SLOTS, SLOTS } from '../catalog';
import { dayKey, earnedItems, foundCount, isUnlocked, newItems, sanitizeLook, randomLook, unlockedBetween, wearingAll, type Progress } from '../unlocks';

const start: Progress = { completedTrips: [], daysPlayed: 0 };
const everything: Progress = { completedTrips: trips.map((t) => t.id), daysPlayed: 1000 };

describe('character catalog', () => {
  it('has unique ids within each slot', () => {
    const keys = ITEMS.map(itemKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('names every item in every language', () => {
    for (const item of ITEMS) for (const lang of LANGUAGES) expect(item.name[lang].trim()).not.toBe('');
  });

  it('gives colored slots a valid color', () => {
    for (const item of ITEMS.filter((i) => ['skin', 'hairColor', 'hoodie'].includes(i.slot)))
      expect(item.color).toMatch(/^#[0-9A-F]{6}$/);
  });

  it('has something free in every slot, and "none" in the optional ones', () => {
    for (const slot of SLOTS) expect(ITEMS.some((i) => i.slot === slot && i.unlock.kind === 'free')).toBe(true);
    for (const slot of OPTIONAL_SLOTS) expect(findItem(slot, NONE)?.unlock.kind).toBe('free');
  });

  it('keeps every skin tone and hair style free', () => {
    for (const item of ITEMS.filter((i) => i.slot === 'skin' || i.slot === 'hair')) expect(item.unlock.kind).toBe('free');
  });

  it('starts from a free default look', () => {
    for (const slot of SLOTS) expect(findItem(slot, DEFAULT_LOOK[slot])?.unlock.kind).toBe('free');
  });

  it('only unlocks with road trip themes that exist', () => {
    const ids = new Set(trips.map((t) => t.id));
    for (const item of ITEMS) if (item.unlock.kind === 'trip') expect(ids.has(item.unlock.trip)).toBe(true);
  });

  it('can unlock everything', () => {
    expect(foundCount(everything).found).toBe(foundCount(everything).total);
  });
});

describe('unlocks', () => {
  it('unlocks by trip, trip count and days played', () => {
    expect(isUnlocked({ kind: 'trip', trip: 'food' }, start)).toBe(false);
    expect(isUnlocked({ kind: 'trip', trip: 'food' }, { ...start, completedTrips: ['food'] })).toBe(true);
    expect(isUnlocked({ kind: 'trips', count: 1 }, { ...start, completedTrips: ['food'] })).toBe(true);
    expect(isUnlocked({ kind: 'trips', count: 3 }, { ...start, completedTrips: ['food'] })).toBe(false);
    expect(isUnlocked({ kind: 'days', count: 3 }, { ...start, daysPlayed: 3 })).toBe(true);
  });

  it('earns nothing at the start', () => {
    expect(earnedItems(start)).toEqual([]);
  });

  it('shows earned items as new until seen', () => {
    const p = { ...start, completedTrips: ['food'] };
    const keys = newItems(p, []).map(itemKey);
    expect(keys).toContain('hold:hold_mallow');
    expect(keys).toContain('hat:hat_bucket');
    expect(newItems(p, keys)).toEqual([]);
  });

  it('falls back to the default for unknown or locked items', () => {
    expect(sanitizeLook({ hat: 'hat_crown', skin: 'skin_9', hair: 42 }, start)).toEqual(DEFAULT_LOOK);
    expect(sanitizeLook({ hat: 'hat_crown' }, { ...start, completedTrips: ['childhood'] }).hat).toBe('hat_crown');
  });

  it('tells what finishing a trip just unlocked', () => {
    const before = { ...start, completedTrips: ['food', 'cringe'] };
    const after = { ...before, completedTrips: ['food', 'cringe', 'childhood'] };
    // 3 trips: the crown (Childhood) and green hair (3 trips); nothing already owned.
    expect(unlockedBetween(before, after).map(itemKey).sort()).toEqual(['hairColor:hc_green', 'hat:hat_crown']);
    expect(unlockedBetween(after, after)).toEqual([]);
  });

  it('previews found items on top of the current look', () => {
    const found = unlockedBetween(start, { ...start, completedTrips: ['food'] });
    const look = wearingAll(DEFAULT_LOOK, found);
    expect(look.hold).toBe('hold_mallow');
    expect(look.hat).toBe('hat_bucket');
    expect(look.skin).toBe(DEFAULT_LOOK.skin);
  });

  it('makes random looks only from owned items', () => {
    let seed = 1;
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    for (let n = 0; n < 200; n++) {
      const look = randomLook(start, DEFAULT_LOOK, SLOTS, rand);
      for (const slot of SLOTS) expect(findItem(slot, look[slot])?.unlock.kind).toBe('free');
    }
  });

  it('changes only the slots it is asked to', () => {
    const base = { ...DEFAULT_LOOK, hat: 'hat_cap' };
    const look = randomLook(start, base, ['skin', 'hair'], () => 0.99);
    expect(look.hat).toBe('hat_cap');
    expect(look.hoodie).toBe(base.hoodie);
    expect(look.skin).not.toBe(base.skin);
  });

  it('keys days by the local calendar date', () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});
