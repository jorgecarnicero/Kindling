import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';
import { FlameIcon } from '@/components/icons';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Sticker } from '@/components/Sticker';
import { FavoriteButton, ShareButton } from '@/components/TopicActions';
import { topics } from '@/data/topics';
import type { Topic } from '@/data/types';
import { useAppLanguage } from '@/i18n';
import { favoriteTopics, useFavorites, useFavoritesHydrated } from '@/store/favorites';
import { categoryColor, useTheme } from '@/theme';

export default function Favorites() {
  const { t } = useTranslation();
  const { colors, fonts, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const lang = useAppLanguage();
  const ids = useFavorites((s) => s.ids);
  const hydrated = useFavoritesHydrated();

  // Rows are listed from a snapshot taken when the screen opens (once storage has loaded),
  // so un-hearting one by accident doesn't make it vanish; tap the heart again to keep it.
  const [listed, setListed] = useState<Topic[] | null>(null);
  useEffect(() => {
    if (hydrated) setListed((prev) => prev ?? favoriteTopics(useFavorites.getState().ids, topics));
  }, [hydrated]);
  const savedCount = favoriteTopics(ids, topics).length;

  if (!listed) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  if (listed.length === 0) {
    return <Screen title={t('favorites.title')} message={t('favorites.empty')} />;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('favorites.title')} />
      <FlatList
        contentContainerStyle={{ padding: spacing.lg - 4, gap: spacing.md, paddingBottom: insets.bottom + spacing.xxl }}
        data={listed}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.sm }}>
            <Button
              big
              label={t('favorites.play', { count: savedCount })}
              onPress={() => router.push({ pathname: '/play', params: { source: 'favorites' } })}
              disabled={savedCount === 0}
            />
          </View>
        }
        renderItem={({ item }) => {
          const saved = ids.includes(item.id);
          return (
            <Sticker
              bg={colors.surface}
              radius={radius.lg}
              shadow={4}
              faceStyle={[styles.row, { padding: spacing.md - 2, gap: spacing.md - 4 }]}
            >
              <FavoriteButton topic={item} />
              <View style={[styles.grow, { opacity: saved ? 1 : 0.5 }]}>
                <View style={styles.meta}>
                  <FlameIcon size={14} color={categoryColor[item.category]} outline={colors.ink} />
                  <Text style={{ color: colors.textMuted, fontFamily: fonts.bodyBold, fontSize: 13 }}>
                    {t(`category.${item.category}`)}
                  </Text>
                </View>
                <Text style={{ color: colors.text, fontFamily: fonts.bodySemi, fontSize: 17, lineHeight: 23, marginTop: 4 }}>
                  {item.text[lang]}
                </Text>
                {saved ? null : (
                  <Text style={{ color: colors.textMuted, fontFamily: fonts.body, fontSize: 13, marginTop: 4 }}>
                    {t('favorites.unsavedHint')}
                  </Text>
                )}
              </View>
              <ShareButton topic={item} />
            </Sticker>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
