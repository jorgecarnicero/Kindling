import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Character } from '@/characters/Character';
import { FireScene } from '@/characters/FireScene';
import { itemKey, itemsFor, SLOTS, type Item, type Slot, type Unlock } from '@/characters/catalog';
import { foundCount, isUnlocked, newItems, randomLook } from '@/characters/unlocks';
import { CheckIcon, DiceIcon, LockIcon } from '@/components/icons';
import { IconButton, ScreenHeader } from '@/components/ScreenHeader';
import { PressableSticker } from '@/components/Sticker';
import type { Lang } from '@/data/types';
import { useAppLanguage } from '@/i18n';
import { tripById } from '@/roadtrip/roadTrip';
import { useLook, useProfile, useProgress } from '@/store/profile';
import { mix, useTheme } from '@/theme';

/** Slots whose change shows best on the whole body rather than the face. */
const BUST: readonly Slot[] = ['hoodie', 'hold'];

function unlockText(u: Unlock, t: TFunction, lang: Lang): string {
  switch (u.kind) {
    case 'trip':
      return t('me.unlock.trip', { theme: tripById(u.trip)?.title[lang] ?? u.trip });
    case 'trips':
      return t('me.unlock.trips', { count: u.count });
    case 'days':
      return t('me.unlock.days', { count: u.count });
    case 'free':
      return '';
  }
}

/** Backpack: dress up your character with what you've found; locked items say how to get them. */
export default function Backpack() {
  const { t } = useTranslation();
  const { colors, fonts, spacing, radius, sticker } = useTheme();
  const lang = useAppLanguage();
  const look = useLook();
  const wear = useProfile((s) => s.wear);
  const markSeen = useProfile((s) => s.markSeen);
  const setLook = useProfile((s) => s.setLook);
  const progress = useProgress();
  const [slot, setSlot] = useState<Slot>('hat');

  // "New" badges stay for this visit; leaving the backpack marks them as seen.
  const [fresh] = useState(() => new Set(newItems(progress, useProfile.getState().seen).map(itemKey)));
  useEffect(() => () => markSeen([...fresh]), [fresh, markSeen]);

  const { found, total } = foundCount(progress);
  const items = useMemo(() => itemsFor(slot), [slot]);
  const slotHasNew = (s: Slot) => itemsFor(s).some((i) => fresh.has(itemKey(i)));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={t('me.title')}
        subtitle={t('me.found', { found, total })}
        right={
          <IconButton label={t('me.random')} onPress={() => setLook(randomLook(progress, look))}>
            <DiceIcon color={colors.text} />
          </IconButton>
        }
      />

      <ScrollView contentContainerStyle={{ padding: spacing.lg - 4, paddingTop: spacing.md, gap: spacing.md }}>
        <FireScene look={look} label={t('me.scene')} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingRight: 8 }}>
          {SLOTS.map((s) => {
            const on = s === slot;
            const dot = slotHasNew(s);
            return (
              <PressableSticker
                key={s}
                onPress={() => setSlot(s)}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                accessibilityLabel={dot ? `${t(`me.slot.${s}`)}, ${t('me.newItems')}` : t(`me.slot.${s}`)}
                bg={on ? colors.sunny : colors.surface}
                radius={radius.pill}
                shadow={sticker.shadowSmall}
                selected={on}
                faceStyle={styles.tab}
              >
                <Text style={{ color: on ? colors.onColor : colors.text, fontFamily: fonts.bodyBold, fontSize: 15 }}>
                  {t(`me.slot.${s}`)}
                </Text>
                {dot ? <View style={[styles.dot, { backgroundColor: colors.accent, borderColor: colors.ink }]} /> : null}
              </PressableSticker>
            );
          })}
        </ScrollView>

        <View style={styles.grid}>
          {items.map((item) => (
            <Tile
              key={itemKey(item)}
              item={item}
              owned={isUnlocked(item.unlock, progress)}
              wearing={look[slot] === item.id}
              isNew={fresh.has(itemKey(item))}
              preview={{ ...look, [slot]: item.id }}
              crop={BUST.includes(slot) ? 'bust' : 'head'}
              how={unlockText(item.unlock, t, lang)}
              name={item.name[lang]}
              onWear={() => wear(slot, item.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

type TileProps = {
  item: Item;
  owned: boolean;
  wearing: boolean;
  isNew: boolean;
  preview: Parameters<typeof Character>[0]['look'];
  crop: 'bust' | 'head';
  name: string;
  how: string;
  onWear: () => void;
};

function Tile({ owned, wearing, isNew, preview, crop, name, how, onWear }: TileProps) {
  const { t } = useTranslation();
  const { colors, fonts, radius, sticker } = useTheme();
  const status = !owned ? how : wearing ? t('me.wearing') : t('me.tapToWear');
  const bg = wearing ? colors.sunny : owned ? colors.surface : mix(colors.surface, colors.background, 0.6);
  const fg = wearing ? colors.onColor : colors.text;
  return (
    <PressableSticker
      onPress={owned ? onWear : undefined}
      accessibilityRole="button"
      accessibilityState={{ selected: wearing, disabled: !owned }}
      accessibilityLabel={`${name}, ${owned ? status : `${t('me.locked')}: ${how}`}${isNew ? `, ${t('me.new')}` : ''}`}
      bg={bg}
      radius={radius.lg}
      shadow={owned ? sticker.shadowSmall : 0}
      selected={wearing}
      style={styles.tileWrap}
      faceStyle={styles.tile}
    >
      <View style={{ opacity: owned ? 1 : 0.4 }}>
        <Character look={preview} size={crop === 'head' ? 62 : 66} crop={crop} ink={colors.ink} />
      </View>
      {!owned ? (
        <View style={styles.lock}>
          <LockIcon size={22} color={colors.text} />
        </View>
      ) : null}
      {wearing ? (
        <View style={[styles.check, { backgroundColor: colors.ink }]}>
          <CheckIcon size={14} color={colors.sunny} />
        </View>
      ) : null}
      {isNew ? (
        <View style={[styles.newTag, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
          <Text style={{ color: colors.onColor, fontFamily: fonts.bodyBold, fontSize: 11 }}>{t('me.new')}</Text>
        </View>
      ) : null}
      <Text numberOfLines={2} style={[styles.tileName, { color: fg, fontFamily: fonts.bodyBold }]}>
        {name}
      </Text>
      <Text numberOfLines={2} style={[styles.tileHow, { color: wearing ? colors.onColor : colors.textMuted, fontFamily: fonts.bodySemi }]}>
        {status}
      </Text>
    </PressableSticker>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tab: { minHeight: 44, paddingHorizontal: 16, justifyContent: 'center' },
  dot: { position: 'absolute', top: -6, right: -4, width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tileWrap: { width: '30.5%' },
  tile: { alignItems: 'center', paddingTop: 8, paddingBottom: 8, paddingHorizontal: 4, minHeight: 138 },
  lock: { position: 'absolute', top: 30, alignSelf: 'center' },
  check: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newTag: { position: 'absolute', top: -10, left: 6, paddingHorizontal: 7, paddingVertical: 1, borderRadius: 999, borderWidth: 2 },
  tileName: { fontSize: 14, lineHeight: 17, textAlign: 'center', marginTop: 4 },
  tileHow: { fontSize: 12, lineHeight: 15, textAlign: 'center' },
});
