import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/theme';

type Props = {
  eyebrow?: string;
  text: string;
  secondary?: string;
  /** Shown below the topic after time is added; fades in when it changes. */
  followUp?: string;
  dimmed?: boolean;
  /** Overlaid on the card's top corners (e.g. heart and share); not dimmed when paused. */
  corners?: ReactNode;
  children?: ReactNode;
};

/** The one big card in the middle of the screen. */
export function TopicCard({ eyebrow, text, secondary, followUp, dimmed, corners, children }: Props) {
  const { colors, spacing, radius, fontSize } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.xl,
          // Room for the corner icons so they never overlap the eyebrow on tall cards.
          paddingTop: corners ? spacing.xxl + spacing.sm : spacing.xl,
        },
      ]}
    >
      <View style={{ gap: spacing.md, opacity: dimmed ? 0.55 : 1 }}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: colors.accent }]}>{eyebrow.toUpperCase()}</Text> : null}
        <Text style={[styles.text, { color: colors.text, fontSize: fontSize.title }]}>{text}</Text>
        {secondary ? (
          <Text style={{ color: colors.textMuted, fontSize: fontSize.body, textAlign: 'center' }}>{secondary}</Text>
        ) : null}
        {followUp ? (
          <Animated.Text
            key={followUp}
            entering={FadeIn.duration(500)}
            style={[styles.followUp, { color: colors.accent, fontSize: fontSize.body + 3 }]}
          >
            {followUp}
          </Animated.Text>
        ) : null}
        {children}
      </View>
      {corners}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignSelf: 'stretch', minHeight: 320, justifyContent: 'center', borderWidth: 1 },
  eyebrow: { fontSize: 13, fontWeight: '700', letterSpacing: 1.2, textAlign: 'center' },
  text: { fontWeight: '700', textAlign: 'center', lineHeight: 36 },
  followUp: { fontWeight: '600', textAlign: 'center', marginTop: 8 },
});
