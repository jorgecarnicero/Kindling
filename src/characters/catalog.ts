import type { Localized } from '@/data/types';

/**
 * Everything a character can wear. Ids are saved on phones (what you wear, what you've
 * seen): never rename or reuse them. Drawings live in Character.tsx, keyed by id.
 */
export const SLOTS = ['skin', 'hair', 'hairColor', 'hoodie', 'hat', 'glasses', 'hold'] as const;
export type Slot = (typeof SLOTS)[number];

/** How an item is earned. Free items are there from the start. */
export type Unlock =
  | { kind: 'free' }
  /** Finish this Road trip theme. */
  | { kind: 'trip'; trip: string }
  /** Finish this many Road trip themes (any). */
  | { kind: 'trips'; count: number }
  /** Play on this many different days. */
  | { kind: 'days'; count: number };

export type Item = {
  id: string;
  slot: Slot;
  name: Localized<string>;
  /** Fill color for skin, hair color and hoodie items. */
  color?: string;
  unlock: Unlock;
};

const free: Unlock = { kind: 'free' };

/** Slots you can leave empty use this id ("No hat"). */
export const NONE = 'none';
export const OPTIONAL_SLOTS: readonly Slot[] = ['hat', 'glasses', 'hold'];

export const ITEMS: readonly Item[] = [
  // Skin tones: all free, always.
  { id: 'skin_1', slot: 'skin', name: { en: 'Tone 1', es: 'Tono 1' }, color: '#F9DCC4', unlock: free },
  { id: 'skin_2', slot: 'skin', name: { en: 'Tone 2', es: 'Tono 2' }, color: '#F1C29B', unlock: free },
  { id: 'skin_3', slot: 'skin', name: { en: 'Tone 3', es: 'Tono 3' }, color: '#E0A578', unlock: free },
  { id: 'skin_4', slot: 'skin', name: { en: 'Tone 4', es: 'Tono 4' }, color: '#C68A5E', unlock: free },
  { id: 'skin_5', slot: 'skin', name: { en: 'Tone 5', es: 'Tono 5' }, color: '#8D5A3B', unlock: free },
  { id: 'skin_6', slot: 'skin', name: { en: 'Tone 6', es: 'Tono 6' }, color: '#5E3A26', unlock: free },

  // Hair styles: all free.
  { id: 'hair_short', slot: 'hair', name: { en: 'Short', es: 'Corto' }, unlock: free },
  { id: 'hair_long', slot: 'hair', name: { en: 'Long', es: 'Largo' }, unlock: free },
  { id: 'hair_curly', slot: 'hair', name: { en: 'Curly', es: 'Rizado' }, unlock: free },
  { id: 'hair_buns', slot: 'hair', name: { en: 'Buns', es: 'Moños' }, unlock: free },
  { id: 'hair_buzz', slot: 'hair', name: { en: 'Buzz cut', es: 'Rapado' }, unlock: free },

  // Hair colors: natural ones free, bright ones earned.
  { id: 'hc_black', slot: 'hairColor', name: { en: 'Black', es: 'Negro' }, color: '#2A1A14', unlock: free },
  { id: 'hc_brown', slot: 'hairColor', name: { en: 'Brown', es: 'Castaño' }, color: '#5A3520', unlock: free },
  { id: 'hc_auburn', slot: 'hairColor', name: { en: 'Auburn', es: 'Cobrizo' }, color: '#8E3B1E', unlock: free },
  { id: 'hc_blond', slot: 'hairColor', name: { en: 'Blond', es: 'Rubio' }, color: '#E3A63B', unlock: free },
  { id: 'hc_gray', slot: 'hairColor', name: { en: 'Gray', es: 'Gris' }, color: '#B8B4C8', unlock: free },
  { id: 'hc_pink', slot: 'hairColor', name: { en: 'Pink', es: 'Rosa' }, color: '#FF8CC6', unlock: { kind: 'days', count: 7 } },
  { id: 'hc_green', slot: 'hairColor', name: { en: 'Green', es: 'Verde' }, color: '#6CD47E', unlock: { kind: 'trips', count: 3 } },
  { id: 'hc_blue', slot: 'hairColor', name: { en: 'Blue', es: 'Azul' }, color: '#5BB8FF', unlock: { kind: 'days', count: 30 } },

  // Hoodies: the six player colors free, patterns earned.
  { id: 'hd_orange', slot: 'hoodie', name: { en: 'Orange', es: 'Naranja' }, color: '#FF8A3D', unlock: free },
  { id: 'hd_yellow', slot: 'hoodie', name: { en: 'Yellow', es: 'Amarilla' }, color: '#FFC53D', unlock: free },
  { id: 'hd_green', slot: 'hoodie', name: { en: 'Green', es: 'Verde' }, color: '#6CD47E', unlock: free },
  { id: 'hd_blue', slot: 'hoodie', name: { en: 'Blue', es: 'Azul' }, color: '#5BB8FF', unlock: free },
  { id: 'hd_purple', slot: 'hoodie', name: { en: 'Purple', es: 'Morada' }, color: '#B18CFF', unlock: free },
  { id: 'hd_pink', slot: 'hoodie', name: { en: 'Pink', es: 'Rosa' }, color: '#FF8CC6', unlock: free },
  { id: 'hd_stripes', slot: 'hoodie', name: { en: 'Stripes', es: 'Rayas' }, color: '#FF6B7A', unlock: { kind: 'days', count: 3 } },
  { id: 'hd_flannel', slot: 'hoodie', name: { en: 'Flannel', es: 'Franela' }, color: '#D9534F', unlock: { kind: 'trips', count: 5 } },

  // Hats.
  { id: NONE, slot: 'hat', name: { en: 'No hat', es: 'Sin gorro' }, unlock: free },
  { id: 'hat_beanie', slot: 'hat', name: { en: 'Beanie', es: 'Gorro de lana' }, unlock: free },
  { id: 'hat_cap', slot: 'hat', name: { en: 'Cap', es: 'Gorra' }, unlock: free },
  { id: 'hat_bucket', slot: 'hat', name: { en: 'Bucket hat', es: 'Gorro de pescador' }, unlock: { kind: 'trips', count: 1 } },
  { id: 'hat_explorer', slot: 'hat', name: { en: 'Explorer hat', es: 'Sombrero de explorador' }, unlock: { kind: 'trip', trip: 'travel_stories' } },
  { id: 'hat_crown', slot: 'hat', name: { en: 'Paper crown', es: 'Corona de papel' }, unlock: { kind: 'trip', trip: 'childhood' } },
  { id: 'hat_party', slot: 'hat', name: { en: 'Party hat', es: 'Gorro de fiesta' }, unlock: { kind: 'days', count: 14 } },

  // Glasses.
  { id: NONE, slot: 'glasses', name: { en: 'No glasses', es: 'Sin gafas' }, unlock: free },
  { id: 'gl_round', slot: 'glasses', name: { en: 'Round', es: 'Redondas' }, unlock: free },
  { id: 'gl_sun', slot: 'glasses', name: { en: 'Sunglasses', es: 'Gafas de sol' }, unlock: { kind: 'trip', trip: 'cringe' } },
  { id: 'gl_heart', slot: 'glasses', name: { en: 'Heart glasses', es: 'Gafas de corazón' }, unlock: { kind: 'trip', trip: 'friendship' } },
  { id: 'gl_star', slot: 'glasses', name: { en: 'Star glasses', es: 'Gafas de estrella' }, unlock: { kind: 'trip', trip: 'dream_life' } },

  // Things to hold.
  { id: NONE, slot: 'hold', name: { en: 'Nothing', es: 'Nada' }, unlock: free },
  { id: 'hold_mug', slot: 'hold', name: { en: 'Mug', es: 'Taza' }, unlock: free },
  { id: 'hold_mallow', slot: 'hold', name: { en: 'Marshmallow', es: 'Malvavisco' }, unlock: { kind: 'trip', trip: 'food' } },
  { id: 'hold_guitar', slot: 'hold', name: { en: 'Guitar', es: 'Guitarra' }, unlock: { kind: 'trip', trip: 'school_days' } },
  { id: 'hold_lantern', slot: 'hold', name: { en: 'Lantern', es: 'Farol' }, unlock: { kind: 'trips', count: 7 } },
];

export type Look = Record<Slot, string>;

export const DEFAULT_LOOK: Look = {
  skin: 'skin_3',
  hair: 'hair_short',
  hairColor: 'hc_brown',
  hoodie: 'hd_orange',
  hat: NONE,
  glasses: NONE,
  hold: NONE,
};

/** Items of one slot, in catalog order. */
export function itemsFor(slot: Slot): Item[] {
  return ITEMS.filter((i) => i.slot === slot);
}

/** Look up an item; ids are only unique within a slot ("none" is in several). */
export function findItem(slot: Slot, id: string): Item | undefined {
  return ITEMS.find((i) => i.slot === slot && i.id === id);
}

/** A key unique across slots, for "seen" lists. */
export function itemKey(item: Pick<Item, 'slot' | 'id'>): string {
  return `${item.slot}:${item.id}`;
}

/** Fill color of a colored item, or a fallback when the id is unknown. */
export function colorOf(slot: Slot, id: string): string {
  return findItem(slot, id)?.color ?? findItem(slot, DEFAULT_LOOK[slot])?.color ?? '#999999';
}
