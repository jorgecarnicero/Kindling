import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle, type PressableProps } from 'react-native';
import { useTheme } from '@/theme';

type Look = {
  /** Fill color of the sticker face. */
  bg: string;
  radius?: number;
  /** Offset of the solid shadow; 0 = none. */
  shadow?: number;
  /** Extra glow color (night mode accents). */
  glow?: string;
  style?: StyleProp<ViewStyle>;
  /** Style for the face itself (padding, layout). */
  faceStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

/**
 * The Matchbox sticker: a face with a thick ink outline and a solid offset shadow.
 * The shadow is a real shape behind the face (Android can't draw a hard colored shadow).
 */
export function Sticker({ bg, radius, shadow, glow, style, faceStyle, children }: Look) {
  const t = useTheme();
  const r = radius ?? t.radius.lg;
  const s = shadow ?? t.sticker.shadow;
  return (
    <View style={[{ marginRight: s, marginBottom: s }, style]}>
      {s > 0 ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { top: s, left: s, right: -s, bottom: -s, borderRadius: r, backgroundColor: t.colors.ink }]}
        />
      ) : null}
      <View
        style={[
          {
            backgroundColor: bg,
            borderRadius: r,
            borderWidth: t.sticker.border,
            borderColor: t.colors.ink,
            ...(glow
              ? { shadowColor: glow, shadowOpacity: 0.6, shadowRadius: 16, shadowOffset: { width: 0, height: 0 } }
              : null),
          },
          faceStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

type PressableStickerProps = Omit<Look, 'style'> &
  Omit<PressableProps, 'style' | 'children'> & { style?: StyleProp<ViewStyle>; children?: ReactNode; selected?: boolean };

/**
 * A pressable sticker: pressing (or being selected) pushes the face onto its shadow,
 * like pressing a real sticker flat.
 */
export function PressableSticker({ bg, radius, shadow, glow, style, faceStyle, children, selected, disabled, ...rest }: PressableStickerProps) {
  const t = useTheme();
  const s = shadow ?? t.sticker.shadow;
  return (
    <Pressable disabled={disabled} style={[{ opacity: disabled ? 0.45 : 1 }, style]} {...rest}>
      {({ pressed }) => {
        const down = pressed || selected;
        return (
          <Sticker
            bg={bg}
            radius={radius}
            shadow={s}
            glow={glow}
            faceStyle={[faceStyle, down ? { transform: [{ translateX: s - 1 }, { translateY: s - 1 }] } : null]}
          >
            {children}
          </Sticker>
        );
      }}
    </Pressable>
  );
}
