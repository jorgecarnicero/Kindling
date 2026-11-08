import { useCallback, useEffect } from 'react';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const chime = require('../../assets/sounds/chime.wav');

let audioModeSet = false;

function warn(what: string, e: unknown) {
  if (__DEV__) console.warn(`[kindling] ${what} failed:`, e);
}

/**
 * Soft vibration. Uses notificationAsync on every platform: on Android it drives the
 * vibrator directly. (performAndroidHapticsAsync goes through the system "touch feedback"
 * setting and does nothing when that is off or on Android < 11.)
 */
function softVibration() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch((e) => warn('vibration', e));
}

/**
 * Returns a function that plays the time's-up feedback: a soft vibration and the chime.
 * The chime respects silent mode: no sound when the phone is on silent or vibrate
 * (iOS switch / Android ringer mode). It mixes with music instead of pausing it.
 * Sound/vibration toggles arrive with Settings (step 5).
 */
export function useTimesUpFeedback() {
  const player = useAudioPlayer(chime);

  useEffect(() => {
    if (audioModeSet) return;
    audioModeSet = true;
    setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch((e) =>
      warn('audio mode', e),
    );
  }, []);

  return useCallback(() => {
    if (__DEV__) console.log('[kindling] time is up: vibration + chime');
    softVibration();
    // Rewind first (it ended at the last play), then play once the seek has landed.
    player
      .seekTo(0)
      .then(() => player.play())
      .catch((e) => warn('chime', e));
  }, [player]);
}
