import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';
import { SpeakerIcon } from '@/components/icons';
import { IconButton, ScreenHeader } from '@/components/ScreenHeader';
import { TopicCard } from '@/components/TopicCard';
import { useAppLanguage } from '@/i18n';
import { clampStop, isEndOfRoad, randomTrip, sparkScript, stopScript, tripById, trips } from '@/roadtrip/roadTrip';
import { useRoadTripActive } from '@/roadtrip/session';
import { useSpeech } from '@/roadtrip/useSpeech';
import { useSettings } from '@/store/settings';
import { useTrips } from '@/store/trips';
import { mix, useTheme } from '@/theme';

/**
 * One theme for the ride: stops go from light to deep, a passenger taps "Next stop" when
 * the talk fades (no timer). Optional read-aloud for the driver. The screen stays on and
 * the campfire sound rests while you're here.
 */
export default function TripScreen() {
  const { t } = useTranslation();
  const { colors, fonts, spacing, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const lang = useAppLanguage();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const trip = tripById(id) ?? trips[0];
  const [stop, setStop] = useState(0);
  const readAloud = useSettings((s) => s.readAloud);
  const update = useSettings((s) => s.update);
  const speech = useSpeech(lang);
  useKeepAwake();

  const setRoadTripActive = useRoadTripActive((s) => s.setActive);
  useEffect(() => {
    setRoadTripActive(true);
    return () => setRoadTripActive(false);
  }, [setRoadTripActive]);

  // A new theme (Another theme) starts at the first stop.
  useEffect(() => setStop(0), [trip.id]);

  const end = isEndOfRoad(trip, stop);
  const total = trip.stops.length;

  // Reaching the end of the road marks the theme as done on the theme list.
  const markCompleted = useTrips((s) => s.markCompleted);
  useEffect(() => {
    if (end) markCompleted(trip.id);
  }, [end, trip.id, markCompleted]);

  const read = () =>
    speech.say(stopScript(trip, stop, lang, { stop: (n) => t('trip.stopOf', { n, total }), end: t('trip.endTitle') }));

  // Read each stop when read-aloud is on (and right away when it's switched on).
  useEffect(() => {
    if (readAloud) read();
    else speech.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readAloud, stop, trip.id, lang]);

  const go = (to: number) => setStop(clampStop(trip, to));
  const night = mode === 'night';
  const screen = night ? mix(trip.color, colors.background, 0.8) : trip.color;
  /** Progress line color: ink by day, cream at night (ink would vanish on the dark screen). */
  const fg = night ? colors.text : colors.ink;

  const speaker = (
    <IconButton
      label={readAloud ? t('trip.readAloudOff') : t('trip.readAloudOn')}
      onPress={() => update({ readAloud: !readAloud })}
    >
      <SpeakerIcon on={readAloud} color={colors.text} />
    </IconButton>
  );

  return (
    <View style={[styles.root, { backgroundColor: screen }]}>
      <ScreenHeader title={trip.title[lang]} right={speaker} />

      <View style={[styles.progress, { paddingHorizontal: spacing.lg, gap: spacing.sm }]}>
        <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {trip.stops.map((_, i) => (
            <View key={i} style={[styles.dotCell, i === 0 && styles.firstDot]}>
              {i > 0 ? (
                <View style={[styles.line, { backgroundColor: i <= stop ? fg : mix(fg, screen, 0.6) }]} />
              ) : null}
              <View
                style={[
                  styles.dot,
                  {
                    borderColor: fg,
                    backgroundColor: i < stop || end ? fg : i === stop ? colors.sunny : colors.surface,
                    transform: [{ scale: i === stop && !end ? 1.35 : 1 }],
                  },
                ]}
              />
            </View>
          ))}
        </View>
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: night ? colors.text : colors.ink, fontFamily: fonts.bodyBold, fontSize: 15, textAlign: 'center' }}
        >
          {end ? t('trip.endProgress') : t('trip.stopOf', { n: stop + 1, total })}
        </Text>
      </View>

      <View style={[styles.center, { paddingHorizontal: spacing.lg - 4 }]}>
        {end ? (
          <TopicCard text={t('trip.endTitle')} secondary={t('trip.endBody', { theme: trip.title[lang] })} />
        ) : (
          <TopicCard
            key={`${trip.id}-${stop}`}
            text={trip.stops[stop].text[lang]}
            secondary={stop === 0 ? trip.intro[lang] : undefined}
            spark={trip.stops[stop].spark[lang]}
            sparkLabel={t('play.spark')}
            sparkColor={trip.color}
            onSparkOpen={() => {
              if (readAloud) speech.say(sparkScript(trip, stop, lang, t('trip.sparkLeadIn')));
            }}
          />
        )}
      </View>

      <View style={{ paddingHorizontal: spacing.lg - 4, paddingBottom: insets.bottom + spacing.md, gap: spacing.sm + 4 }}>
        {readAloud && !end ? (
          <View style={styles.readAgain}>
            <Button variant="secondary" label={t('trip.readAgain')} onPress={read} />
          </View>
        ) : null}
        <View style={[styles.controls, { gap: spacing.sm + 4 }]}>
          {end ? (
            <>
              <View style={styles.wide}>
                <Button
                  big
                  variant="sunny"
                  label={t('trip.another')}
                  onPress={() => router.setParams({ id: randomTrip(trip.id).id })}
                />
              </View>
              <View style={styles.grow}>
                <Button big variant="secondary" label={t('trip.themes')} onPress={() => router.back()} />
              </View>
            </>
          ) : (
            <>
              <View style={styles.grow}>
                <Button
                  big
                  variant="secondary"
                  label={t('trip.previous')}
                  disabled={stop === 0}
                  onPress={() => go(stop - 1)}
                />
              </View>
              <View style={styles.wide}>
                <Button
                  big
                  label={stop === total - 1 ? t('trip.finish') : t('trip.next')}
                  onPress={() => go(stop + 1)}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center' },
  progress: { paddingTop: 12 },
  dots: { flexDirection: 'row', alignItems: 'center' },
  dotCell: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  firstDot: { flex: 0 },
  line: { flex: 1, height: 3, marginHorizontal: 2 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3 },
  controls: { flexDirection: 'row', minHeight: 64 },
  grow: { flex: 1 },
  wide: { flex: 1.6 },
  readAgain: { alignSelf: 'center' },
});
