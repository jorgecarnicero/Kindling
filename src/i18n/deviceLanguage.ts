import { LANGUAGES, type Lang } from '@/data/types';

/**
 * Temporary: picks the topic language from the phone's locale (EN fallback).
 * Step 5 replaces this with i18next + a manual EN/ES choice in Settings.
 */
export function deviceLanguage(): Lang {
  try {
    const code = Intl.DateTimeFormat().resolvedOptions().locale.slice(0, 2).toLowerCase();
    return (LANGUAGES as readonly string[]).includes(code) ? (code as Lang) : 'en';
  } catch {
    return 'en';
  }
}
