import AsyncStorage from '@react-native-async-storage/async-storage';
import { questionDurationMs } from '@/config/dev';
import { DEFAULT_SETTINGS, TIMER_OPTIONS, useSettings } from '../settings';

const KEY = 'kindling.settings';

beforeEach(async () => {
  await AsyncStorage.clear();
  useSettings.getState().resetAll();
});

describe('settings store', () => {
  it('starts with the defaults', () => {
    const { update, resetAll, ...data } = useSettings.getState();
    expect(data).toEqual(DEFAULT_SETTINGS);
    expect(DEFAULT_SETTINGS).toMatchObject({ tapToPause: true, sound: true, vibration: true, language: 'system' });
  });

  it('saves changes to device storage (data only)', async () => {
    useSettings.getState().update({ autoAdvance: true, language: 'es' });
    const saved = JSON.parse((await AsyncStorage.getItem(KEY))!);
    expect(saved.state).toMatchObject({ autoAdvance: true, language: 'es' });
    expect(saved.state).not.toHaveProperty('update');
  });

  it('defaults to a 1 minute timer and offers 30s to 5 min plus off', () => {
    expect(DEFAULT_SETTINGS.timerSeconds).toBe(60);
    expect([...TIMER_OPTIONS]).toEqual([30, 60, 120, 180, 300, 0]);
  });

  it('replaces an invalid saved timer with the default', async () => {
    await AsyncStorage.setItem(KEY, JSON.stringify({ state: { timerSeconds: 42 }, version: 1 }));
    await useSettings.persist.rehydrate();
    expect(useSettings.getState().timerSeconds).toBe(60);
    await AsyncStorage.setItem(KEY, JSON.stringify({ state: { timerSeconds: 0 }, version: 1 }));
    await useSettings.persist.rehydrate();
    expect(useSettings.getState().timerSeconds).toBe(0);
  });

  it('converts the setting to a topic length (0 = off)', () => {
    expect(questionDurationMs(30)).toBe(30_000);
    expect(questionDurationMs(300)).toBe(300_000);
    expect(questionDurationMs(0)).toBe(0);
  });

  it('restores saved settings and fills in settings added later', async () => {
    // An older save that predates `vibrationStrength`.
    await AsyncStorage.setItem(KEY, JSON.stringify({ state: { sound: false, language: 'en' }, version: 1 }));
    await useSettings.persist.rehydrate();
    const s = useSettings.getState();
    expect(s.sound).toBe(false);
    expect(s.language).toBe('en');
    expect(s.vibrationStrength).toBe('soft');
    expect(typeof s.update).toBe('function');
  });
});
