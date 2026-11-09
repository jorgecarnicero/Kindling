import AsyncStorage from '@react-native-async-storage/async-storage';
import { topics as bank } from '@/data/topics';
import { createDeck, currentTopic, matches } from '@/deck/deck';
import { cleanInput, LIMITS, toTopic, useCustomTopics } from '../customTopics';

const KEY = 'kindling.customTopics';

beforeEach(async () => {
  await AsyncStorage.clear();
  useCustomTopics.setState({ topics: [] });
});

describe('cleanInput', () => {
  it('needs a question and trims everything', () => {
    expect(cleanInput({ text: '   ' })).toBeNull();
    expect(cleanInput({ text: '  Hi?  ', starter: '  ', followUp: ' More? ' })).toEqual({
      text: 'Hi?',
      followUp: 'More?',
    });
  });

  it('enforces the length limits', () => {
    const long = 'x'.repeat(500);
    const c = cleanInput({ text: long, starter: long, followUp: long })!;
    expect(c.text).toHaveLength(LIMITS.text);
    expect(c.starter).toHaveLength(LIMITS.starter);
    expect(c.followUp).toHaveLength(LIMITS.followUp);
  });
});

describe('custom topics store', () => {
  it('adds newest first with a unique own- id, and refuses empty questions', () => {
    const { add } = useCustomTopics.getState();
    const a = add({ text: 'First?' })!;
    const b = add({ text: 'Second?' })!;
    expect(add({ text: ' ' })).toBeNull();
    expect(useCustomTopics.getState().topics.map((t) => t.text)).toEqual(['Second?', 'First?']);
    expect(a.id).toMatch(/^own-/);
    expect(a.id).not.toBe(b.id);
  });

  it('updates and removes by id', () => {
    const { add, update, remove } = useCustomTopics.getState();
    const a = add({ text: 'Old?' })!;
    update(a.id, { text: 'New?', starter: 'Think…' });
    expect(useCustomTopics.getState().topics[0]).toMatchObject({ id: a.id, text: 'New?', starter: 'Think…' });
    update(a.id, { text: '' }); // an empty edit is ignored
    expect(useCustomTopics.getState().topics[0].text).toBe('New?');
    remove(a.id);
    expect(useCustomTopics.getState().topics).toEqual([]);
  });

  it('persists on the device and drops malformed saved entries', async () => {
    useCustomTopics.getState().add({ text: 'Kept?' });
    const saved = JSON.parse((await AsyncStorage.getItem(KEY))!);
    expect(saved.state.topics[0].text).toBe('Kept?');

    await AsyncStorage.setItem(
      KEY,
      JSON.stringify({
        state: { topics: [{ id: 'own-1', text: 'Good?', createdAt: 1 }, { id: 2 }, { id: 'own-3', text: '  ' }] },
        version: 1,
      }),
    );
    await useCustomTopics.persist.rehydrate();
    expect(useCustomTopics.getState().topics.map((t) => t.id)).toEqual(['own-1']);
  });
});

describe('custom topics in the deck', () => {
  it('become "yours" topics with the same text in every language', () => {
    const t = toTopic({ id: 'own-x', text: 'Q?', starter: 'S', followUp: 'F', createdAt: 0 });
    expect(t).toMatchObject({ category: 'yours', text: { en: 'Q?', es: 'Q?' }, starter: { en: 'S', es: 'S' } });
    expect(t.followUps).toEqual({ en: ['F'], es: ['F'] });
    expect(toTopic({ id: 'own-y', text: 'Q?', createdAt: 0 })).not.toHaveProperty('starter');
  });

  it('show at any depth setting', () => {
    const t = toTopic({ id: 'own-x', text: 'Q?', createdAt: 0 });
    expect(matches(t, { categories: ['yours'], depths: ['light'] })).toBe(true);
    expect(matches(t, { categories: ['yours'], depths: ['deep'] })).toBe(true);
    expect(matches(t, { categories: ['stories'] })).toBe(false);
  });

  it('play alone when only Yours is picked', () => {
    const own = toTopic({ id: 'own-x', text: 'Only me?', createdAt: 0 });
    const deck = createDeck([...bank, own], { categories: ['yours'], depths: ['light', 'medium'] });
    expect(currentTopic(deck)?.id).toBe('own-x');
  });

  it('never appear in the built-in bank', () => {
    expect(bank.filter((t) => t.category === 'yours')).toEqual([]);
  });
});
