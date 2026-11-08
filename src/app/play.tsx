import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';
import { FlameIcon } from '@/components/icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TimerRing } from '@/components/TimerRing';
import { CardCornerActions } from '@/components/TopicActions';
import { TopicCard } from '@/components/TopicCard';
import { QUESTION_DURATION_MS } from '@/config/dev';
import { topics as allTopics } from '@/data/topics';
import { followUpFor } from '@/deck/deck';
import { parsePlayParams, type PlayParams } from '@/deck/playParams';
import { useTimesUpFeedback } from '@/feedback/useTimesUpFeedback';
import { useTimer } from '@/hooks/useTimer';
import { useTopicDeck } from '@/hooks/useTopicDeck';
import { useAppLanguage } from '@/i18n';
import { favoriteTopics, useFavorites } from '@/store/favorites';
import { useSettings } from '@/store/settings';
import { categoryColor, mix, playColors, useTheme } from '@/theme';

/** How long auto-advance waits at time's up before drawing the next card. */
const AUTO_ADVANCE_MS = 5_000;

// Params come from Pick (categories + max depth, or Surprise me) or Favorites; see
// src/deck/playParams.ts. The setup is read once when the screen opens.
export default function Play() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, fonts, spacing, mode } = theme;
  const insets = useSafeAreaInsets();
  const lang = useAppLanguage();
  const tapToPause = useSettings((s) => s.tapToPause);
  const autoAdvance = useSettings((s) => s.autoAdvance);
  const params = useLocalSearchParams<PlayParams>();
  const [setup] = useState(() => {
    const { source, filter } = parsePlayParams(params);
    const pool = source === 'favorites' ? favoriteTopics(useFavorites.getState().ids, allTopics) : allTopics;
    return { pool, filter };
  });
  const deck = useTopicDeck(setup.filter, setup.pool);
  const timesUp = useTimesUpFeedback();
  const timer = useTimer(QUESTION_DURATION_MS, { onDone: timesUp });

  const next = () => {
    deck.next();
    timer.reset();
  };

  // Auto-advance: at time's up, move on after a few seconds unless someone adds time
  // (which changes the status and cancels this).
  const { status } = timer;
  useEffect(() => {
    if (!autoAdvance || status !== 'done') return;
    const id = setTimeout(() => {
      deck.next();
      timer.reset();
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(id);
  }, [autoAdvance, status, deck.next, timer.reset]);

  const bottom = { paddingHorizontal: spacing.lg - 4, paddingBottom: insets.bottom + spacing.md };

  if (!deck.current) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <ScreenHeader />
        <View style={[styles.center, { padding: spacing.lg - 4 }]}>
          <TopicCard text={t('play.coveredTitle')} secondary={t('play.coveredBody')} />
        </View>
        <View style={[bottom, { gap: spacing.sm + 4 }]}>
          <Button
            big
            label={t('play.shuffleAgain')}
            onPress={() => {
              deck.shuffleAgain();
              timer.reset();
            }}
          />
          {deck.mixInOptions.map((c) => (
            <Button
              key={c}
              variant="secondary"
              label={t('play.mixIn', { category: t(`category.${c}`) })}
              onPress={() => {
                deck.addCategory(c);
                timer.reset();
              }}
            />
          ))}
        </View>
      </View>
    );
  }

  const topic = deck.current;
  const done = status === 'done';
  const paused = status === 'paused';
  const pc = playColors(topic.category, mode, colors);
  const night = mode === 'night';
  const catColor = categoryColor[topic.category];

  const hint = done
    ? autoAdvance
      ? t('play.autoAdvance')
      : t('play.timesUp')
    : paused
      ? tapToPause
        ? t('play.pausedTap')
        : t('play.paused')
      : tapToPause
        ? t('play.tapToPause')
        : ' ';

  const chip = (
    <View style={[styles.chip, { backgroundColor: pc.chip, borderColor: colors.ink }]}>
      <FlameIcon size={16} color={night ? colors.text : catColor} outline={colors.ink} />
      <Text style={{ color: pc.chipText, fontFamily: fonts.bodyBold, fontSize: 14 }}>{t(`category.${topic.category}`)}</Text>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: pc.screen }]}>
      <ScreenHeader right={chip} />

      <View style={[styles.center, { paddingHorizontal: spacing.lg - 8 }]}>
        <Pressable
          style={styles.stretch}
          onPress={timer.toggle}
          disabled={done || !tapToPause}
          accessibilityRole={tapToPause ? 'button' : undefined}
          accessibilityLabel={topic.text[lang]}
          accessibilityHint={tapToPause && !done ? (paused ? t('play.resumesHint') : t('play.pausesHint')) : undefined}
        >
          <TimerRing timer={timer.state} color={pc.ring} trackColor={pc.track}>
            <TopicCard
              text={topic.text[lang]}
              followUp={followUpFor(topic, lang, timer.extensions)}
              followUpBg={night ? catColor : mix(catColor, '#FFFFFF', 0.55)}
              dimmed={paused}
              corners={<CardCornerActions topic={topic} />}
            />
          </TimerRing>
        </Pressable>
      </View>

      <View style={[bottom, { gap: spacing.md }]}>
        <Text
          accessibilityLiveRegion="polite"
          style={{
            color: night ? (done ? colors.sunny : colors.textMuted) : colors.ink,
            fontFamily: done ? fonts.display : fonts.bodySemi,
            fontSize: done ? 19 : 15,
            textAlign: 'center',
          }}
        >
          {hint}
        </Text>
        <View style={[styles.controls, { gap: spacing.sm + 4 }]}>
          {done ? (
            <>
              <View style={styles.grow}>
                <Button big variant="sunny" label={t('play.addMinute')} onPress={timer.addMinute} />
              </View>
              <View style={styles.grow}>
                <Button big variant="secondary" label={t('play.next')} onPress={next} />
              </View>
            </>
          ) : (
            <>
              <View style={styles.grow}>
                <Button big variant="secondary" label={paused ? t('play.resume') : t('play.pause')} onPress={timer.toggle} />
              </View>
              <View style={styles.grow}>
                <Button big variant="secondary" label={t('play.skip')} onPress={next} />
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
  stretch: { alignSelf: 'stretch' },
  // Fixed height so the layout doesn't jump when the buttons swap at time's up.
  controls: { flexDirection: 'row', minHeight: 64 },
  grow: { flex: 1 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 3 },
});
