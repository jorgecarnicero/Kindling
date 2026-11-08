import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';
import { CategoryTile } from '@/components/CategoryTile';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ChoiceRow } from '@/components/SettingRow';
import { topics } from '@/data/topics';
import { CATEGORIES, DEPTHS, type Category } from '@/data/types';
import { matches } from '@/deck/deck';
import { buildPlayParams, parsePlayParams } from '@/deck/playParams';
import { useSelection } from '@/store/selection';
import { useTheme } from '@/theme';

/** Pairs of categories for a two-column grid. */
const ROWS: Category[][] = CATEGORIES.reduce<Category[][]>((rows, c, i) => {
  if (i % 2 === 0) rows.push([c]);
  else rows[rows.length - 1].push(c);
  return rows;
}, []);

/** Pick a vibe: categories (any number; none = all) and an "up to" depth. */
export default function Pick() {
  const { t } = useTranslation();
  const { colors, fonts, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { categories, maxDepth, toggleCategory, clearCategories, setMaxDepth } = useSelection();

  const params = buildPlayParams(categories, maxDepth);
  const { filter } = parsePlayParams(params);
  const count = topics.filter((tp) => matches(tp, filter)).length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={t('home.categories')}
        subtitle={categories.length ? t('home.categoriesSome', { count: categories.length }) : t('home.categoriesAll')}
        right={
          categories.length ? (
            <Pressable onPress={clearCategories} hitSlop={12} accessibilityRole="button">
              <Text style={{ color: colors.text, fontFamily: fonts.bodyBold, textDecorationLine: 'underline' }}>{t('home.clear')}</Text>
            </Pressable>
          ) : null
        }
      />

      <ScrollView contentContainerStyle={{ padding: spacing.lg - 4, paddingTop: spacing.md, gap: spacing.lg }}>
        <View style={{ gap: spacing.sm + 4 }}>
          {ROWS.map((row) => (
            <View key={row[0]} style={[styles.row, { gap: spacing.sm + 4 }]}>
              {row.map((c) => (
                <CategoryTile
                  key={c}
                  category={c}
                  label={t(`category.${c}`)}
                  hint={t(`categoryHint.${c}`)}
                  selected={categories.includes(c)}
                  onPress={() => toggleCategory(c)}
                />
              ))}
              {row.length === 1 ? <View style={styles.grow} /> : null}
            </View>
          ))}
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text accessibilityRole="header" style={{ color: colors.text, fontFamily: fonts.display, fontSize: 22 }}>
            {t('home.depth')}
          </Text>
          <ChoiceRow
            value={maxDepth}
            onChange={setMaxDepth}
            options={DEPTHS.map((d) => ({ value: d, label: t(`depth.${d}`) }))}
          />
          <Text style={{ color: colors.textMuted, fontFamily: fonts.bodySemi, fontSize: 14 }}>{t(`depthHint.${maxDepth}`)}</Text>
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: spacing.lg - 4, paddingTop: spacing.sm, paddingBottom: insets.bottom + spacing.md, gap: spacing.sm }}>
        {count === 0 ? (
          <Text style={{ color: colors.textMuted, fontFamily: fonts.bodySemi, textAlign: 'center' }}>{t('home.noTopics')}</Text>
        ) : null}
        <View style={[styles.row, { gap: spacing.sm + 2 }]}>
          <View style={{ flex: 2 }}>
            <Button
              big
              label={t('home.startCount', { count })}
              disabled={count === 0}
              onPress={() => router.push({ pathname: '/play', params })}
            />
          </View>
          <View style={styles.grow}>
            <Button
              big
              variant="sunny"
              label={t('home.surprise')}
              onPress={() => router.push({ pathname: '/play', params: { source: 'surprise' } })}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row' },
  grow: { flex: 1 },
});
