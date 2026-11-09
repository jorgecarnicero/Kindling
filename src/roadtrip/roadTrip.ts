import raw from '@/data/trips.json';
import type { Lang, Localized } from '@/data/types';

/** One stop on the road: a question, and a spark (a concrete way in) behind "Need a spark?". */
export type Stop = { text: Localized<string>; spark: Localized<string> };

/** One big theme for a ride: a road of stops, ordered from light to deep. */
export type Trip = {
  /** Permanent: may be saved on phones later (progress, favorites). Never reuse or rename. */
  id: string;
  /** Sticker color for the theme (from the category palette). */
  color: string;
  title: Localized<string>;
  intro: Localized<string>;
  stops: Stop[];
};

// Shape checked by src/roadtrip/__tests__/roadTrip.test.ts.
export const trips = raw as Trip[];

export function tripById(id: string | undefined): Trip | undefined {
  return trips.find((t) => t.id === id);
}

/** A random theme, never the one you just finished (when there's another). */
export function randomTrip(exceptId?: string, random: () => number = Math.random): Trip {
  const pool = trips.length > 1 ? trips.filter((t) => t.id !== exceptId) : trips;
  return pool[Math.floor(random() * pool.length)];
}

/** Stops are numbered 0..n-1; n means the end of the road. */
export function isEndOfRoad(trip: Trip, stop: number): boolean {
  return stop >= trip.stops.length;
}

export function clampStop(trip: Trip, stop: number): number {
  return Math.max(0, Math.min(trip.stops.length, Math.floor(stop)));
}

/** Voice locale per app language (the phone picks a matching installed voice). */
export const SPEECH_LOCALE: Record<Lang, string> = { en: 'en-US', es: 'es-ES' };

/** Slightly slower than normal: easier to follow over road noise. */
export const SPEECH_RATE = 0.95;

type Labels = { stop: (n: number) => string; end: string };

/** What the voice reads when someone opens a stop's spark. */
export function sparkScript(trip: Trip, stop: number, lang: Lang, leadIn: string): string[] {
  const spark = trip.stops[stop]?.spark[lang]?.trim();
  return spark ? [`${leadIn} ${spark}`] : [];
}

/**
 * What the voice reads at a stop. The first stop also announces the theme and its intro,
 * so the car knows what the ride is about.
 */
export function stopScript(trip: Trip, stop: number, lang: Lang, labels: Labels): string[] {
  if (isEndOfRoad(trip, stop)) return [labels.end];
  const lines = [`${labels.stop(stop + 1)}. ${trip.stops[stop].text[lang]}`];
  return stop === 0 ? [`${trip.title[lang]}. ${trip.intro[lang]}`, ...lines] : lines;
}
