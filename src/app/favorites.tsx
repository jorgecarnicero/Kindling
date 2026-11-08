import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/Screen';

export default function Favorites() {
  const { t } = useTranslation();
  return <Screen title={t('favorites.title')} subtitle={t('favorites.empty')} />;
}
