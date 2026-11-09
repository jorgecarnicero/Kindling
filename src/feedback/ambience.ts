import type { Ambience, AmbienceVolume } from '@/store/settings';
import type { Mode } from '@/theme';

/**
 * Player volume per setting. The fire file itself is mostly quiet with crackles on top,
 * so these sit higher than they look; it still never competes with talking.
 */
export const AMBIENCE_LEVEL: Record<AmbienceVolume, number> = { soft: 0.4, medium: 0.65, loud: 0.9 };

/** Whether the fire should be crackling for this setting and Day/Night mode. */
export function ambienceOn(pref: Ambience, mode: Mode): boolean {
  return pref === 'always' || (pref === 'night' && mode === 'night');
}
