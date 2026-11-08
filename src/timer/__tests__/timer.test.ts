import {
  addTime,
  createTimer,
  pause,
  progressAt,
  remainingAt,
  start,
  tick,
  toggle,
  type TimerState,
} from '../timer';

const MIN = 60_000;
const T0 = 1_000_000; // arbitrary wall-clock start

const running = (): TimerState => start(createTimer(MIN), T0);

describe('createTimer', () => {
  it('defaults to 1 minute, idle, full ring', () => {
    const s = createTimer();
    expect(s.status).toBe('idle');
    expect(remainingAt(s, T0)).toBe(MIN);
    expect(progressAt(s, T0)).toBe(1);
  });
});

describe('running', () => {
  it('counts down from wall-clock time', () => {
    const s = running();
    expect(remainingAt(s, T0 + 15_000)).toBe(45_000);
    expect(progressAt(s, T0 + 15_000)).toBeCloseTo(0.75);
  });

  it('never goes below zero', () => {
    expect(remainingAt(running(), T0 + 5 * MIN)).toBe(0);
    expect(progressAt(running(), T0 + 5 * MIN)).toBe(0);
  });

  it('start is a no-op while already running', () => {
    const s = running();
    expect(start(s, T0 + 10_000)).toBe(s);
  });
});

describe('tick', () => {
  it('stays running before the end', () => {
    const s = running();
    expect(tick(s, T0 + 59_999)).toBe(s);
  });

  it('moves to done at the end, even if checked late (backgrounded app)', () => {
    const s = tick(running(), T0 + 10 * MIN);
    expect(s.status).toBe('done');
    expect(remainingAt(s, T0 + 10 * MIN)).toBe(0);
  });
});

describe('pause and resume', () => {
  it('freezes remaining time while paused', () => {
    const paused = pause(running(), T0 + 20_000);
    expect(paused.status).toBe('paused');
    expect(remainingAt(paused, T0 + 20_000)).toBe(40_000);
    expect(remainingAt(paused, T0 + 10 * MIN)).toBe(40_000);
  });

  it('resumes where it left off', () => {
    const paused = pause(running(), T0 + 20_000);
    const resumed = start(paused, T0 + 5 * MIN);
    expect(resumed.status).toBe('running');
    expect(remainingAt(resumed, T0 + 5 * MIN + 10_000)).toBe(30_000);
  });

  it('toggle flips between running and paused', () => {
    const p = toggle(running(), T0 + 1_000);
    expect(p.status).toBe('paused');
    expect(toggle(p, T0 + 2_000).status).toBe('running');
  });

  it('pausing after time ran out ends the timer instead', () => {
    expect(pause(running(), T0 + 2 * MIN).status).toBe('done');
  });

  it('toggle does nothing when idle or done', () => {
    const idle = createTimer(MIN);
    expect(toggle(idle, T0)).toBe(idle);
    const done = tick(running(), T0 + 2 * MIN);
    expect(toggle(done, T0 + 2 * MIN)).toBe(done);
  });
});

describe('addTime (+1 min)', () => {
  it('after time is up, keeps talking with a full ring', () => {
    const done = tick(running(), T0 + MIN);
    const more = addTime(done, T0 + MIN);
    expect(more.status).toBe('running');
    expect(remainingAt(more, T0 + MIN)).toBe(MIN);
    expect(progressAt(more, T0 + MIN)).toBe(1);
    expect(more.extensions).toBe(1);
  });

  it('while running, adds to what is left and refills the ring', () => {
    const more = addTime(running(), T0 + 30_000);
    expect(remainingAt(more, T0 + 30_000)).toBe(90_000);
    expect(progressAt(more, T0 + 30_000)).toBe(1);
    expect(progressAt(more, T0 + 75_000)).toBeCloseTo(0.5);
  });

  it('while paused, stays paused with more time', () => {
    const more = addTime(pause(running(), T0 + 30_000), T0 + 40_000);
    expect(more.status).toBe('paused');
    expect(remainingAt(more, T0 + 99 * MIN)).toBe(90_000);
  });

  it('counts every extension', () => {
    let s = running();
    s = addTime(s, T0 + 1_000);
    s = addTime(tick(s, T0 + 10 * MIN), T0 + 10 * MIN);
    expect(s.extensions).toBe(2);
  });
});
