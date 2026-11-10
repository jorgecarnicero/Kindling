import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_LOOK } from '@/characters/catalog';
import { recordPlayDay, useProfile } from '../profile';
import { useTrips } from '../trips';

describe('profile', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useProfile.setState({ look: DEFAULT_LOOK, seen: [], daysPlayed: 0, lastDay: null, created: false });
    useTrips.setState({ completed: [] });
  });

  it('counts each calendar day once', () => {
    const { recordDay } = useProfile.getState();
    recordDay(new Date(2026, 10, 9, 9));
    recordDay(new Date(2026, 10, 9, 22));
    recordDay(new Date(2026, 10, 10, 8));
    expect(useProfile.getState().daysPlayed).toBe(2);
  });

  it('wears only items that exist', () => {
    const { wear } = useProfile.getState();
    wear('hat', 'hat_cap');
    wear('hat', 'hat_sombrero');
    expect(useProfile.getState().look.hat).toBe('hat_cap');
  });

  it('marks items as seen once', () => {
    const { markSeen } = useProfile.getState();
    markSeen(['hat:hat_bucket']);
    markSeen(['hat:hat_bucket', 'hold:hold_mallow']);
    expect(useProfile.getState().seen).toEqual(['hat:hat_bucket', 'hold:hold_mallow']);
  });

  it('keeps its id and repairs a bad save', async () => {
    await AsyncStorage.setItem(
      'kindling.profile',
      JSON.stringify({
        state: { id: 'p-abc', look: { hat: 'hat_cap', skin: 'skin_99', hair: 7 }, seen: ['x', 3, 'x'], daysPlayed: -4 },
        version: 1,
      }),
    );
    await useProfile.persist.rehydrate();
    const s = useProfile.getState();
    expect(s.id).toBe('p-abc');
    expect(s.look).toEqual({ ...DEFAULT_LOOK, hat: 'hat_cap' });
    expect(s.seen).toEqual(['x']);
    expect(s.daysPlayed).toBe(0);
  });

  it('never puts on a locked item', () => {
    const { wear } = useProfile.getState();
    wear('hat', 'hat_crown');
    expect(useProfile.getState().look.hat).toBe('none');
    useTrips.setState({ completed: ['childhood'] });
    wear('hat', 'hat_crown');
    expect(useProfile.getState().look.hat).toBe('hat_crown');
  });

  it('cleans a whole new look', () => {
    useProfile.getState().setLook({ ...DEFAULT_LOOK, hat: 'hat_crown', glasses: 'gl_round' });
    expect(useProfile.getState().look).toEqual({ ...DEFAULT_LOOK, glasses: 'gl_round' });
  });

  it('remembers that the character was made', async () => {
    useProfile.getState().finishSetup();
    await useProfile.persist.rehydrate();
    expect(useProfile.getState().created).toBe(true);
  });

  it('counts a day played after the saved profile loads, not before', async () => {
    await AsyncStorage.setItem(
      'kindling.profile',
      JSON.stringify({ state: { id: 'p-abc', daysPlayed: 4, lastDay: '2026-11-01' }, version: 1 }),
    );
    const loading = useProfile.persist.rehydrate();
    recordPlayDay(new Date(2026, 10, 10));
    await loading;
    expect(useProfile.getState().daysPlayed).toBe(5);
    expect(useProfile.getState().lastDay).toBe('2026-11-10');
  });
});
