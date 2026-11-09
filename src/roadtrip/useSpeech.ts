import { useCallback, useEffect } from 'react';
import * as Speech from 'expo-speech';
import type { Lang } from '@/data/types';
import { SPEECH_LOCALE, SPEECH_RATE } from './roadTrip';

/**
 * Reads lines aloud with the phone's own text-to-speech (offline, nothing leaves the phone).
 * Each call replaces whatever was being read. Stops when the screen closes.
 */
export function useSpeech(lang: Lang) {
  const stop = useCallback(() => {
    Speech.stop().catch(() => {});
  }, []);

  const say = useCallback(
    (lines: string[]) => {
      try {
        Speech.stop().catch(() => {});
        for (const text of lines) {
          Speech.speak(text, {
            language: SPEECH_LOCALE[lang],
            rate: SPEECH_RATE,
            // iOS: its own audio session, so the voice isn't muted by our silent-mode setting.
            useApplicationAudioSession: false,
          });
        }
      } catch (e) {
        if (__DEV__) console.warn('[kindling] speech failed:', e);
      }
    },
    [lang],
  );

  useEffect(() => stop, [stop]);

  return { say, stop };
}
