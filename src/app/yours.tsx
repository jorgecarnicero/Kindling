import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';
import { FlameIcon, PencilIcon } from '@/components/icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Sticker } from '@/components/Sticker';
import { buildPlayParams } from '@/deck/playParams';
import { useCustomTopics, useCustomTopicsHydrated } from '@/store/customTopics';
import { categoryColor, useTheme } from '@/theme';

/** Your own topics: write, edit, and play them. */
export default function Yours() {
  const { t } = useTranslation();
  const { colors, fonts, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const hydrated = useCustomTopicsHydrated();
  const topics = useCustomTopics((s) => s.topics);

  if (!hydrated) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  const write = () => router.push('/topic-editor');

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('yours.title')} />
      <FlatList
        contentContainerStyle={{ padding: spacing.lg - 4, gap: spacing.md, paddingBottom: insets.bottom + spacing.xxl }}
        data={topics}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={{ gap: spacing.md, marginBottom: spacing.sm }}>
            {topics.length === 0 ? (
              <Text style={{ color: colors.textMuted, fontFamily: fonts.bodySemi, fontSize: 17, lineHeight: 24 }}>
                {t('yours.empty')}
              </Text>
            ) : null}
            <Button big variant="sunny" label={t('yours.write')} onPress={write} />
            {topics.length > 0 ? (
              <Button
                big
                label={t('yours.play', { count: topics.length })}
                onPress={() => router.push({ pathname: '/play', params: buildPlayParams(['yours'], 'light') })}
              />
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/topic-editor', params: { id: item.id } })}
            accessibilityRole="button"
            accessibilityLabel={item.text}
            accessibilityHint={t('yours.editHint')}
          >
            <Sticker
              bg={colors.surface}
              radius={radius.lg}
              shadow={4}
              faceStyle={[styles.row, { padding: spacing.md - 2, gap: spacing.md - 4 }]}
            >
              <FlameIcon size={18} color={categoryColor.yours} outline={colors.ink} />
              <View style={styles.grow}>
                <Text style={{ color: colors.text, fontFamily: fonts.bodySemi, fontSize: 17, lineHeight: 23 }}>
                  {item.text}
                </Text>
                {item.starter || item.followUp ? (
                  <Text style={{ color: colors.textMuted, fontFamily: fonts.body, fontSize: 13, marginTop: 4 }}>
                    {[item.starter ? t('yours.hasSpark') : null, item.followUp ? t('yours.hasFollowUp') : null]
                      .filter(Boolean)
                      .join(', ')}
                  </Text>
                ) : null}
              </View>
              <PencilIcon size={18} color={colors.textMuted} />
            </Sticker>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1 },
});
