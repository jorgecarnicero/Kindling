import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';

export default function Home() {
  const { t } = useTranslation();
  return (
    <Screen title="Kindling" subtitle={t('home.tagline')}>
      <Button label={t('home.start')} onPress={() => router.push('/play')} />
      <Button label={t('home.favorites')} variant="secondary" onPress={() => router.push('/favorites')} />
      <Button label={t('home.settings')} variant="secondary" onPress={() => router.push('/settings')} />
    </Screen>
  );
}
