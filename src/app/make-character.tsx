import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Character } from '@/characters/Character';
import { itemsFor, type Slot } from '@/characters/catalog';
import { FireScene } from '@/characters/FireScene';
import { isUnlocked, randomLook } from '@/characters/unlocks';
import { Button } from '@/components/Button';
import { CheckIcon, DiceIcon } from '@/components/icons';
import { IconButton, ScreenHeader } from '@/components/ScreenHeader';
import { PressableSticker } from '@/components/Sticker';
import { useAppLanguage } from '@/i18n';
import { useLook, useProfile, useProgress } from '@/store/profile';
import { useTheme } from '@/theme';

/** The first-time step only covers the basics; hats, glasses and more live in the backpack. */
const BASICS: readonly Slot[] = ['skin', 'hair', 'hairColor', 'hoodie'];

/** "Make your character": the first time the owner opens their character. */
export default function MakeCharacter() {
  const { t } = useTranslation();
  const { colors, fonts, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const look = useLook();
  const wear = useProfile((s) => s.wear);
  const setLook = useProfile((s) => s.setLook);
  const finishSetup = useProfile((s) => s.finishSetup);
  const progress = useProgress();

  const done = () => {
    finishSetup();
    router.replace('/backpack');
  };

  const random = (
    <IconButton label={t('me.random')} onPress={() => setLook(randomLook(progress, look, BASICS))}>
      <DiceIcon color={colors.text} />
    </IconButton>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('me.make.title')} subtitle={t('me.make.subtitle')} right={random} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg - 4, paddingTop: spacing.md, gap: spacing.md }}>
        <FireScene look={look} label={t('me.scene')} height={200} />
        {BASICS.map((slot) => (
          <View key={slot} style={{ gap: spacing.sm }}>
            <Text style={{ color: colors.text, fontFamily: fonts.bodyBold, fontSize: 17 }}>{t(`me.slot.${slot}`)}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.sm + 2, paddingVertical: 4, paddingRight: 8 }}
            >
              {itemsFor(slot)
                .filter((i) => isUnlocked(i.unlock, progress))
                .map((item) => (
                  <Choice
                    key={item.id}
                    slot={slot}
                    id={item.id}
                    color={item.color}
                    name={item.name}
                    on={look[slot] === item.id}
                    onPress={() => wear(slot, item.id)}
                  />
                ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
      <View style={{ paddingHorizontal: spacing.lg - 4, paddingTop: spacing.sm, paddingBottom: insets.bottom + spacing.md }}>
        <Button big label={t('me.make.done')} onPress={done} />
      </View>
    </View>
  );
}

type ChoiceProps = {
  slot: Slot;
  id: string;
  color?: string;
  name: Record<string, string>;
  on: boolean;
  onPress: () => void;
};

/** A color swatch (skin, hair color, hoodie) or a little head (hair style). */
function Choice({ slot, id, color, name, on, onPress }: ChoiceProps) {
  const { colors, radius, sticker } = useTheme();
  const lang = useAppLanguage();
  const look = useLook();
  const swatch = slot !== 'hair';
  return (
    <PressableSticker
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: on }}
      accessibilityLabel={name[lang]}
      bg={swatch ? (color ?? colors.surface) : on ? colors.sunny : colors.surface}
      radius={swatch ? radius.pill : radius.md}
      shadow={sticker.shadowSmall}
      selected={on}
      faceStyle={swatch ? styles.swatch : styles.hair}
    >
      {swatch ? null : <Character look={{ ...look, hair: id }} size={60} crop="portrait" ink={colors.ink} />}
      {on ? (
        <View style={[styles.check, { backgroundColor: colors.ink }, swatch ? styles.checkCenter : null]}>
          <CheckIcon size={14} color={colors.sunny} />
        </View>
      ) : null}
    </PressableSticker>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  swatch: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  hair: { width: 64, height: 64, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  check: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCenter: { top: 12, right: 12 },
});
