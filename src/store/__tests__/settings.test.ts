import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS, useSettings } from '../settings';

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
