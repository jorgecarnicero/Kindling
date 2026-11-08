# Kindling

Mobile app that shows one conversation topic at a time with a gentle countdown ring. When time runs out the group picks "+1 min" (same card, reveals a follow-up) or "Next" (fresh card, no repeats in a session). Full product brief: `Kindling — Project Brief.md`. Expo-specific rules: `AGENTS.md` (read it; Expo SDK 58 is newer than most training data).

## Stack
Expo SDK 58 + TypeScript, Expo Router (routes in `src/app/`), npm. Planned: Zustand, AsyncStorage, Reanimated + react-native-svg, expo-haptics, expo-audio (not expo-av), i18next (EN/ES), Jest + RNTL. No backend in v1. Always add packages with `npx expo install`.

## Layout
- `src/app/` – screens: `index` (home), `play`, `favorites`, `settings`, `_layout` (Stack)
- `src/components/` – shared UI (`Screen`, `Button`; later `TopicCard`, `TimerRing`, `CategoryTile`)
- `src/theme/` – colors (light/dark), spacing, radius, font sizes; use `useTheme()`
- Import with the `@/` alias (maps to `src/`)

## Design rules
Ember orange accent, charcoal + cream base, dark mode follows the system. One big card, large text. The timer is a draining ring, never ticking numbers. Every gesture has a button equivalent.

## Topics
- Bank: `src/data/topics.json`, types in `src/data/types.ts`. Category/depth lists are duplicated in `scripts/validate_topics.py`; keep both in sync.
- Spanish is neutral (tú, no vosotros, no regional slang) and gender-neutral where possible. Tone: warm and playful, never cheesy, no politics.
- Deck logic is pure functions in `src/deck/deck.ts` (tested); `useTopicDeck` wraps it for screens.

## Commands
- `npx expo start` – dev server (scan QR with Expo Go)
- `npm run typecheck` and `npm test` – run both before declaring work done
- `npm run validate:topics` – checks the topic bank (Python via uv, uses `.venv`; stdlib only)

## Git
Branch per step: `feat/...` for features, `fix/...` for bugs, merged into `main`. Jorge commits; don't commit unless asked.

## Product decisions (Jorge, 2026-11-08)
- Pause: both a tap on the card and a Pause button; the player can choose in Settings whether tap-to-pause is on
- Timer: fixed at 1 minute for now (no custom or other lengths yet)
- Language: follows the phone by default, with a manual EN/ES choice in Settings; keep i18n structured so new languages can be added later
- Group size: not a Home filter in v1; kept only as topic metadata (may become a "Who's here?" option later)
- Deck runs out: show a "You've covered them all" card with "Shuffle again" (same filter, repeats allowed) and "Mix in another category"; never repeat silently or widen the filter automatically
- Favorites: saving a topic is for reusing it with other people or groups later, so favorites must persist across sessions and be easy to play from

## Status
Step 1 (scaffold) done. Step 2 (topic data + deck) in progress on `feat/topic-deck`: 30 topics approved by Jorge (the style to follow: "our family" phrasing is fine for Family; Random facts = true fact + open question); Play screen is a temporary review mode (EN + ES, all topics, Next only). Next: step 3, timer.
