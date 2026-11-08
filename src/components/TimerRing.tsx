import { ReactNode, useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedProps,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { progressAt, remainingAt, type TimerState } from '@/timer/timer';
import { useTheme } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type Props = { timer: TimerState; children: ReactNode; strokeWidth?: number };

/**
 * A stroke tracing the card's rounded border that drains clockwise from the top centre.
 * Animates on the UI thread from the timer's wall-clock state; no ticking numbers.
 */
export function TimerRing({ timer, children, strokeWidth = 6 }: Props) {
  const { colors, radius } = useTheme();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const progress = useSharedValue(1);

  useEffect(() => {
    const now = Date.now();
    const from = progressAt(timer, now);
    cancelAnimation(progress);
    // The ring is information, not decoration: keep it moving even with Reduce Motion on.
    const instant = withTiming(from, { duration: 0, reduceMotion: ReduceMotion.Never });
    progress.value =
      timer.status === 'running'
        ? withSequence(
            instant,
            withTiming(0, { duration: remainingAt(timer, now), easing: Easing.linear, reduceMotion: ReduceMotion.Never }),
          )
        : instant;
  }, [timer, progress]);

  const inset = strokeWidth / 2;
  const w = size.w - strokeWidth;
  const h = size.h - strokeWidth;
  const r = Math.max(0, Math.min(radius.lg + inset, w / 2, h / 2));
  const length = w > 0 && h > 0 ? 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r : 0;
  const d =
    length > 0
      ? [
          `M ${inset + w / 2} ${inset}`,
          `H ${inset + w - r}`,
          `A ${r} ${r} 0 0 1 ${inset + w} ${inset + r}`,
          `V ${inset + h - r}`,
          `A ${r} ${r} 0 0 1 ${inset + w - r} ${inset + h}`,
          `H ${inset + r}`,
          `A ${r} ${r} 0 0 1 ${inset} ${inset + h - r}`,
          `V ${inset + r}`,
          `A ${r} ${r} 0 0 1 ${inset + r} ${inset}`,
          'Z',
        ].join(' ')
      : '';

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: length * (1 - progress.value),
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };

  return (
    <View onLayout={onLayout} style={[styles.root, { padding: strokeWidth + 4 }]}>
      {length > 0 ? (
        <Svg style={StyleSheet.absoluteFill} width={size.w} height={size.h} pointerEvents="none">
          <Path d={d} stroke={colors.border} strokeWidth={strokeWidth} fill="none" />
          <AnimatedPath
            d={d}
            stroke={colors.accent}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={[length, length]}
            animatedProps={animatedProps}
          />
        </Svg>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignSelf: 'stretch' },
});
