import { LANGUAGES } from '@/data/types';
import { categoryColor } from '@/theme';
import { clampStop, isEndOfRoad, randomTrip, sparkScript, stopScript, tripById, trips } from '../roadTrip';

const labels = { stop: (n: number) => `Stop ${n}`, end: 'The end' };

describe('trip bank', () => {
  it('has unique, stable-looking ids', () => {
    const ids = trips.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z][a-z0-9_]*$/);
  });

  it.each(trips.map((t) => [t.id, t] as const))('%s has 8 stops, each with a question and a spark in every language', (_, trip) => {
    expect(trip.stops).toHaveLength(8);
    for (const l of LANGUAGES) {
      expect(trip.title[l]?.trim()).toBeTruthy();
      expect(trip.intro[l]?.trim()).toBeTruthy();
      for (const s of trip.stops) {
        expect(s.text[l]?.trim()).toBeTruthy();
        expect(s.spark[l]?.trim()).toBeTruthy();
        expect(s.spark[l]).not.toBe(s.text[l]);
      }
    }
  });

  it('uses colors from the category palette (so text contrast is already checked)', () => {
    const palette = Object.values(categoryColor);
    for (const trip of trips) expect(palette).toContain(trip.color);
  });

  it('has no repeated stop in a theme', () => {
    for (const trip of trips) expect(new Set(trip.stops.map((s) => s.text.en)).size).toBe(trip.stops.length);
  });
});

describe('the road', () => {
  const trip = trips[0];

  it('finds a trip by id, or nothing', () => {
    expect(tripById(trip.id)).toBe(trip);
    expect(tripById('nope')).toBeUndefined();
    expect(tripById(undefined)).toBeUndefined();
  });

  it('ends after the last stop', () => {
    expect(isEndOfRoad(trip, 7)).toBe(false);
    expect(isEndOfRoad(trip, 8)).toBe(true);
  });

  it('keeps the stop on the road', () => {
    expect(clampStop(trip, -1)).toBe(0);
    expect(clampStop(trip, 3)).toBe(3);
    expect(clampStop(trip, 99)).toBe(8);
  });

  it('never deals the theme you just finished', () => {
    for (const r of [0, 0.3, 0.6, 0.99]) expect(randomTrip(trip.id, () => r).id).not.toBe(trip.id);
  });
});

describe('stopScript', () => {
  const trip = trips[0];

  it('announces the theme at the first stop', () => {
    expect(stopScript(trip, 0, 'en', labels)).toEqual([
      `${trip.title.en}. ${trip.intro.en}`,
      `Stop 1. ${trip.stops[0].text.en}`,
    ]);
  });

  it('reads later stops alone, in the chosen language', () => {
    expect(stopScript(trip, 2, 'es', labels)).toEqual([`Stop 3. ${trip.stops[2].text.es}`]);
  });

  it('says the end of the road', () => {
    expect(stopScript(trip, 8, 'en', labels)).toEqual(['The end']);
  });
});

describe('sparkScript', () => {
  it('reads the spark with its lead-in', () => {
    const trip = trips[0];
    expect(sparkScript(trip, 1, 'en', 'A way in:')).toEqual([`A way in: ${trip.stops[1].spark.en}`]);
    expect(sparkScript(trip, 99, 'en', 'A way in:')).toEqual([]);
  });
});
