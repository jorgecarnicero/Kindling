import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { TimerRing } from '@/components/TimerRing';
import { TopicCard } from '@/components/TopicCard';
import { categoryLabel, depthLabel } from '@/data/labels';
import { useTimer } from '@/hooks/useTimer';
import { useTopicDeck } from '@/hooks/useTopicDeck';
import { useTheme } from '@/theme';

// Temporary review mode: all topics, EN with ES below, plus the timer ring and
// plain controls to try it. Step 4 turns this into the real play screen
// (time's-up prompt, follow-ups, haptics, chime, tap/swipe gestures).
export default function Play() {
  const { colors, spacing } = useTheme();
  const deck = useTopicDeck({});
  const timer = useTimer();

  const next = () => {
    deck.next();
    timer.reset();
  };

  const statusText =
    timer.status === 'done' ? "Time's up" : timer.status === 'paused' ? 'Paused' : `${deck.remaining} left`;

  return (
    <View style={[styles.root, { backgroundColor: colors.background, padding: spacing.lg, gap: spacing.lg }]}>
      {deck.current ? (
        <>
          <TimerRing timer={timer.state}>
            <TopicCard
              eyebrow={`${categoryLabel[deck.current.category]} · ${depthLabel[deck.current.depth]}`}
              text={deck.current.text.en}
              secondary={deck.current.text.es}
            />
          </TimerRing>
          <Text style={{ color: timer.status === 'done' ? colors.accent : colors.textMuted }}>
            {deck.current.id} · {statusText}
            {timer.extensions > 0 ? ` · +${timer.extensions} min` : ''}
          </Text>
          <View style={[styles.row, { gap: spacing.sm }]}>
            <View style={styles.grow}>
              <Button
                label={timer.status === 'paused' ? 'Resume' : 'Pause'}
                variant="secondary"
                onPress={timer.toggle}
              />
            </View>
            <View style={styles.grow}>
              <Button label="+1 min" variant="secondary" onPress={timer.addMinute} />
            </View>
          </View>
          <View style={styles.stretch}>
            <Button label="Next" onPress={next} />
          </View>
        </>
      ) : (
        <>
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignSelf: 'stretch' },
  grow: { flex: 1 },
  stretch: { alignSelf: 'stretch' },
});
