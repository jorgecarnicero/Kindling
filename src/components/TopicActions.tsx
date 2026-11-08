import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Topic } from '@/data/types';
import { useAppLanguage } from '@/i18n';
import { shareTopic } from '@/share/shareTopic';
import { useFavorites } from '@/store/favorites';
import { useTheme } from '@/theme';
import { HeartIcon, ShareIcon } from './icons';

const HIT = { top: 12, bottom: 12, left: 12, right: 12 };

export function FavoriteButton({ topic, size = 24 }: { topic: Topic; size?: number }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const saved = useFavorites((s) => s.ids.includes(topic.id));
  const toggle = useFavorites((s) => s.toggle);
  return (
    <Pressable
      onPress={() => toggle(topic.id)}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={saved ? t('favorites.remove') : t('favorites.save')}
      accessibilityState={{ selected: saved }}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      <HeartIcon size={size} color={colors.accent} filled={saved} />
    </Pressable>
  );
}

export function ShareButton({ topic, size = 24 }: { topic: Topic; size?: number }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const lang = useAppLanguage();
  return (
    <Pressable
      onPress={() => shareTopic(topic.text[lang], t('share.credit'))}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={t('share.label')}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      <ShareIcon size={size} color={colors.textMuted} />
    </Pressable>
  );
}

/** Heart (top-left) and share (top-right), laid over the card's top corners. */
export function CardCornerActions({ topic }: { topic: Topic }) {
  const { spacing } = useTheme();
  return (
    <View pointerEvents="box-none" style={[styles.corners, { top: spacing.md, left: spacing.md, right: spacing.md }]}>
      <FavoriteButton topic={topic} />
      <ShareButton topic={topic} />
    </View>
  );
}

const styles = StyleSheet.create({
  corners: { position: 'absolute', flexDirection: 'row', justifyContent: 'space-between' },
});
