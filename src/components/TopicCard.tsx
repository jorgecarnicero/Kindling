import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { Sticker } from './Sticker';

type Props = {
  text: string;
  secondary?: string;
  /** Shown below the topic after time is added; fades in when it changes. */
  followUp?: string;
  /** Background of the follow-up pill (a soft tint of the category color). */
  followUpBg?: string;
  dimmed?: boolean;
  /** Overlaid on the card's top corners (heart and share); not dimmed when paused. */
  corners?: ReactNode;
  children?: ReactNode;
};

/** The one big sticker card in the middle of the screen. */
export function TopicCard({ text, secondary, followUp, followUpBg, dimmed, corners, children }: Props) {
  const { colors, fonts, spacing, radius } = useTheme();
  const long = text.length > 90;
  return (
    <Sticker
      bg={colors.surface}
      radius={radius.lg}
      shadow={6}
      faceStyle={[styles.card, { padding: spacing.lg, paddingTop: corners ? 64 : spacing.lg }]}
    >
      <View style={{ gap: spacing.md + 4, opacity: dimmed ? 0.5 : 1 }}>
        <Text
          style={{
            color: colors.text,
            fontFamily: fonts.display,
            fontSize: long ? 26 : text.length > 50 ? 30 : 40,
            lineHeight: long ? 30 : text.length > 50 ? 34 : 42,
            letterSpacing: -0.6,
            textAlign: 'center',
          }}
        >
          {text}
        </Text>
        {secondary ? (
          <Text style={{ color: colors.textMuted, fontFamily: fonts.bodySemi, fontSize: 17, textAlign: 'center' }}>{secondary}</Text>
        ) : null}
        {followUp ? (
          <Animated.View
            key={followUp}
            entering={FadeIn.duration(500)}
            style={[styles.followUp, { backgroundColor: followUpBg ?? colors.background }]}
          >
            <Text style={{ color: colors.onColor, fontFamily: fonts.bodyBold, fontSize: 17, lineHeight: 22, textAlign: 'center' }}>
              {followUp}
            </Text>
          </Animated.View>
        ) : null}
        {children}
      </View>
      {corners}
    </Sticker>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 340, justifyContent: 'center' },
  followUp: { alignSelf: 'center', maxWidth: 280, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
});
