import AsyncStorage from '@react-native-async-storage/async-storage';
import { trips } from '@/roadtrip/roadTrip';
import { useTrips } from '../trips';

describe('completed road trips', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useTrips.setState({ completed: [] });
  });

  it('marks a theme once', () => {
    const { markCompleted } = useTrips.getState();
    markCompleted(trips[0].id);
    markCompleted(trips[0].id);
    expect(useTrips.getState().completed).toEqual([trips[0].id]);
  });

  it('drops unknown or malformed saved ids', async () => {
    await AsyncStorage.setItem(
      'kindling.trips',
      JSON.stringify({ state: { completed: [trips[1].id, 'old_theme', 42, trips[1].id] }, version: 1 }),
    );
    await useTrips.persist.rehydrate();
    expect(useTrips.getState().completed).toEqual([trips[1].id]);
  });
});
