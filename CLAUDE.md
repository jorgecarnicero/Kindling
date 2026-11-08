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

## Commands
- `npx expo start` – dev server (scan QR with Expo Go)
- `npm run typecheck` – run before declaring work done

## Product decisions (Jorge, 2026-11-08)
- Pause: both a tap on the card and a Pause button; the player can choose in Settings whether tap-to-pause is on
- Timer: fixed at 1 minute for now (no custom or other lengths yet)
- Language: follows the phone by default, with a manual EN/ES choice in Settings; keep i18n structured so new languages can be added later
- Group size: not a Home filter in v1; kept only as topic metadata (may become a "Who's here?" option later)
- Deck runs out: show a "You've covered them all" card with "Shuffle again" (same filter, repeats allowed) and "Mix in another category"; never repeat silently or widen the filter automatically
- Favorites: saving a topic is for reusing it with other people or groups later, so favorites must persist across sessions and be easy to play from

## Status
Step 1 (scaffold) done. Next: step 2, topic data + `useTopicDeck`. Topic content and open product questions are still to be decided with Jorge.
