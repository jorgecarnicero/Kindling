import AsyncStorage from '@react-native-async-storage/async-storage';
import { topics } from '@/data/topics';
import type { Topic } from '@/data/types';
import { shareMessage } from '@/share/shareTopic';
import { favoriteTopics, useFavorites } from '../favorites';

const KEY = 'kindling.favorites';

beforeEach(async () => {
  await AsyncStorage.clear();
  useFavorites.setState({ ids: [] });
});

describe('favorites store', () => {
  it('toggle saves, newest first, and toggles off again', () => {
    const { toggle } = useFavorites.getState();
    toggle('gtk-001');
    toggle('story-001');
    expect(useFavorites.getState().ids).toEqual(['story-001', 'gtk-001']);
    toggle('gtk-001');
    expect(useFavorites.getState().ids).toEqual(['story-001']);
  });

  it('never stores duplicates', () => {
    const { toggle } = useFavorites.getState();
    toggle('a');
    toggle('a');
    toggle('a');
    expect(useFavorites.getState().ids).toEqual(['a']);
  });

  it('persists ids to device storage and restores them', async () => {
    useFavorites.getState().toggle('wyr-001');
    const saved = JSON.parse((await AsyncStorage.getItem(KEY))!);
    expect(saved.state).toEqual({ ids: ['wyr-001'] });

    useFavorites.setState({ ids: [] });
    await AsyncStorage.setItem(KEY, JSON.stringify({ state: { ids: ['deep-001', 'fact-002'] }, version: 1 }));
    await useFavorites.persist.rehydrate();
    expect(useFavorites.getState().ids).toEqual(['deep-001', 'fact-002']);
  });
});

describe('favoriteTopics', () => {
  it('keeps saved order and skips ids missing from the bank', () => {
    const all = topics as Topic[];
    const result = favoriteTopics(['story-001', 'gone-999', 'gtk-001'], all);
    expect(result.map((t) => t.id)).toEqual(['story-001', 'gtk-001']);
  });
});

describe('shareMessage', () => {
  it('puts the credit on its own line after the topic', () => {
    expect(shareMessage('Is a hot dog a sandwich?', '— from Kindling')).toBe(
      'Is a hot dog a sandwich?\n— from Kindling',
    );
  });
});
