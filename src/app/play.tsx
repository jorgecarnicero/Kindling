import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { TimerRing } from '@/components/TimerRing';
import { TopicCard } from '@/components/TopicCard';
import { QUESTION_DURATION_MS } from '@/config/dev';
import { categoryLabel, depthLabel } from '@/data/labels';
import { followUpFor } from '@/deck/deck';
import { useTimesUpFeedback } from '@/feedback/useTimesUpFeedback';
import { useTimer } from '@/hooks/useTimer';
import { useTopicDeck } from '@/hooks/useTopicDeck';
import { deviceLanguage } from '@/i18n/deviceLanguage';
import { useTheme } from '@/theme';

// UI strings are English for now; they move to i18n (EN/ES) in step 5.
// Draws from every topic until Home gets the category/depth picker.
export default function Play() {
  const { colors, spacing, fontSize } = useTheme();
  const lang = useMemo(deviceLanguage, []);
  const deck = useTopicDeck({});
  const timesUp = useTimesUpFeedback();
  const timer = useTimer(QUESTION_DURATION_MS, { onDone: timesUp });

  const next = () => {
    deck.next();
    timer.reset();
  };

  if (!deck.current) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, padding: spacing.lg, gap: spacing.lg }]}>
        <TopicCard text="You've covered them all" secondary="Shuffle the same topics again, or bring in a new category." />
        <View style={[styles.stretch, { gap: spacing.md }]}>
          <Button
            label="Shuffle again"
            onPress={() => {
              deck.shuffleAgain();
              timer.reset();
            }}
          />
          {deck.mixInOptions.map((c) => (
            <Button
              key={c}
              label={`Mix in ${categoryLabel[c]}`}
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
  const { status } = timer;
  const done = status === 'done';
  const paused = status === 'paused';

  const hint = done ? "Time's up" : paused ? 'Paused · tap the card to resume' : 'Tap the card to pause';

  return (
    <View style={[styles.root, { backgroundColor: colors.background, padding: spacing.lg, gap: spacing.lg }]}>
      <Pressable
        style={styles.stretch}
        onPress={timer.toggle}
        disabled={done}
        accessibilityRole="button"
        accessibilityLabel={topic.text[lang]}
        accessibilityHint={paused ? 'Resumes the timer' : 'Pauses the timer'}
      >
        <TimerRing timer={timer.state}>
          <TopicCard
            eyebrow={`${categoryLabel[topic.category]} · ${depthLabel[topic.depth]}`}
            text={topic.text[lang]}
            followUp={followUpFor(topic, lang, timer.extensions)}
            dimmed={paused}
          />
        </TimerRing>
      </Pressable>

      <Text
        accessibilityLiveRegion="polite"
        style={{
          color: done ? colors.accent : colors.textMuted,
          fontSize: done ? fontSize.body + 3 : fontSize.body,
          fontWeight: done ? '700' : '400',
        }}
      >
        {hint}
      </Text>

      <View style={[styles.controls, { gap: spacing.sm }]}>
        {done ? (
          <>
            <View style={styles.grow}>
              <Button label="+1 min" onPress={timer.addMinute} />
            </View>
            <View style={styles.grow}>
              <Button label="Next" onPress={next} />
            </View>
          </>
        ) : (
          <>
            <View style={styles.grow}>
              <Button label={paused ? 'Resume' : 'Pause'} variant="secondary" onPress={timer.toggle} />
            </View>
            <View style={styles.grow}>
              <Button label="Skip" variant="secondary" onPress={next} />
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
