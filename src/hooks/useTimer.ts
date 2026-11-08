import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  addTime,
  createTimer,
  DEFAULT_DURATION_MS,
  pause,
  remainingAt,
  start,
  tick,
  toggle,
} from '@/timer/timer';

type Options = {
  autoStart?: boolean;
  onDone?: () => void;
  /** false = timer off: stays idle, never fires onDone (cards-only mode). */
  enabled?: boolean;
};

/** Countdown for one topic. Call `reset()` when a new card is drawn. */
export function useTimer(
  durationMs: number = DEFAULT_DURATION_MS,
  { autoStart = true, onDone, enabled = true }: Options = {},
) {
  const run = autoStart && enabled && durationMs > 0;
  const [state, setState] = useState(() => {
    const t = createTimer(durationMs);
    return run ? start(t, Date.now()) : t;
  });

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Wake up exactly when time runs out.
  useEffect(() => {
    if (state.status !== 'running') return;
    const id = setTimeout(() => setState((s) => tick(s, Date.now())), remainingAt(state, Date.now()));
    return () => clearTimeout(id);
  }, [state]);

  // Timeouts can be delayed while backgrounded; re-check on return.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') setState((s) => tick(s, Date.now()));
    });
    return () => sub.remove();
  }, []);

  const prevStatus = useRef(state.status);
  useEffect(() => {
    if (state.status === 'done' && prevStatus.current !== 'done') onDoneRef.current?.();
    prevStatus.current = state.status;
  }, [state.status]);

  return {
    state,
    status: state.status,
    extensions: state.extensions,
    pause: useCallback(() => setState((s) => pause(s, Date.now())), []),
    resume: useCallback(() => setState((s) => start(s, Date.now())), []),
    toggle: useCallback(() => setState((s) => toggle(s, Date.now())), []),
    addMinute: useCallback(() => setState((s) => addTime(s, Date.now())), []),
    reset: useCallback(() => {
      const t = createTimer(durationMs);
      setState(run ? start(t, Date.now()) : t);
    }, [durationMs, run]),
  };
}
