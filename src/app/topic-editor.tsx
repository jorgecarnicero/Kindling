import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { ScreenHeader } from '@/components/ScreenHeader';
import { cleanInput, LIMITS, useCustomTopics } from '@/store/customTopics';
import { useFavorites } from '@/store/favorites';
import { useTheme } from '@/theme';

/** Write a new topic, or edit one (`?id=own-…`). */
export default function TopicEditor() {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useCustomTopics((s) => s.topics.find((x) => x.id === id));
  const { add, update, remove } = useCustomTopics.getState();

  const [text, setText] = useState(existing?.text ?? '');
  const [starter, setStarter] = useState(existing?.starter ?? '');
  const [followUp, setFollowUp] = useState(existing?.followUp ?? '');

  const canSave = cleanInput({ text }) !== null;

  const save = () => {
    const input = { text, starter, followUp };
    if (existing) update(existing.id, input);
    else add(input);
    router.back();
  };

  const confirmDelete = () => {
    if (!existing) return;
    Alert.alert(t('yours.deleteTitle'), t('yours.deleteBody'), [
      { text: t('yours.cancel'), style: 'cancel' },
      {
        text: t('yours.delete'),
        style: 'destructive',
        onPress: () => {
          remove(existing.id);
          useFavorites.getState().remove(existing.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title={existing ? t('yours.editTitle') : t('yours.newTitle')} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: spacing.lg - 4, gap: spacing.lg, paddingBottom: insets.bottom + spacing.xxl }}
      >
        <Field
          big
          autoFocus={!existing}
          label={t('yours.question')}
          placeholder={t('yours.questionPlaceholder')}
          value={text}
          onChange={setText}
          maxLength={LIMITS.text}
        />
        <Field
          label={t('yours.spark')}
          hint={t('yours.sparkHint')}
          placeholder={t('yours.sparkPlaceholder')}
          value={starter}
          onChange={setStarter}
          maxLength={LIMITS.starter}
        />
        <Field
          label={t('yours.followUp')}
          hint={t('yours.followUpHint')}
          placeholder={t('yours.followUpPlaceholder')}
          value={followUp}
          onChange={setFollowUp}
          maxLength={LIMITS.followUp}
        />
        <View style={{ gap: spacing.md }}>
          <Button big label={t('yours.save')} onPress={save} disabled={!canSave} />
          {existing ? <Button variant="secondary" label={t('yours.delete')} onPress={confirmDelete} /> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
