import raw from './topics.json';
import type { Topic } from './types';

// The JSON is checked by scripts/validate_topics.py; the cast trusts that check.
export const topics = raw as Topic[];
