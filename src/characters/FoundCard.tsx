import { useEffect } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';
import { Sticker } from '@/components/Sticker';
import { useAppLanguage } from '@/i18n';
import { useLook, useProfile } from '@/store/profile';
import { useSettings } from '@/store/settings';
import { useTheme } from '@/theme';
import type { Item } from './catalog';
import { FireScene } from './FireScene';
import { wearingAll } from './unlocks';

/**
 * "You found something!": shown at the end of a road trip when finishing it unlocked new
 * items. Shows your character already wearing them; "Wear it" keeps them on.
 */
export function FoundCard({ items }: { items: readonly Item[] }) {
  const { t } = useTranslation();
  const { colors, fonts, radius, spacing } = useTheme();
  const lang = useAppLanguage();
  const look = useLook();
  const wear = useProfile((s) => s.wear);
  const preview = wearingAll(look, items);
  const wearing = items.every((i) => look[i.slot] === i.id);
  // Smaller scene on short phones so the card and the buttons below still fit.
  const { height } = useWindowDimensions();
  const scene = height < 700 ? 130 : height < 800 ? 160 : 190;
  const names = items.map((i) => i.name[lang]).join(' · ');

  // A soft happy buzz when the card appears (only if vibration is on in Settings).
  useEffect(() => {
    if (useSettings.getState().vibration)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  return (
    <Animated.View entering={ZoomIn.springify().damping(14)}>
      <Sticker bg={colors.surface} radius={radius.xl} faceStyle={{ padding: spacing.md, gap: spacing.md }}>
        <FireScene look={preview} label={t('me.reveal.scene', { items: names })} height={scene} sparks />
        <View accessibilityLiveRegion="polite" style={styles.text}>
          <Text
            accessibilityRole="header"
            style={{ color: colors.text, fontFamily: fonts.display, fontSize: 26, lineHeight: 30, textAlign: 'center' }}
          >
            {t('me.reveal.title')}
          </Text>
          <Text style={{ color: colors.text, fontFamily: fonts.bodyBold, fontSize: 18, lineHeight: 24, textAlign: 'center' }}>
            {names}
          </Text>
        </View>
        <View style={[styles.row, { gap: spacing.sm + 4 }]}>
          <View style={styles.wide}>
            <Button
              variant="sunny"
              label={wearing ? t('me.wearing') : t('me.reveal.wear', { count: items.length })}
              disabled={wearing}
              onPress={() => items.forEach((i) => wear(i.slot, i.id))}
            />
          </View>
          <View style={styles.grow}>
            <Button variant="secondary" label={t('me.reveal.backpack')} onPress={() => router.push('/backpack')} />
          </View>
        </View>
      </Sticker>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  text: { gap: 4 },
  row: { flexDirection: 'row' },
  grow: { flex: 1 },
  wide: { flex: 1.3 },
});
