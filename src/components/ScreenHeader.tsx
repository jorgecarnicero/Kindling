import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme';
import { BackIcon } from './icons';
import { PressableSticker } from './Sticker';

/** Square sticker button holding an icon (back, settings, favorites). */
export function IconButton({ label, onPress, children }: { label: string; onPress: () => void; children: ReactNode }) {
  const { colors, radius, sticker } = useTheme();
  return (
    <PressableSticker
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      bg={colors.surface}
      radius={radius.md}
      shadow={sticker.shadowSmall}
      faceStyle={styles.icon}
      hitSlop={6}
    >
      {children}
    </PressableSticker>
  );
}

type Props = { title?: string; subtitle?: string; right?: ReactNode };

/** Top bar for inner screens: back sticker, big title, optional right-side element. */
export function ScreenHeader({ title, subtitle, right }: Props) {
  const { t } = useTranslation();
  const { colors, fonts, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg - 4, gap: 6 }}>
      <View style={styles.row}>
        <IconButton label={t('common.back')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
          <BackIcon color={colors.text} />
        </IconButton>
        {title ? (
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text, fontFamily: fonts.display }]} numberOfLines={2}>
            {title}
          </Text>
        ) : (
          <View style={styles.grow} />
        )}
        {right}
      </View>
      {subtitle ? (
        <Text style={{ color: colors.textMuted, fontFamily: fonts.bodySemi, fontSize: 15, marginLeft: 58 }}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1, fontSize: 30, lineHeight: 32, letterSpacing: -0.6 },
  grow: { flex: 1 },
  icon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
});
