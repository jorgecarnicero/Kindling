import { useCallback, useEffect } from 'react';
import { Platform, Vibration } from 'react-native';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useSettings, type VibrationStrength } from '@/store/settings';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const chime = require('../../assets/sounds/chime.wav');

let audioModeSet = false;

function warn(what: string, e: unknown) {
  if (__DEV__) console.warn(`[kindling] ${what} failed:`, e);
}

/**
 * Soft: expo-haptics notificationAsync (on Android it drives the vibrator directly; don't use
 * performAndroidHapticsAsync, which is silent when system touch feedback is off).
 * Strong: expo-haptics runs Android patterns at ~20% amplitude, so Android uses RN Vibration
 * (full amplitude); iOS uses two heavy impacts.
 */
function vibrate(strength: VibrationStrength) {
  if (strength === 'soft') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch((e) => warn('vibration', e));
  } else if (Platform.OS === 'android') {
    Vibration.vibrate([0, 180, 120, 260]);
  } else {
    const heavy = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch((e) => warn('vibration', e));
    heavy();
    setTimeout(heavy, 180);
  }
}

/**
 * Returns a function that plays the time's-up feedback per the user's settings.
 * The chime respects silent mode (no sound on silent or vibrate) and mixes with music.
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
    // Read at call time so a change in Settings applies immediately.
    const { sound, vibration, vibrationStrength } = useSettings.getState();
    if (__DEV__) console.log(`[kindling] time is up: vibration=${vibration && vibrationStrength} sound=${sound}`);
    if (vibration) vibrate(vibrationStrength);
    if (sound) {
      player
        .seekTo(0)
        .then(() => player.play())
        .catch((e) => warn('chime', e));
    }
  }, [player]);
}
