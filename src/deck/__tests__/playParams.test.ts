import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelection } from '@/store/selection';
import { buildPlayParams, depthsUpTo, parsePlayParams } from '../playParams';

describe('depthsUpTo', () => {
  it('includes every lighter level', () => {
    expect(depthsUpTo('light')).toEqual(['light']);
    expect(depthsUpTo('medium')).toEqual(['light', 'medium']);
    expect(depthsUpTo('deep')).toEqual(['light', 'medium', 'deep']);
  });
});

describe('play params', () => {
  it('round-trips a Home selection into a deck filter', () => {
    const params = buildPlayParams(['stories', 'would_you_rather'], 'medium');
    expect(parsePlayParams(params)).toEqual({
      source: 'bank',
      filter: { categories: ['stories', 'would_you_rather'], depths: ['light', 'medium'] },
    });
  });

  it('no categories selected means all categories', () => {
    expect(parsePlayParams(buildPlayParams([], 'light'))).toEqual({ source: 'bank', filter: { depths: ['light'] } });
  });

  it('surprise plays everything at every depth', () => {
    expect(parsePlayParams({ source: 'surprise', categories: 'couples', depth: 'light' })).toEqual({
      source: 'bank',
      filter: {},
    });
  });

  it('favorites ignores the filter', () => {
    expect(parsePlayParams({ source: 'favorites', categories: 'couples' })).toEqual({
      source: 'favorites',
      filter: {},
    });
  });

  it('ignores unknown categories and depths', () => {
    expect(parsePlayParams({ categories: 'stories,nope,', depth: 'spicy' })).toEqual({
      source: 'bank',
      filter: { categories: ['stories'] },
    });
  });
});

describe('selection store', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useSelection.setState({ categories: [], maxDepth: 'light' });
  });

  it('toggles categories and keeps them in a stable order', () => {
    const { toggleCategory } = useSelection.getState();
    toggleCategory('team_building');
    toggleCategory('get_to_know');
    expect(useSelection.getState().categories).toEqual(['get_to_know', 'team_building']);
    toggleCategory('team_building');
    expect(useSelection.getState().categories).toEqual(['get_to_know']);
  });

  it('remembers the choice and drops invalid saved values', async () => {
    await AsyncStorage.setItem(
      'kindling.selection',
      JSON.stringify({ state: { categories: ['stories', 'old_category'], maxDepth: 'deep' }, version: 1 }),
    );
    await useSelection.persist.rehydrate();
    expect(useSelection.getState().categories).toEqual(['stories']);
    expect(useSelection.getState().maxDepth).toBe('deep');

    await AsyncStorage.setItem('kindling.selection', JSON.stringify({ state: { maxDepth: 'spicy' }, version: 1 }));
    await useSelection.persist.rehydrate();
    expect(useSelection.getState().maxDepth).toBe('deep');
  });
});
