import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { useTheme } from '@/theme';
import { useSettings } from '@/store/settings';
import { AMBIENCE_LEVEL, ambienceOn } from './ambience';
import { ensureAudioMode } from './audioMode';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fire = require('../../assets/sounds/fire.wav');

const FADE_MS = 1200;
const FADE_STEPS = 15;

/**
 * Campfire ambience for the whole app. Mount once in the root layout.
 * Fades in/out on changes, pauses in the background, and follows the audio mode
 * (silent on silent/vibrate, mixes with the user's music).
 */
export function useAmbience() {
  const { mode } = useTheme();
  const pref = useSettings((s) => s.ambience);
  const level = useSettings((s) => s.ambienceVolume);
  const player = useAudioPlayer(fire);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setForeground(s === 'active'));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    ensureAudioMode();
    player.loop = true;
  }, [player]);

  const on = ambienceOn(pref, mode) && foreground;

  useEffect(() => {
    try {
      if (!foreground) {
        // Timers don't run reliably in the background: stop right away.
        player.pause();
        return;
      }
      const target = on ? AMBIENCE_LEVEL[level] : 0;
      if (on && !player.playing) {
        player.volume = 0;
        player.play();
      }
      const from = player.volume;
      let step = 0;
      const id = setInterval(() => {
        step += 1;
        player.volume = from + (target - from) * (step / FADE_STEPS);
        if (step >= FADE_STEPS) {
          clearInterval(id);
          if (target === 0) player.pause();
        }
      }, FADE_MS / FADE_STEPS);
      return () => clearInterval(id);
    } catch (e) {
      // Ambience is a nice-to-have; never let it break the app.
      if (__DEV__) console.warn('[kindling] ambience failed:', e);
    }
  }, [on, foreground, level, player]);
}
