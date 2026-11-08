import { CATEGORIES } from '@/data/types';
import { DEFAULT_SETTINGS } from '@/store/settings';
import { categoryColor, mix, palettes, playColors, resolveMode } from '..';

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
}

function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

describe('resolveMode', () => {
  it('auto follows the phone', () => {
    expect(resolveMode('auto', 'dark')).toBe('night');
    expect(resolveMode('auto', 'light')).toBe('day');
    expect(resolveMode('auto', null)).toBe('day');
  });

  it('a manual choice wins over the phone', () => {
    expect(resolveMode('night', 'light')).toBe('night');
    expect(resolveMode('day', 'dark')).toBe('day');
  });

  it('defaults to auto', () => {
    expect(DEFAULT_SETTINGS.appearance).toBe('auto');
  });
});

describe('mix', () => {
  it('blends between two colors', () => {
    expect(mix('#000000', '#FFFFFF', 0)).toBe('#000000');
    expect(mix('#000000', '#FFFFFF', 1)).toBe('#FFFFFF');
    expect(mix('#000000', '#FFFFFF', 0.5)).toBe('#808080');
  });
});

describe('category colors', () => {
  it('cover every category', () => {
    expect(Object.keys(categoryColor).sort()).toEqual([...CATEGORIES].sort());
  });
});

describe('contrast (WCAG AA, 4.5:1 for text)', () => {
  const modes = ['day', 'night'] as const;

  it.each(modes)('%s: body text is readable on screens and stickers', (m) => {
    const p = palettes[m];
    for (const bg of [p.background, p.surface, p.welcome]) {
      expect(contrast(p.text, bg)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast(p.textMuted, p.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(p.textMuted, p.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(modes)('%s: dark text is readable on every category color and on buttons', (m) => {
    const p = palettes[m];
    for (const c of CATEGORIES) {
      expect(contrast(p.onColor, categoryColor[c])).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast(p.onColor, p.accent)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(p.onColor, p.sunny)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(modes)('%s: play screens keep the hint readable', (m) => {
    const p = palettes[m];
    for (const c of CATEGORIES) {
      const pc = playColors(c, m, p);
      const hintColor = m === 'day' ? p.ink : p.textMuted;
      expect(contrast(hintColor, pc.screen)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(pc.chipText, pc.chip)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
