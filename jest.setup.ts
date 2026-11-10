jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Screen tests: a tiny stand-in for Reanimated (see jest/reanimated-mock.js).
jest.mock('react-native-reanimated', () => require('./jest/reanimated-mock'));
