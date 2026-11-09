import { ReactNode, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { FlameIcon } from './icons';
import { PressableSticker, Sticker } from './Sticker';

type Props = {
  text: string;
  secondary?: string;
  /** A way in, hidden behind a "Need a spark?" button until tapped. Remount the card (key) per topic. */
  spark?: string;
  /** Label for the spark button, e.g. "Need a spark?". */
  sparkLabel?: string;
  /** Flame color on the spark button (the category color). */
  sparkColor?: string;
  /** Shown below the topic after time is added; fades in when it changes. */
  followUp?: string;
  /** Background of the follow-up pill (a soft tint of the category color). */
  followUpBg?: string;
  dimmed?: boolean;
  /** Called when someone opens the spark (road trip reads it aloud). */
  onSparkOpen?: () => void;
  /** Overlaid on the card's top corners (heart and share); not dimmed when paused. */
  corners?: ReactNode;
  children?: ReactNode;
};

/** The one big sticker card in the middle of the screen. */
export function TopicCard({
  text,
  secondary,
  spark,
  sparkLabel,
  sparkColor,
  followUp,
  followUpBg,
  dimmed,
  onSparkOpen,
  corners,
  children,
}: Props) {
  const { colors, fonts, spacing, radius, sticker } = useTheme();
  const [sparkOpen, setSparkOpen] = useState(false);
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
        {spark && !sparkOpen ? (
          <View style={styles.sparkButton}>
            <PressableSticker
              onPress={() => {
                setSparkOpen(true);
                onSparkOpen?.();
              }}
              accessibilityRole="button"
              accessibilityLabel={sparkLabel}
              bg={colors.background}
              radius={radius.pill}
              shadow={sticker.shadowSmall}
              faceStyle={styles.sparkFace}
              hitSlop={8}
            >
              <FlameIcon size={16} color={sparkColor ?? colors.accent} outline={colors.ink} />
              <Text style={{ color: colors.text, fontFamily: fonts.bodyBold, fontSize: 15 }}>{sparkLabel}</Text>
            </PressableSticker>
          </View>
        ) : null}
        {spark && sparkOpen ? (
          <Animated.View entering={FadeIn.duration(400)} style={styles.sparkText} accessibilityLiveRegion="polite">
            <FlameIcon size={16} color={sparkColor ?? colors.accent} outline={colors.ink} />
            <Text style={{ flexShrink: 1, color: colors.textMuted, fontFamily: fonts.bodySemi, fontSize: 16, lineHeight: 22, textAlign: 'center' }}>
              {spark}
            </Text>
          </Animated.View>
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
  sparkButton: { alignSelf: 'center' },
  sparkFace: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, minHeight: 40 },
  sparkText: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 8, paddingHorizontal: 4 },
});
