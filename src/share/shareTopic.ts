import { Share } from 'react-native';

/** The text a shared topic sends: the question plus a small credit line. */
export function shareMessage(topicText: string, credit: string): string {
  return `${topicText}\n${credit}`;
}

/** Opens the system share sheet. Cancelling is not an error. */
export async function shareTopic(topicText: string, credit: string): Promise<void> {
  try {
    await Share.share({ message: shareMessage(topicText, credit) });
  } catch (e) {
    if (__DEV__) console.warn('[kindling] share failed:', e);
  }
}
