import { act, renderHook } from '@testing-library/react-native';
import { useTimer } from '../useTimer';

const MIN = 60_000;

beforeEach(() => {
  jest.useFakeTimers({ now: 1_000_000 });
});
afterEach(() => {
  jest.useRealTimers();
});

async function advance(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

describe('useTimer', () => {
  it('calls onDone exactly once when the minute runs out', async () => {
    const onDone = jest.fn();
    const { result } = await renderHook(() => useTimer(MIN, { onDone }));
    expect(result.current.status).toBe('running');

    await advance(MIN - 1);
    expect(onDone).not.toHaveBeenCalled();

    await advance(1);
    expect(result.current.status).toBe('done');
    expect(onDone).toHaveBeenCalledTimes(1);

    await advance(5 * MIN);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('does not fire while paused, and fires after resuming', async () => {
    const onDone = jest.fn();
    const { result } = await renderHook(() => useTimer(MIN, { onDone }));

    await advance(20_000);
    await act(async () => result.current.pause());
    await advance(10 * MIN);
    expect(onDone).not.toHaveBeenCalled();

    await act(async () => result.current.resume());
    await advance(40_000);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('fires again after +1 min runs out, and after reset', async () => {
    const onDone = jest.fn();
    const { result } = await renderHook(() => useTimer(MIN, { onDone }));

    await advance(MIN);
    await act(async () => result.current.addMinute());
    expect(result.current.status).toBe('running');
    await advance(MIN);
    expect(onDone).toHaveBeenCalledTimes(2);

    await act(async () => result.current.reset());
    await advance(MIN);
    expect(onDone).toHaveBeenCalledTimes(3);
  });

  it('timer off: stays idle and never fires, even after reset', async () => {
    const onDone = jest.fn();
    const { result } = await renderHook(() => useTimer(MIN, { onDone, enabled: false }));
    expect(result.current.status).toBe('idle');
    await advance(10 * MIN);
    await act(async () => result.current.reset());
    await advance(10 * MIN);
    expect(result.current.status).toBe('idle');
    expect(onDone).not.toHaveBeenCalled();
  });

  it('a zero duration is treated as off', async () => {
    const onDone = jest.fn();
    const { result } = await renderHook(() => useTimer(0, { onDone }));
    await advance(MIN);
    expect(result.current.status).toBe('idle');
    expect(onDone).not.toHaveBeenCalled();
  });

  it('uses the latest onDone callback', async () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = await renderHook(({ cb }: { cb: () => void }) => useTimer(MIN, { onDone: cb }), {
      initialProps: { cb: first },
    });
    await rerender({ cb: second });
    await advance(MIN);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
