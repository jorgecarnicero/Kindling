// Screen tests: a tiny stand-in for Reanimated (its own mock needs the native worklets
// runtime). Animations jump straight to their end value; Animated.* are plain views.
// Add what a new screen needs here (used from jest.setup.ts).
module.exports = (() => {
  const RN = require('react-native');
  const anim = (to) => to;
  const layout = () => {
    const chain = { springify: () => chain, damping: () => chain, duration: () => chain, delay: () => chain };
    return chain;
  };
  const Easing = new Proxy({}, { get: () => (...args) => (typeof args[0] === 'function' ? args[0] : (t) => t) });
  const Animated = {
    View: RN.View,
    Text: RN.Text,
    createAnimatedComponent: (C) => C,
  };
  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    Easing,
    ReduceMotion: { System: 'system', Always: 'always', Never: 'never' },
    useSharedValue: (v) => ({ value: v }),
    useAnimatedStyle: (fn) => fn(),
    useAnimatedProps: (fn) => fn(),
    useReducedMotion: () => false,
    withTiming: anim,
    withRepeat: anim,
    withSequence: (...steps) => steps[steps.length - 1],
    withDelay: (_ms, a) => a,
    cancelAnimation: () => {},
    FadeIn: layout(),
    ZoomIn: layout(),
  };
})();
