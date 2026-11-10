import { fireEvent, render, screen } from '@testing-library/react-native';
import { DEFAULT_LOOK } from '@/characters/catalog';
import '@/i18n';
import { useProfile } from '@/store/profile';
import { useSettings } from '@/store/settings';
import { useTrips } from '@/store/trips';
import TripScreen from '../trip';

// The trip screen's route: `params.id` is the theme; setParams is what "Another theme" calls.
const params: { id?: string } = {};
const mockRouter = { setParams: jest.fn(), back: jest.fn(), push: jest.fn(), replace: jest.fn(), canGoBack: () => true };
jest.mock('expo-router', () => ({
  get router() {
    return mockRouter;
  },
  useLocalSearchParams: () => params,
}));
jest.mock('expo-keep-awake', () => ({ useKeepAwake: () => {} }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('@/roadtrip/useSpeech', () => ({ useSpeech: () => ({ say: jest.fn(), stop: jest.fn() }) }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: { Success: 'success' },
}));

/** Tap "Next stop" through all 8 stops and "Finish the road". */
async function driveToTheEnd() {
  for (let i = 0; i < 7; i++) await fireEvent.press(screen.getByText('Next stop'));
  await fireEvent.press(screen.getByText('Finish the road'));
}

describe('trip screen', () => {
  beforeEach(() => {
    params.id = 'food';
    jest.clearAllMocks();
    useTrips.setState({ completed: [] });
    useProfile.setState({ look: DEFAULT_LOOK, seen: [], daysPlayed: 0, lastDay: null, created: true });
    useSettings.setState({ readAloud: false, language: 'en' });
  });

  it('marks the theme done and shows what you found', async () => {
    await render(<TripScreen />);
    await driveToTheEnd();
    expect(useTrips.getState().completed).toEqual(['food']);
    expect(screen.getByText('You found something!')).toBeTruthy();
    expect(screen.getByText('Bucket hat · Marshmallow')).toBeTruthy();

    await fireEvent.press(screen.getByText('Wear them'));
    expect(useProfile.getState().look).toMatchObject({ hat: 'hat_bucket', hold: 'hold_mallow' });
    expect(screen.getByText('Wearing')).toBeTruthy();
  });

  it('shows the usual end card when nothing new was found', async () => {
    useTrips.setState({ completed: ['food'] });
    await render(<TripScreen />);
    await driveToTheEnd();
    expect(screen.queryByText('You found something!')).toBeNull();
    expect(screen.getByText('You made it to the end of the road')).toBeTruthy();
  });

  it('starts "Another theme" at the first stop without marking it done', async () => {
    const { rerender } = await render(<TripScreen />);
    await driveToTheEnd();
    await fireEvent.press(screen.getByText('Another theme'));
    const next = mockRouter.setParams.mock.calls[0][0].id as string;
    expect(next).not.toBe('food');

    params.id = next;
    await rerender(<TripScreen />);
    expect(useTrips.getState().completed).toEqual(['food']);
    expect(screen.getByText('Stop 1 of 8')).toBeTruthy();
    expect(screen.queryByText('You found something!')).toBeNull();
  });
});
