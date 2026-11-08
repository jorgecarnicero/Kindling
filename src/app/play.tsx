import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';
import { TimerRing } from '@/components/TimerRing';
import { CardCornerActions } from '@/components/TopicActions';
import { TopicCard } from '@/components/TopicCard';
import { QUESTION_DURATION_MS } from '@/config/dev';
import { topics as allTopics } from '@/data/topics';
import { favoriteTopics, useFavorites } from '@/store/favorites';
import { followUpFor } from '@/deck/deck';
import { parsePlayParams, type PlayParams } from '@/deck/playParams';
import { useTimesUpFeedback } from '@/feedback/useTimesUpFeedback';
import { useTimer } from '@/hooks/useTimer';
import { useTopicDeck } from '@/hooks/useTopicDeck';
import { useAppLanguage } from '@/i18n';
import { useSettings } from '@/store/settings';
import { useTheme } from '@/theme';

/** How long auto-advance waits at time's up before drawing the next card. */
const AUTO_ADVANCE_MS = 5_000;

// Params come from Home (categories + max depth, or Surprise me) or Favorites; see
// src/deck/playParams.ts. The setup is read once when the screen opens.
export default function Play() {
  const { t } = useTranslation();
  const { colors, spacing, fontSize } = useTheme();
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

  if (!deck.current) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, padding: spacing.lg, gap: spacing.lg }]}>
        <TopicCard text={t('play.coveredTitle')} secondary={t('play.coveredBody')} />
        <View style={[styles.stretch, { gap: spacing.md }]}>
          <Button
            label={t('play.shuffleAgain')}
            onPress={() => {
              deck.shuffleAgain();
              timer.reset();
            }}
          />
          {deck.mixInOptions.map((c) => (
            <Button
              key={c}
              label={t('play.mixIn', { category: t(`category.${c}`) })}
              variant="secondary"
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

  return (
    <View style={[styles.root, { backgroundColor: colors.background, padding: spacing.lg, gap: spacing.lg }]}>
      <Pressable
        style={styles.stretch}
        onPress={timer.toggle}
        disabled={done || !tapToPause}
        accessibilityRole={tapToPause ? 'button' : undefined}
        accessibilityLabel={topic.text[lang]}
        accessibilityHint={tapToPause && !done ? (paused ? t('play.resumesHint') : t('play.pausesHint')) : undefined}
      >
        <TimerRing timer={timer.state}>
          <TopicCard
            eyebrow={`${t(`category.${topic.category}`)} · ${t(`depth.${topic.depth}`)}`}
            text={topic.text[lang]}
            followUp={followUpFor(topic, lang, timer.extensions)}
            dimmed={paused}
            corners={<CardCornerActions topic={topic} />}
          />
        </TimerRing>
      </Pressable>

      <Text
        accessibilityLiveRegion="polite"
        style={{
          color: done ? colors.accent : colors.textMuted,
          fontSize: done ? fontSize.body + 3 : fontSize.body,
          fontWeight: done ? '700' : '400',
          textAlign: 'center',
        }}
      >
        {hint}
      </Text>

      <View style={[styles.controls, { gap: spacing.sm }]}>
        {done ? (
          <>
            <View style={styles.grow}>
              <Button label={t('play.addMinute')} onPress={timer.addMinute} />
            </View>
            <View style={styles.grow}>
              <Button label={t('play.next')} onPress={next} />
            </View>
          </>
        ) : (
          <>
            <View style={styles.grow}>
              <Button label={paused ? t('play.resume') : t('play.pause')} variant="secondary" onPress={timer.toggle} />
            </View>
            <View style={styles.grow}>
              <Button label={t('play.skip')} variant="secondary" onPress={next} />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stretch: { alignSelf: 'stretch' },
  // Fixed height so the layout doesn't jump when the buttons swap at time's up.
  controls: { flexDirection: 'row', alignSelf: 'stretch', minHeight: 52 },
  grow: { flex: 1 },
});
