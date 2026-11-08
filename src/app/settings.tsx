import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ChoiceRow, Divider, SettingSection, ToggleRow } from '@/components/SettingRow';
import { useTimesUpFeedback } from '@/feedback/useTimesUpFeedback';
import type { Appearance, LanguagePref } from '@/store/settings';
import { useSettings } from '@/store/settings';
import { useTheme } from '@/theme';

export default function Settings() {
  const { t } = useTranslation();
  const { colors, fonts, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useSettings();
  const timesUp = useTimesUpFeedback();

  const appearances: { value: Appearance; label: string }[] = [
    { value: 'auto', label: t('settings.appearanceAuto') },
    { value: 'day', label: t('settings.appearanceDay') },
    { value: 'night', label: t('settings.appearanceNight') },
  ];

  // Language names are written in their own language so anyone can find theirs.
  const languages: { value: LanguagePref; label: string }[] = [
    { value: 'system', label: t('settings.languageSystem') },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
  ];

  const hint = { color: colors.textMuted, fontFamily: fonts.body, fontSize: 14, lineHeight: 19, paddingBottom: spacing.md };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('settings.title')} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg - 4, gap: spacing.xl, paddingBottom: insets.bottom + spacing.xxl }}>
        <SettingSection title={t('settings.sectionAppearance')}>
          <ChoiceRow value={s.appearance} onChange={(v) => s.update({ appearance: v })} options={appearances} />
          <Text style={hint}>{t('settings.appearanceHint')}</Text>
        </SettingSection>

        <SettingSection title={t('settings.sectionPlay')}>
          <ToggleRow
            label={t('settings.tapToPause')}
            hint={t('settings.tapToPauseHint')}
            value={s.tapToPause}
            onChange={(v) => s.update({ tapToPause: v })}
          />
          <Divider />
          <ToggleRow
            label={t('settings.autoAdvance')}
            hint={t('settings.autoAdvanceHint')}
            value={s.autoAdvance}
            onChange={(v) => s.update({ autoAdvance: v })}
          />
        </SettingSection>

        <View style={{ gap: spacing.md }}>
          <SettingSection title={t('settings.sectionFeedback')}>
            <ToggleRow
              label={t('settings.sound')}
              hint={t('settings.soundHint')}
              value={s.sound}
              onChange={(v) => s.update({ sound: v })}
            />
            <Divider />
            <ToggleRow label={t('settings.vibration')} value={s.vibration} onChange={(v) => s.update({ vibration: v })} />
            {s.vibration ? (
              <>
                <Divider />
                <ChoiceRow
                  label={t('settings.vibrationStrength')}
                  value={s.vibrationStrength}
                  onChange={(v) => s.update({ vibrationStrength: v })}
                  options={[
                    { value: 'soft', label: t('settings.soft') },
                    { value: 'strong', label: t('settings.strong') },
                  ]}
                />
              </>
            ) : null}
          </SettingSection>
          <Button label={t('settings.test')} variant="sunny" onPress={timesUp} />
        </View>

        <SettingSection title={t('settings.sectionLanguage')}>
          <ChoiceRow value={s.language} onChange={(v) => s.update({ language: v })} options={languages} />
        </SettingSection>

        <Text style={{ color: colors.textMuted, fontFamily: fonts.bodySemi, textAlign: 'center' }}>{t('settings.questionTime')}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
