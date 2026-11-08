import type { Category, Depth } from './types';

// Temporary English labels; these move to i18n (EN/ES) in step 5.
export const categoryLabel: Record<Category, string> = {
  get_to_know: 'Get to know you',
  deep_talk: 'Deep talk',
  random_facts: 'Random facts',
  stories: 'Stories',
  would_you_rather: 'Would you rather',
  light_debate: 'Light debate',
  couples: 'Couples',
  family: 'Family and kids',
  team_building: 'Team building',
};

export const depthLabel: Record<Depth, string> = {
  light: 'Light',
  medium: 'Medium',
  deep: 'Deep',
};
