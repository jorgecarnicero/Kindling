# Kindling

Mobile app that shows one conversation topic at a time with a gentle countdown ring. When time runs out the group picks "+1 min" (same card, reveals a follow-up) or "Next" (fresh card, no repeats in a session). Full product brief: `Kindling — Project Brief.md`. Expo-specific rules: `AGENTS.md` (read it; Expo SDK 58 is newer than most training data).

## Stack
Expo SDK 58 + TypeScript, Expo Router (routes in `src/app/`), npm. Planned: Zustand, AsyncStorage, Reanimated + react-native-svg, expo-haptics, expo-audio (not expo-av), i18next (EN/ES), Jest + RNTL. No backend in v1. Always add packages with `npx expo install`.

## Layout
- `src/app/` – screens: `index` (home), `play`, `favorites`, `settings`, `_layout` (Stack)
- `src/components/` – shared UI (`Screen`, `Button`; later `TopicCard`, `TimerRing`, `CategoryTile`)
- `src/theme/` – colors (light/dark), spacing, radius, font sizes; use `useTheme()`
- `src/store/settings.ts` – Zustand + AsyncStorage (`kindling.settings`); add new settings to `DEFAULT_SETTINGS` (the merge fills them in for old saves)
- `src/i18n/` – i18next; `en.json`/`es.json` must have identical keys (a test enforces it). Every UI string goes through `t()`. `useAppLanguage()` gives the language for topic text.
- Import with the `@/` alias (maps to `src/`)

## Design rules
Ember orange accent, charcoal + cream base, dark mode follows the system. One big card, large text. The timer is a draining ring, never ticking numbers. Every gesture has a button equivalent.

## Topics
- Bank: `src/data/topics.json`, types in `src/data/types.ts`. **Never renumber or reuse topic ids**: favorites are saved by id on users' phones. Category/depth lists are duplicated in `scripts/validate_topics.py`; keep both in sync.
- Spanish is neutral (tú, no vosotros, no regional slang) and gender-neutral where possible. Tone: warm and playful, never cheesy, no politics.
- Deck logic is pure functions in `src/deck/deck.ts` (tested); `useTopicDeck` wraps it for screens.

## Commands
- `npx expo start` – dev server (scan QR with Expo Go)
- `npm run typecheck` and `npm test` – run both before declaring work done
- `npm run validate:topics` – checks the topic bank (Python via uv, uses `.venv`; stdlib only)
- `npm run make:chime` – regenerates the time's-up chime (Python via uv)

## Git
Branch per step: `feat/...` for features, `fix/...` for bugs, merged into `main`. Jorge commits; don't commit unless asked.

## Product decisions (Jorge, 2026-11-08)
- Pause: both a tap on the card and a Pause button; the player can choose in Settings whether tap-to-pause is on
- Timer: fixed at 1 minute for now (no custom or other lengths yet)
- Language: follows the phone by default, with a manual EN/ES choice in Settings; keep i18n structured so new languages can be added later
- Group size: not a Home filter in v1; kept only as topic metadata (may become a "Who's here?" option later)
- Deck runs out: show a "You've covered them all" card with "Shuffle again" (same filter, repeats allowed) and "Mix in another category"; never repeat silently or widen the filter automatically
- Timer ring traces the card's rounded border (approved over a circular ring)
- Time's up: the card stays; the controls below swap to big "+1 min" and "Next" (no overlay)
- Follow-up: shown below the original topic (accent color, fades in) after "+1 min"; the topic text stays
- Swipes: none for now, buttons only (tap-to-pause still planned)
- Chime: synthesized by our own script (license-free), soft two-note
- Favorites: saving a topic is for reusing it with other people or groups later, so favorites must persist across sessions and be easy to play from

## Status
Step 1 (scaffold) done. Step 2 (topic data + deck) in progress on `feat/topic-deck`: 30 topics approved by Jorge (the style to follow: say "your family", never "our family" (works with relatives and when asking someone about theirs); Random facts = true fact + open question); Play screen is a temporary review mode (EN + ES, all topics, Next only). Step 2 merged. Step 3 (timer) on `feat/timer`: pure timer in `src/timer/timer.ts` (wall-clock based, tested), `useTimer` hook, `TimerRing` drawn along the card's rounded border (Reanimated, ReduceMotion.Never on purpose). Step 3 merged. Step 4 (play screen) on `feat/play-screen`: tap card or button to pause, Skip, time's up swaps to +1 min / Next, follow-up fades in, soft haptic + chime (`assets/sounds/chime.wav`, regenerate with `npm run make:chime`; respects silent mode, mixes with music). Sound + vibration confirmed working on Jorge's phone (2026-11-08); vibration feels soft, which is intended. Soft vibration uses `notificationAsync` on all platforms; don't switch Android to `performAndroidHapticsAsync` (silent when system touch feedback is off or Android < 11). Strong uses RN `Vibration` on Android (expo-haptics patterns run at ~20% amplitude) and two heavy impacts on iOS. On Android, `playsInSilentMode: false` also mutes the chime in vibrate mode. Settings has a temporary "Test time's-up sound & vibration" button. Questions last 5 s in dev builds via `src/config/dev.ts` (`DEV_QUESTION_DURATION_MS`; set to `null` for the real minute; release builds ignore it). expo-audio plugin has microphone + background audio disabled on purpose; keep it that way. Step 4 merged. Step 5 is split in three branches: `feat/settings-i18n` (merged: persisted settings, EN/ES everywhere, tap-to-pause / auto-advance (5 s) / chime / vibration Soft-Strong toggles, language Phone/English/Español), then `feat/favorites` (merged: heart + share in the card's top corners, `src/store/favorites.ts` newest first, Favorites list keeps un-hearted rows until you leave, `/play?source=favorites` plays them shuffled, share = topic + "— from Kindling"), then `feat/home-picker` (in progress: multi-select category tiles, empty = all; depth is "up to" (`depthsUpTo`); choice remembered in `src/store/selection.ts`; Surprise me = every category and depth; Home → Play via route params, parsed and validated in `src/deck/playParams.ts`).
