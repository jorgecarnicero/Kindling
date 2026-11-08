import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useTimesUpFeedback } from '@/feedback/useTimesUpFeedback';

export default function Settings() {
  const timesUp = useTimesUpFeedback();
  return (
    <Screen
      title="Settings"
      subtitle="Timer, sound, vibration and language will go here. On silent or vibrate, the chime stays quiet."
    >
      <Button label="Test time's-up sound & vibration" variant="secondary" onPress={timesUp} />
    </Screen>
  );
}
