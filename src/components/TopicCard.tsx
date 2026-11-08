import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';

type Props = {
  eyebrow?: string;
  text: string;
  secondary?: string;
  children?: ReactNode;
};

/** The one big card in the middle of the screen. */
export function TopicCard({ eyebrow, text, secondary, children }: Props) {
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
          gap: spacing.md,
        },
      ]}
    >
      {eyebrow ? (
        <Text style={[styles.eyebrow, { color: colors.accent }]}>{eyebrow.toUpperCase()}</Text>
      ) : null}
      <Text style={[styles.text, { color: colors.text, fontSize: fontSize.title }]}>{text}</Text>
      {secondary ? (
        <Text style={{ color: colors.textMuted, fontSize: fontSize.body, textAlign: 'center' }}>{secondary}</Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignSelf: 'stretch', minHeight: 320, justifyContent: 'center', borderWidth: 1 },
  eyebrow: { fontSize: 13, fontWeight: '700', letterSpacing: 1.2, textAlign: 'center' },
  text: { fontWeight: '700', textAlign: 'center', lineHeight: 36 },
});
