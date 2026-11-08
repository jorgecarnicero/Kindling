import { useEffect } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales, useLocales } from 'expo-localization';
import { LANGUAGES, type Lang } from '@/data/types';
import { useSettings, type LanguagePref } from '@/store/settings';
import en from './en.json';
import es from './es.json';

// To add a language: add its code to LANGUAGES (src/data/types.ts), add a <code>.json
// here with the same keys as en.json, and add topic texts for it.
const resources = { en: { translation: en }, es: { translation: es } } satisfies Record<Lang, unknown>;

/** The language to show: the user's choice, else the phone's first language we support, else English. */
export function resolveLanguage(pref: LanguagePref, deviceCodes: readonly (string | null | undefined)[]): Lang {
  if (pref !== 'system') return pref;
  for (const code of deviceCodes) {
    const c = code?.toLowerCase();
    if (c && (LANGUAGES as readonly string[]).includes(c)) return c as Lang;
  }
  return 'en';
}

i18n.use(initReactI18next).init({
  resources,
  lng: resolveLanguage('system', getLocales().map((l) => l.languageCode)),
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React already escapes
  returnNull: false,
});

/** Current app language; follows the Settings choice and live phone-language changes. */
export function useAppLanguage(): Lang {
  const pref = useSettings((s) => s.language);
  const locales = useLocales();
  return resolveLanguage(
    pref,
    locales.map((l) => l.languageCode),
  );
}

/** Mount once near the root: keeps i18next in sync with useAppLanguage. */
export function useSyncI18nLanguage() {
  const lang = useAppLanguage();
  useEffect(() => {
    if (i18n.language !== lang) i18n.changeLanguage(lang);
  }, [lang]);
  return lang;
}

export default i18n;
