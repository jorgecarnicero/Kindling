import { ScrollView, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';
import { ChoiceRow, Divider, SettingSection, ToggleRow } from '@/components/SettingRow';
import { useTimesUpFeedback } from '@/feedback/useTimesUpFeedback';
import type { LanguagePref } from '@/store/settings';
import { useSettings } from '@/store/settings';
import { useTheme } from '@/theme';

export default function Settings() {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const s = useSettings();
  const timesUp = useTimesUpFeedback();

  // Language names are written in their own language so anyone can find theirs.
  const languages: { value: LanguagePref; label: string }[] = [
    { value: 'system', label: t('settings.languageSystem') },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl }}
    >
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
      <Button label={t('settings.test')} variant="secondary" onPress={timesUp} />

      <SettingSection title={t('settings.sectionLanguage')}>
        <ChoiceRow value={s.language} onChange={(v) => s.update({ language: v })} options={languages} />
      </SettingSection>

      <Text style={{ color: colors.textMuted, textAlign: 'center' }}>{t('settings.questionTime')}</Text>
    </ScrollView>
  );
}
