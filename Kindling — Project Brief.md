# Kindling — Project Brief

Nov 8, 2026 · @Jorge

## Overview

**Kindling** is a mobile app that hands people one conversation topic at a time, with a gentle timer, so a conversation never stalls and never drags. The name comes from the small sticks that start a fire: each topic is a little flame you can feed with more time or let go out.

**One-line pitch:** Pick a vibe, get a topic, talk until the timer runs out, then add time or move on.

**Problem:** Awkward silences on dates, dinners and team events, and question lists that feel like homework. Existing question-card apps have no rhythm: nothing tells you when to move on.

**Audience:** Anyone in a social moment: friends and parties, first dates and couples, families, coworkers and team building.

**Working assumptions** (change any of these before starting):

- Mobile-first with React Native + Expo, which also runs in the browser for quick testing
- English and Spanish from day one
- No accounts in v1; everything stored on the device
- Free, no ads in v1

## Core experience

The whole app is one loop: a topic appears with a countdown, and when time runs out the group chooses to keep talking or move on.

&#91;embedded content: core loop · 4 steps, 1 decision\]

Adding time keeps the same card and reveals a follow-up question; Next or Skip draws a fresh card that hasn't appeared in this session.

**Timer rules**

- Default 1 minute; options 30s, 1, 2, 3, 5 min, custom, or off (cards only)
- Shown as a ring around the card that slowly drains, not ticking numbers
- Time's up = soft vibration and an optional chime, never an alarm
- Pause freezes the ring (a phone call, the waiter arrives)
- Auto-advance (optional, for parties): the next card appears after 5 seconds unless someone taps +1 min
- The app counts how often each topic gets extra time, which feeds the session summary later

## Content

Topics live in a local JSON bank of 300 to 500 entries, each tagged by category, depth and group size, written in both languages.

| Category | What it covers | Example |
| --- | --- | --- |
| Get to know you | First dates, new friends, new coworkers | What's a small thing that always makes your day better? |
| Deep talk | Values, dreams, fears | What's something you believed strongly five years ago and don't anymore? |
| Random facts | A surprising fact that opens a discussion | Octopuses have three hearts. Which animal would you want to be for a day? |
| Stories | "Tell me about a time when..." | Tell me about the best meal you've ever had. |
| Would you rather | Hypotheticals and dilemmas | Would you rather live by the sea or in the mountains? |
| Light debate | Fun opinions, never politics | Is a hot dog a sandwich? |
| Couples | Relationship and shared future | What's a tradition you'd like us to start? |
| Family and kids | Safe for all ages | If you could invent a holiday, what would it celebrate? |
| Team building | Work-safe, inclusive | What's a skill you have that nobody at work knows about? |

**Depth levels:** Light (anyone, anywhere) · Medium (some personal sharing) · Deep (trust needed).

**Topic format:**

```json
{
  "id": "gtk-001",
  "category": "get_to_know",
  "depth": "light",
  "groupSize": ["pair", "small", "party"],
  "text": {
    "en": "What's a small thing that always makes your day better?",
    "es": "¿Qué pequeña cosa siempre te mejora el día?"
  },
  "followUps": {
    "en": ["When did it last happen?"],
    "es": ["¿Cuándo fue la última vez?"]
  }
}
```

Follow-up questions are optional and show only when someone adds time, so an extended topic has somewhere to go.

## MVP scope and roadmap

Version 1 ships the card-and-timer loop with local content only; everything that needs a server waits.

**In v1**

- [ ] Home: pick category and depth (or "Surprise me" for random)
- [ ] Topic card with countdown ring
- [ ] Time's up prompt: +1 min or Next
- [ ] Skip and Pause at any time
- [ ] Settings: timer length (30s, 1, 2, 3, 5 min, off), sound, vibration, auto-advance, language
- [ ] Favorites (saved on device)
- [ ] Share a topic as text
- [ ] No repeats within a session
- [ ] Topic bank: 300+ topics in EN and ES

**Later**

| Version | Feature | Needs |
| --- | --- | --- |
| v1.1 | Session summary: topics covered, which ones got extra time | Local only |
| v1.1 | Turn mode: timer rotates between named players | Local only |
| v1.2 | AI topics for a described situation ("dinner with in-laws who love gardening") | Claude API via a small backend |
| v1.2 | Daily topic notification | Push notifications |
| v2 | Group mode: everyone sees the same card on their own phone | Realtime backend (Supabase) |
| v2 | Accounts, synced favorites, user-submitted topics with moderation | Supabase auth + database |

## Tech stack and design

One TypeScript codebase with Expo builds iOS, Android and a web version for quick sharing.

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | React Native + Expo (TypeScript) | One codebase, test on your phone with Expo Go |
| Navigation | Expo Router | File-based routes, simple |
| State | Zustand | Small, no boilerplate |
| Storage | AsyncStorage | Favorites and settings on device |
| Animation | React Native Reanimated + react-native-svg | Smooth countdown ring |
| Feedback | expo-haptics, expo-av | Vibration and soft chime |
| i18n | i18next | EN/ES, follows phone language |
| Tests | Jest + React Native Testing Library | Timer logic is the part worth testing |

**Suggested structure**

```
kindling/
  app/                 # screens (Expo Router)
    index.tsx          # home: category + depth
    play.tsx           # card + timer
    favorites.tsx
    settings.tsx
  src/
    components/        # TopicCard, TimerRing, CategoryTile
    hooks/             # useTimer, useTopicDeck
    store/             # settings, favorites (Zustand)
    data/topics.json   # topic bank
    i18n/              # en.json, es.json
    theme/             # colors, fonts, spacing
```

**Design direction**

- Warm palette: ember orange as the accent, charcoal and cream as the base, with dark mode
- One big card in the middle of the screen, large readable text, nothing else competing
- The timer is a ring around the card that slowly drains, never a ticking number
- Swipe left to skip, tap to pause, buttons for everything too (accessibility)
- Optional touch: a small flame icon that grows when time is added

## Build plan for Claude Code

Build in six small steps, testing on your phone after each one.

1. Scaffold the Expo + TypeScript project, Expo Router, theme and the four empty screens
2. Topic data: JSON schema, 30 sample topics in EN/ES, a `useTopicDeck` hook (filter, shuffle, no repeats)
3. Timer: a `useTimer` hook (start, pause, resume, add time, reset) with unit tests, then the animated ring
4. Play screen: card + ring + Skip, Pause, +1 min and Next, haptics and chime on time's up
5. Settings and favorites with AsyncStorage, language switch
6. Fill the topic bank to 300+, polish animations, app icon and splash screen

**Starting prompt** (paste this into Claude Code in an empty folder):

```markdown
I want to build Kindling, a mobile app that suggests conversation topics one at a time with a countdown timer.

Core loop: the user picks a category (get to know you, deep talk, random facts, stories, would you rather, light debate, couples, family, team building) and a depth (light, medium, deep). The app shows one topic on a big card with a circular countdown ring (default 1 minute, configurable: 30s, 1, 2, 3, 5 min, or off). When time runs out, it vibrates softly and offers "+1 min" or "Next". Users can Skip or Pause at any time. Optional auto-advance for parties.

Tech: React Native + Expo (TypeScript), Expo Router, Zustand, AsyncStorage, Reanimated + react-native-svg for the ring, expo-haptics, i18next for English and Spanish. No backend in v1.

Topics come from a local JSON file; each has id, category, depth, groupSize, text {en, es} and optional followUps {en, es}.

Design: warm palette (ember orange accent, charcoal and cream base), dark mode, one large card centred on screen, large readable text.

Please start with step 1: scaffold the project, set up navigation with screens for home, play, favorites and settings, add the theme, and create a CLAUDE.md that summarises this brief. Then stop so I can run it on my phone before step 2.
```
