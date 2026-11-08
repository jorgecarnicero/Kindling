import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { TopicCard } from '@/components/TopicCard';
import { categoryLabel, depthLabel } from '@/data/labels';
import { useTopicDeck } from '@/hooks/useTopicDeck';
import { useTheme } from '@/theme';

// Temporary review mode (step 2): draws from every topic and shows EN with ES below
// so the bank can be reviewed on a phone. Timer, filters and i18n come in later steps.
export default function Play() {
  const { colors, spacing } = useTheme();
  const deck = useTopicDeck({});

  return (
    <View style={[styles.root, { backgroundColor: colors.background, padding: spacing.lg, gap: spacing.lg }]}>
      {deck.current ? (
        <>
          <TopicCard
            eyebrow={`${categoryLabel[deck.current.category]} · ${depthLabel[deck.current.depth]}`}
            text={deck.current.text.en}
            secondary={deck.current.text.es}
          />
          <Text style={{ color: colors.textMuted }}>
            {deck.current.id} · {deck.remaining} left
          </Text>
          <View style={styles.actions}>
            <Button label="Next" onPress={deck.next} />
          </View>
        </>
      ) : (
        <>
          <TopicCard text="You've covered them all" secondary="Shuffle the same topics again, or bring in a new category." />
          <View style={[styles.actions, { gap: spacing.md }]}>
            <Button label="Shuffle again" onPress={deck.shuffleAgain} />
            {deck.mixInOptions.map((c) => (
              <Button key={c} label={`Mix in ${categoryLabel[c]}`} variant="secondary" onPress={() => deck.addCategory(c)} />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  actions: { alignSelf: 'stretch' },
});
