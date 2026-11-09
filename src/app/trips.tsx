import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';
import { CheckIcon, RoadIcon } from '@/components/icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PressableSticker } from '@/components/Sticker';
import { useAppLanguage } from '@/i18n';
import { randomTrip, trips } from '@/roadtrip/roadTrip';
import { useTrips } from '@/store/trips';
import { useTheme } from '@/theme';

/** Road trip: pick one big theme for the ride (or let the app pick). */
export default function Trips() {
  const { t } = useTranslation();
  const { colors, fonts, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const lang = useAppLanguage();
  const completed = useTrips((s) => s.completed);

  const go = (id: string) => router.push({ pathname: '/trip', params: { id } });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('trip.title')} subtitle={t('trip.subtitle')} />

      <ScrollView contentContainerStyle={{ padding: spacing.lg - 4, paddingTop: spacing.md, gap: spacing.sm + 4 }}>
        {trips.map((trip) => {
          const done = completed.includes(trip.id);
          return (
          <PressableSticker
            key={trip.id}
            onPress={() => go(trip.id)}
            accessibilityRole="button"
            accessibilityLabel={`${trip.title[lang]}. ${trip.intro[lang]}${done ? `. ${t('trip.done')}` : ''}`}
            accessibilityHint={t('trip.stops', { count: trip.stops.length })}
            bg={trip.color}
            radius={radius.lg}
            faceStyle={[styles.tile, { padding: spacing.md, gap: spacing.md }]}
          >
            {/* Done themes: the circle fills with ink and shows a check. */}
            <View style={[styles.badge, { backgroundColor: done ? colors.ink : colors.surface, borderColor: colors.ink }]}>
              {done ? <CheckIcon color={trip.color} /> : <RoadIcon color={colors.text} />}
            </View>
            <View style={styles.grow}>
              <Text style={{ color: colors.onColor, fontFamily: fonts.display, fontSize: 24, lineHeight: 28 }}>
                {trip.title[lang]}
              </Text>
              <Text style={{ color: colors.onColor, fontFamily: fonts.bodySemi, fontSize: 15, lineHeight: 20 }}>
                {trip.intro[lang]}
              </Text>
            </View>
            <Text style={{ color: colors.onColor, fontFamily: fonts.bodyBold, fontSize: 14 }}>
              {done ? t('trip.done') : t('trip.stops', { count: trip.stops.length })}
            </Text>
          </PressableSticker>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: spacing.lg - 4, paddingTop: spacing.sm, paddingBottom: insets.bottom + spacing.md }}>
        <Button big variant="sunny" label={t('trip.surprise')} onPress={() => go(randomTrip().id)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  grow: { flex: 1 },
  tile: { flexDirection: 'row', alignItems: 'center' },
  badge: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
});
