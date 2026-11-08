/**
 * Countdown state as pure functions of wall-clock time (`now` in ms).
 * Nothing ticks: remaining time is computed from `endsAt` while running, so the timer
 * stays correct if JS is throttled or the app is backgrounded.
 */
export type TimerStatus = 'idle' | 'running' | 'paused' | 'done';

export type TimerState = {
  status: TimerStatus;
  /** Remaining time while idle/paused/done. Ignored while running (use endsAt). */
  remainingMs: number;
  /** When the countdown hits zero; set only while running. */
  endsAt: number | null;
  /** What a full ring represents: the remaining time at the last start or add. */
  baseMs: number;
  /** How many times time was added to this topic (feeds the session summary later). */
  extensions: number;
};

export const DEFAULT_DURATION_MS = 60_000;
export const ADD_TIME_MS = 60_000;

export function createTimer(durationMs: number = DEFAULT_DURATION_MS): TimerState {
  return { status: 'idle', remainingMs: durationMs, endsAt: null, baseMs: durationMs, extensions: 0 };
}

export function remainingAt(s: TimerState, now: number): number {
  return s.status === 'running' && s.endsAt !== null ? Math.max(0, s.endsAt - now) : s.remainingMs;
}

/** 1 = full ring, 0 = empty. */
export function progressAt(s: TimerState, now: number): number {
  return s.baseMs > 0 ? Math.min(1, remainingAt(s, now) / s.baseMs) : 0;
}

/** Start from idle, or resume from paused. */
export function start(s: TimerState, now: number): TimerState {
  if (s.status !== 'idle' && s.status !== 'paused') return s;
  if (s.remainingMs <= 0) return { ...s, status: 'done', remainingMs: 0 };
  return { ...s, status: 'running', endsAt: now + s.remainingMs };
}

export function pause(s: TimerState, now: number): TimerState {
  if (s.status !== 'running') return s;
  const remainingMs = remainingAt(s, now);
  if (remainingMs <= 0) return finish(s);
  return { ...s, status: 'paused', remainingMs, endsAt: null };
}

/** Pause if running, resume if paused; otherwise unchanged. */
export function toggle(s: TimerState, now: number): TimerState {
  return s.status === 'running' ? pause(s, now) : s.status === 'paused' ? start(s, now) : s;
}

/**
 * "+1 min": adds time and refills the ring. From `done` it keeps talking (running again);
 * from `paused` it stays paused; from `idle` it just lengthens the countdown.
 */
export function addTime(s: TimerState, now: number, ms: number = ADD_TIME_MS): TimerState {
  const remainingMs = remainingAt(s, now) + ms;
  const extensions = s.extensions + 1;
  if (s.status === 'running' || s.status === 'done') {
    return { status: 'running', remainingMs, endsAt: now + remainingMs, baseMs: remainingMs, extensions };
  }
  return { ...s, remainingMs, baseMs: remainingMs, extensions };
}

/** Move to `done` if time ran out. Call on a timeout or when the app returns to the foreground. */
export function tick(s: TimerState, now: number): TimerState {
  return s.status === 'running' && remainingAt(s, now) <= 0 ? finish(s) : s;
}

function finish(s: TimerState): TimerState {
  return { ...s, status: 'done', remainingMs: 0, endsAt: null };
}
