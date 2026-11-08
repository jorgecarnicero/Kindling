import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';
import { CategoryTile } from '@/components/CategoryTile';
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

export default function Home() {
  const { t } = useTranslation();
  const { colors, spacing, fontSize } = useTheme();
  const insets = useSafeAreaInsets();
  const { categories, maxDepth, toggleCategory, clearCategories, setMaxDepth } = useSelection();

  const params = buildPlayParams(categories, maxDepth);
  const { filter } = parsePlayParams(params);
  const count = topics.filter((tp) => matches(tp, filter)).length;

  const sectionTitle = [styles.sectionTitle, { color: colors.accent }];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xl,
          gap: spacing.lg,
        }}
      >
        <View>
          <Text style={[styles.title, { color: colors.text, fontSize: fontSize.display }]}>Kindling</Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.body, marginTop: spacing.xs }}>
            {t('home.tagline')}
          </Text>
        </View>

        <View style={{ gap: spacing.sm }}>
          <View style={styles.sectionHead}>
            <Text style={sectionTitle}>{t('home.categories').toUpperCase()}</Text>
            {categories.length ? (
              <Pressable onPress={clearCategories} hitSlop={12} accessibilityRole="button">
                <Text style={{ color: colors.accent, fontWeight: '600' }}>{t('home.clear')}</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={{ color: colors.textMuted }}>
            {categories.length ? t('home.categoriesSome', { count: categories.length }) : t('home.categoriesAll')}
          </Text>
          {ROWS.map((row) => (
            <View key={row[0]} style={[styles.row, { gap: spacing.sm }]}>
              {row.map((c) => (
                <CategoryTile
                  key={c}
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
          <Text style={sectionTitle}>{t('home.depth').toUpperCase()}</Text>
          <ChoiceRow
            value={maxDepth}
            onChange={setMaxDepth}
            options={DEPTHS.map((d) => ({ value: d, label: t(`depth.${d}`) }))}
          />
          <Text style={{ color: colors.textMuted }}>{t(`depthHint.${maxDepth}`)}</Text>
        </View>

        <View style={[styles.row, { gap: spacing.sm }]}>
          <View style={styles.grow}>
            <Button label={t('home.favorites')} variant="secondary" onPress={() => router.push('/favorites')} />
          </View>
          <View style={styles.grow}>
            <Button label={t('home.settings')} variant="secondary" onPress={() => router.push('/settings')} />
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: insets.bottom + spacing.md,
            gap: spacing.sm,
          },
        ]}
      >
        {count === 0 ? (
          <Text style={{ color: colors.textMuted, textAlign: 'center' }}>{t('home.noTopics')}</Text>
        ) : null}
        <Button
          label={t('home.startCount', { count })}
          disabled={count === 0}
          onPress={() => router.push({ pathname: '/play', params })}
        />
        <Button
          label={t('home.surprise')}
          variant="secondary"
          onPress={() => router.push({ pathname: '/play', params: { source: 'surprise' } })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  title: { fontWeight: '800', letterSpacing: -0.5 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 1.2 },
  row: { flexDirection: 'row' },
  grow: { flex: 1 },
  footer: { borderTopWidth: StyleSheet.hairlineWidth },
});
