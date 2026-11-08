import { LANGUAGES } from '@/data/types';
import { topics } from '@/data/topics';
import { CATEGORIES, DEPTHS } from '@/data/types';
import { resolveLanguage } from '..';
import en from '../en.json';
import es from '../es.json';

const files: Record<string, unknown> = { en, es };

function keys(obj: unknown, prefix = ''): string[] {
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    v && typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe('resolveLanguage', () => {
  it('uses the manual choice when set', () => {
    expect(resolveLanguage('es', ['en'])).toBe('es');
    expect(resolveLanguage('en', ['es'])).toBe('en');
  });

  it('follows the phone: first supported language wins', () => {
    expect(resolveLanguage('system', ['es'])).toBe('es');
    expect(resolveLanguage('system', ['fr', 'es', 'en'])).toBe('es');
    expect(resolveLanguage('system', ['ES'])).toBe('es');
  });

  it('falls back to English', () => {
    expect(resolveLanguage('system', ['fr', null, undefined])).toBe('en');
    expect(resolveLanguage('system', [])).toBe('en');
  });
});

describe('translation files', () => {
  it('exist for every supported language', () => {
    expect(Object.keys(files).sort()).toEqual([...LANGUAGES].sort());
  });

  it.each(LANGUAGES.filter((l) => l !== 'en'))('%s has exactly the same keys as en', (lang) => {
    expect(keys(files[lang]).sort()).toEqual(keys(en).sort());
  });

  it.each([...LANGUAGES])('%s has no empty strings', (lang) => {
    const empty = keys(files[lang]).filter((k) => {
      const v = k.split('.').reduce<unknown>((o, p) => (o as Record<string, unknown>)[p], files[lang]);
      return typeof v !== 'string' || !v.trim();
    });
    expect(empty).toEqual([]);
  });

  it('label every category and depth', () => {
    for (const c of CATEGORIES) expect(en.category).toHaveProperty(c);
    for (const d of DEPTHS) expect(en.depth).toHaveProperty(d);
  });

  it('every topic has text in every supported language', () => {
    const missing = topics.filter((t) => LANGUAGES.some((l) => !t.text[l]?.trim())).map((t) => t.id);
    expect(missing).toEqual([]);
  });

  it('every topic has a spark starter in every supported language', () => {
    const missing = topics.filter((t) => LANGUAGES.some((l) => !t.starter?.[l]?.trim())).map((t) => t.id);
    expect(missing).toEqual([]);
  });
});
