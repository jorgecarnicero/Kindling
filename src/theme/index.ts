import { useColorScheme } from 'react-native';
import type { Category } from '@/data/types';
import { useSettings } from '@/store/settings';

/**
 * "Matchbox" sticker style with a campfire theme (mockups linked in CLAUDE.md).
 * Day = matchbox in sunlight; Night = the fire is lit.
 */
export type Mode = 'day' | 'night';

const day = {
  /** Behind most screens. */
  background: '#DCEBFF',
  /** The welcome screen's full-bleed color. */
  welcome: '#FF6B35',
  welcomeBlob: '#FF8A5C',
  /** Sticker paper: cards, rows, secondary buttons. */
  surface: '#FFFFFF',
  /** Outlines and solid offset shadows. */
  ink: '#1E1B3A',
  text: '#1E1B3A',
  textMuted: '#3D3870',
  /** Text on a category-colored or accent background. */
  onColor: '#1E1B3A',
  accent: '#FF6B35',
  sunny: '#FFD23F',
  /** Selected segment in a choice row. */
  selected: '#1E1B3A',
  onSelected: '#FFFFFF',
  logoBadge: '#FFD23F',
  logoLog: '#C9874A',
  logoCore: '#FFF8EE',
  playButton: '#FFF8EE',
  playIcon: '#1E1B3A',
  star: 'transparent',
  switchThumb: '#FFFFFF',
};

export type Colors = typeof day;

const night: Colors = {
  background: '#1B1A3A',
  welcome: '#1B1A3A',
  welcomeBlob: '#23224A',
  surface: '#2E2C5E',
  ink: '#0D0C22',
  text: '#FFF4E6',
  textMuted: '#C3BEE6',
  onColor: '#0D0C22',
  accent: '#FF8A3D',
  sunny: '#FFC857',
  selected: '#FFF4E6',
  onSelected: '#0D0C22',
  logoBadge: '#2E2752',
  logoLog: '#A86B3C',
  logoCore: '#FFC857',
  playButton: '#FF8A3D',
  playIcon: '#0D0C22',
  star: '#C3BEE6',
  switchThumb: '#FFF4E6',
};

export const palettes: Record<Mode, Colors> = { day, night };

/** One color per category, chosen for its meaning (same in both modes). */
export const categoryColor: Record<Category, string> = {
  get_to_know: '#FFC53D', // sunny: a first hello
  deep_talk: '#7C8BFF', // dusk blue: late-night talks
  random_facts: '#2CC7B4', // teal: curiosity
  stories: '#FF8A3D', // ember: tales around the fire
  would_you_rather: '#B18CFF', // violet: imagination
  light_debate: '#FF6B7A', // coral: a little heat
  couples: '#FF8CC6', // rose: affection
  family: '#6CD47E', // leaf: home, growing up
  team_building: '#5BB8FF', // sky: calm, work-friendly
  yours: '#E3B27D', // kindling wood: the sticks you bring yourself
};

/** Linear mix of two #RRGGBB colors; t = 0 → a, 1 → b. */
export function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => {
    const x = (pa >> shift) & 255;
    const y = (pb >> shift) & 255;
    return Math.round(x + (y - x) * t);
  };
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1).toUpperCase()}`;
}

/** Colors for the play screen of one category. */
export function playColors(category: Category, mode: Mode, colors: Colors) {
  const c = categoryColor[category];
  return mode === 'day'
    ? { screen: c, ring: colors.ink, track: mix(c, '#FFFFFF', 0.45), chip: colors.surface, chipText: colors.ink }
    : { screen: mix(c, colors.background, 0.8), ring: c, track: mix(c, colors.background, 0.65), chip: c, chipText: colors.onColor };
}

export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  displaySemi: 'BricolageGrotesque_600SemiBold',
  body: 'Figtree_500Medium',
  bodySemi: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

export const radius = { sm: 10, md: 14, lg: 18, xl: 28, pill: 999 };

/** Sticker outline width and offset-shadow distance. */
export const sticker = { border: 3, shadow: 5, shadowSmall: 3 };

export const fontSize = { small: 14, body: 17, title: 32, display: 60 };

/** Resolve Day/Night from the Appearance setting and the phone. */
export function resolveMode(pref: 'auto' | Mode, system: string | null | undefined): Mode {
  if (pref !== 'auto') return pref;
  return system === 'dark' ? 'night' : 'day';
}

export function useTheme() {
  const system = useColorScheme();
  const appearance = useSettings((s) => s.appearance);
  const mode = resolveMode(appearance, system);
  const colors = palettes[mode];
  return { mode, isDark: mode === 'night', colors, fonts, spacing, radius, sticker, fontSize };
}
