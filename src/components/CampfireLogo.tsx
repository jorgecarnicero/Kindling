import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { useTheme } from '@/theme';

// The campfire mark: a sticker flame on two crossed logs with sparks.
// Same geometry as scripts/make_icons.mjs (keep them in sync).
const LOGS = 'M24 96L92 80M96 96L28 80';
const FLAME =
  'M60 14c11 14 24 23 24 42 0 15-11 26-24 26S36 71 36 56c0-11 8-17 12-26 2 8 6 12 11 12 0-10-4-18 1-28z';
const CORE = 'M60 52c5 6 10 10 10 17 0 7-5 11-10 11s-10-4-10-11c0-7 5-11 10-17z';

/** The logo badge for the welcome screen; gently bobs and flickers unless Reduce Motion is on. */
export function CampfireLogo({ size = 96 }: { size?: number }) {
  const { colors, mode, radius, sticker } = useTheme();
  const reduce = useReducedMotion();
  const bob = useSharedValue(0);
  const flicker = useSharedValue(0);

  useEffect(() => {
    if (reduce) return;
    bob.value = withRepeat(withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.sin) }), -1, true);
    flicker.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(-1, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, [reduce, bob, flicker]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -6 * bob.value }, { rotate: `${-3 + 5 * bob.value}deg` }],
  }));
  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: 1 + 0.04 * flicker.value }, { scaleY: 1 - 0.035 * flicker.value }, { rotate: `${-2 * flicker.value}deg` }],
  }));

  const night = mode === 'night';
  const ink = colors.ink;
  const inner = size * 0.8;
  const s = sticker.shadow;

  return (
    <Animated.View style={[{ width: size + s, height: size + s }, badgeStyle]} accessibilityElementsHidden importantForAccessibility="no">
      <Animated.View style={{ position: 'absolute', left: s, top: s, width: size, height: size, borderRadius: radius.xl, backgroundColor: ink }} />
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: radius.xl,
          backgroundColor: colors.logoBadge,
          borderWidth: sticker.border,
          borderColor: ink,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg width={inner} height={inner} viewBox="0 0 120 120" style={{ position: 'absolute' }}>
          <Path d={LOGS} stroke={ink} strokeWidth={17} strokeLinecap="round" />
          <Path d={LOGS} stroke={colors.logoLog} strokeWidth={9} strokeLinecap="round" />
          {night ? (
            <G>
              <Circle cx={24} cy={32} r={4} fill={colors.sunny} />
              <Circle cx={96} cy={24} r={3} fill={colors.sunny} />
            </G>
          ) : (
            <G>
              <Circle cx={24} cy={32} r={4} fill={colors.accent} stroke={ink} strokeWidth={2.5} />
              <Circle cx={96} cy={24} r={3} fill={colors.accent} stroke={ink} strokeWidth={2.5} />
            </G>
          )}
        </Svg>
        <Animated.View style={[{ width: inner, height: inner, position: 'absolute', transformOrigin: '50% 70%' }, flameStyle]}>
          <Svg width={inner} height={inner} viewBox="0 0 120 120">
            <Path d={FLAME} fill={colors.accent} stroke={ink} strokeWidth={4.5} strokeLinejoin="round" />
            <Path d={CORE} fill={colors.logoCore} stroke={ink} strokeWidth={3.5} strokeLinejoin="round" />
          </Svg>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}
