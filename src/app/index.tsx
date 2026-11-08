import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { CampfireLogo } from '@/components/CampfireLogo';
import { GearIcon, HeartIcon, PlayIcon } from '@/components/icons';
import { IconButton } from '@/components/ScreenHeader';
import { categoryColor, useTheme } from '@/theme';

const PLAY = 184;

/** A few fixed stars for the night sky (x, y, size), in a 390-wide frame. */
const STARS: [number, number, number][] = [
  [0.13, 130, 3],
  [0.78, 120, 2],
  [0.85, 236, 3],
  [0.22, 280, 2],
  [0.55, 112, 2],
  [0.4, 200, 2],
];

/** Welcome: logo, slogan, Favorites and Settings, and one big pulsing Play. */
export default function Welcome() {
  const { t } = useTranslation();
  const { colors, fonts, mode, sticker } = useTheme();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const night = mode === 'night';

  const pulse = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    pulse.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [reduce, pulse]);
  const buttonStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.05 * pulse.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.5 - 0.38 * pulse.value, transform: [{ scale: 1 + 0.2 * pulse.value }] }));

  return (
    <View style={[styles.root, { backgroundColor: colors.welcome, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 28 }]}>
      <View pointerEvents="none" style={[styles.blob, { left: -60, bottom: -80, width: 300, height: 300, backgroundColor: colors.welcomeBlob }]} />
      <View pointerEvents="none" style={[styles.blob, { right: -90, top: 300, width: 220, height: 220, backgroundColor: colors.welcomeBlob }]} />
      {night
        ? STARS.map(([x, y, s], i) => (
            <View
              key={i}
              pointerEvents="none"
              style={{ position: 'absolute', left: `${x * 100}%`, top: y, width: s, height: s, borderRadius: s, backgroundColor: i === 2 ? colors.sunny : colors.star }}
            />
          ))
        : null}

      <View style={styles.topBar}>
        <IconButton label={t('home.favorites')} onPress={() => router.push('/favorites')}>
          <HeartIcon size={22} color={colors.ink} filled fill={categoryColor.light_debate} />
        </IconButton>
        <IconButton label={t('home.settings')} onPress={() => router.push('/settings')}>
          <GearIcon color={colors.text} />
        </IconButton>
      </View>

      <View style={styles.brand}>
        <CampfireLogo />
        <Text accessibilityRole="header" style={[styles.wordmark, { color: colors.text, fontFamily: fonts.display }]}>
          Kindling
        </Text>
        <Text style={[styles.slogan, { color: night ? colors.textMuted : colors.text, fontFamily: fonts.bodySemi }]}>
          {t('welcome.slogan')}
        </Text>
      </View>

      <View style={styles.center}>
        {night ? (
          <Animated.View pointerEvents="none" style={[styles.glow, { backgroundColor: colors.accent }, glowStyle]} />
        ) : null}
        <Animated.View style={buttonStyle}>
          <Pressable
            onPress={() => router.push('/pick')}
            accessibilityRole="button"
            accessibilityLabel={t('welcome.play')}
            accessibilityHint={t('welcome.hint')}
          >
            {({ pressed }) => (
              <View style={{ width: PLAY + 8, height: PLAY + 8 }}>
                <View style={[styles.playShadow, { backgroundColor: colors.ink }]} />
                <View
                  style={[
                    styles.play,
                    {
                      backgroundColor: colors.playButton,
                      borderColor: colors.ink,
                      borderWidth: sticker.border + 1,
                      transform: pressed ? [{ translateX: 6 }, { translateY: 6 }] : [],
                    },
                  ]}
                >
                  <PlayIcon size={70} color={colors.playIcon} />
                </View>
              </View>
            )}
          </Pressable>
        </Animated.View>
      </View>

      <Text style={[styles.hint, { color: night ? colors.textMuted : colors.text, fontFamily: fonts.bodySemi }]}>{t('welcome.hint')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden', paddingHorizontal: 24 },
  blob: { position: 'absolute', borderRadius: 999 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between' },
  brand: { alignItems: 'center', marginTop: 28 },
  wordmark: { fontSize: 60, lineHeight: 64, letterSpacing: -1.5, marginTop: 18 },
  slogan: { fontSize: 19, lineHeight: 26, textAlign: 'center', marginTop: 6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 240, height: 240, borderRadius: 120 },
  playShadow: { position: 'absolute', left: 8, top: 8, width: PLAY, height: PLAY, borderRadius: PLAY / 2 },
  play: { width: PLAY, height: PLAY, borderRadius: PLAY / 2, alignItems: 'center', justifyContent: 'center' },
  hint: { fontSize: 16, textAlign: 'center' },
});
