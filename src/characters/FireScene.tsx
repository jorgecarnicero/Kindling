import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Sticker } from '@/components/Sticker';
import { useTheme } from '@/theme';
import { Character } from './Character';
import type { Look } from './catalog';

/** The fire-lit scene behind a character (the same in day and night). */
export const SCENE = '#1B1A3A';
export const SCENE_INK = '#0D0C22';
const LOG = '#A0643C';
const GLOW = '#FF8A3D';
const GOLD = '#FFC857';

/** Sparks: horizontal offset from the center, delay (ms), size, drift. */
const SPARKS: [number, number, number, number][] = [
  [-70, 0, 7, 12],
  [55, 350, 6, -10],
  [-30, 800, 5, -8],
  [85, 1150, 7, 6],
  [10, 1500, 6, 14],
  [-95, 1900, 5, -6],
];

function Spark({ x, delay, size, drift, rise }: { x: number; delay: number; size: number; drift: number; rise: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) }), -1, false));
  }, [t, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.1 ? t.value * 10 : 1 - t.value,
    transform: [{ translateY: -rise * t.value }, { translateX: drift * Math.sin(t.value * 6) }, { rotate: '45deg' }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.spark, { width: size, height: size, marginLeft: x - size / 2, backgroundColor: GOLD }, style]}
    />
  );
}

type Props = {
  look: Look;
  label: string;
  /** Scene height; the character is drawn a little taller so it sits on the log. */
  height?: number;
  /** Sparks rising from the fire (a celebration; off with reduce motion). */
  sparks?: boolean;
  children?: ReactNode;
};

/** A character sitting on a log in the glow of the fire. */
export function FireScene({ look, label, height = 230, sparks = false, children }: Props) {
  const { radius } = useTheme();
  const reduce = useReducedMotion();
  const glow = height * 0.74;
  return (
    <Sticker bg={SCENE} radius={radius.xl} faceStyle={styles.scene}>
      <View accessible accessibilityRole="image" accessibilityLabel={label} style={[styles.inner, { height }]}>
        <View
          pointerEvents="none"
          style={[styles.glow, { width: glow, height: glow, borderRadius: glow / 2, bottom: height * 0.13 }]}
        />
        {sparks && !reduce
          ? SPARKS.map(([x, delay, size, drift], i) => (
              <Spark key={i} x={x} delay={delay} size={size} drift={drift} rise={height * 0.8} />
            ))
          : null}
        <Character look={look} size={height * 0.87} animated ink={SCENE_INK} />
        <View pointerEvents="none" style={[styles.log, { borderColor: SCENE_INK }]} />
      </View>
      {children}
    </Sticker>
  );
}

const styles = StyleSheet.create({
  scene: { overflow: 'hidden' },
  inner: { alignItems: 'center', justifyContent: 'flex-end' },
  glow: { position: 'absolute', backgroundColor: GLOW, opacity: 0.28 },
  spark: { position: 'absolute', bottom: 24, left: '50%', borderRadius: 1 },
  log: {
    position: 'absolute',
    bottom: -16,
    width: 230,
    height: 44,
    borderRadius: 22,
    borderWidth: 4,
    backgroundColor: LOG,
  },
});
