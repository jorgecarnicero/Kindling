import { setAudioModeAsync } from 'expo-audio';

let done = false;

/**
 * App-wide audio mode, set once: respect the phone's silent mode (no sound on silent or,
 * on Android, vibrate) and mix with the user's own music instead of pausing it.
 */
export function ensureAudioMode() {
  if (done) return;
  done = true;
  setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch((e) => {
    if (__DEV__) console.warn('[kindling] audio mode failed:', e);
  });
}
