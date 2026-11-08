import { DEFAULT_DURATION_MS } from '@/timer/timer';

/**
 * Testing shortcut: how long each question lasts while developing.
 * Set to `null` to use the real 1 minute. Only applies in development builds
 * (Expo Go / `expo start`); release builds always use the real duration.
 */
const DEV_QUESTION_DURATION_MS: number | null = 5_000;

export const QUESTION_DURATION_MS =
  __DEV__ && DEV_QUESTION_DURATION_MS !== null ? DEV_QUESTION_DURATION_MS : DEFAULT_DURATION_MS;
