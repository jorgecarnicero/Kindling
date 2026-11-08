import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';

export default function Home() {
  return (
    <Screen title="Kindling" subtitle="Pick a vibe, get a topic, keep the fire going.">
      <Button label="Start" onPress={() => router.push('/play')} />
      <Button label="Favorites" variant="secondary" onPress={() => router.push('/favorites')} />
      <Button label="Settings" variant="secondary" onPress={() => router.push('/settings')} />
    </Screen>
  );
}
