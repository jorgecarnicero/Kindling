/**
 * Testing shortcut: force every topic to last this long while developing (e.g. 5_000).
 * `null` = use the length chosen in Settings. Only applies in development builds
 * (Expo Go / `expo start`); release builds always use the Settings value.
 */
const DEV_QUESTION_DURATION_MS: number | null = null;

/** Topic length in ms for a Settings value in seconds (0 = timer off → 0). */
export function questionDurationMs(timerSeconds: number): number {
  if (timerSeconds <= 0) return 0;
  return __DEV__ && DEV_QUESTION_DURATION_MS !== null ? DEV_QUESTION_DURATION_MS : timerSeconds * 1000;
}
