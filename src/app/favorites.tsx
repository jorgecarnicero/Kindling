import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { FavoriteButton, ShareButton } from '@/components/TopicActions';
import { topics } from '@/data/topics';
import type { Topic } from '@/data/types';
import { useAppLanguage } from '@/i18n';
import { favoriteTopics, useFavorites, useFavoritesHydrated } from '@/store/favorites';
import { useTheme } from '@/theme';

export default function Favorites() {
  const { t } = useTranslation();
  const { colors, spacing, radius, fontSize } = useTheme();
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
    return <Screen title={t('favorites.title')} subtitle={t('favorites.empty')} />;
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl }}
      data={listed}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={{ marginBottom: spacing.sm }}>
          <Button
            label={t('favorites.play', { count: savedCount })}
            onPress={() => router.push({ pathname: '/play', params: { source: 'favorites' } })}
            disabled={savedCount === 0}
          />
        </View>
      }
      renderItem={({ item }) => {
        const saved = ids.includes(item.id);
        return (
          <View
            style={[
              styles.row,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.md,
                gap: spacing.md,
              },
            ]}
          >
            <FavoriteButton topic={item} />
            <View style={[styles.grow, { opacity: saved ? 1 : 0.5 }]}>
              <Text style={[styles.eyebrow, { color: colors.accent }]}>
                {`${t(`category.${item.category}`)} · ${t(`depth.${item.depth}`)}`.toUpperCase()}
              </Text>
              <Text style={{ color: colors.text, fontSize: fontSize.body, marginTop: 4 }}>{item.text[lang]}</Text>
              {saved ? null : (
                <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>{t('favorites.unsavedHint')}</Text>
              )}
            </View>
            <ShareButton topic={item} />
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  grow: { flex: 1 },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
});
