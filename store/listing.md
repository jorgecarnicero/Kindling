# Google Play listing – Kindling

Copy-paste source for the Play Console. Limits: name 30, short description 80, full description 4000 characters.

## App details

| Field | Value |
| --- | --- |
| Package name | `com.jorgecarnicero.kindling` |
| Default language | English (United States) – add Spanish (es-ES) and Spanish (es-419) translations |
| App or game | App |
| Free or paid | Free |
| Category | Entertainment |
| Tags (pick up to 5) | Conversation, Party, Social, Relationships, Family |
| Contact email | jorgecarniceroprincipe@gmail.com |
| Privacy policy | https://jorgecarnicero.github.io/Kindling/privacy/ |
| Website (optional) | https://jorgecarnicero.github.io/Kindling/ |

## English

**App name** (29/30)
Kindling: Conversation Topics

**Short description** (69/80)
One topic at a time and a gentle timer, so talks never stall or drag.

**Full description**
Every good talk starts small.

Kindling hands your group one conversation topic at a time, with a gentle timer, so a conversation never stalls and never drags. Pick a vibe, get a topic, talk until time's up, then add a minute or move on.

PICK A VIBE
Nine categories, each with its own color: Get to know you, Deep talk, Random facts, Stories, Would you rather, Light debate, Couples, Family and kids, and Team building. Mix as many as you like, and choose how deep to go: light, medium or deep.

NEED A SPARK?
Stuck on how to start? Tap "Need a spark?" for a concrete way in. When a topic catches fire, tap +1 min and a follow-up question takes it deeper.

A TIMER THAT STAYS OUT OF THE WAY
The timer is a ring that slowly drains around the card, not a ticking clock. Choose 30 seconds to 5 minutes, or turn it off and just use the cards. Time's up is a soft vibration and a gentle chime, never an alarm. Tap the card to pause when the waiter arrives.

DAY AND NIGHT
Bright, playful stickers by day. At night the campfire is lit, with an optional crackling fire sound in the background.

MADE FOR REAL MOMENTS
First dates, dinners with friends, family evenings, road trips and team events. Save your favorite topics and bring them to your next group, or share one with a friend.

PRIVATE BY DESIGN
No accounts, no ads, no tracking. Everything stays on your phone, and it works offline.

In English and Spanish.

## Español

**Nombre de la app** (30/30)
Kindling: Temas para conversar

**Descripción breve** (72/80)
Un tema a la vez y un temporizador suave: charlas que nunca se estancan.

**Descripción completa**
Toda buena charla empieza pequeña.

Kindling le da a tu grupo un tema de conversación a la vez, con un temporizador suave, para que la charla nunca se estanque ni se alargue. Elige un ambiente, recibe un tema, conversa hasta que se acabe el tiempo y luego suma un minuto o pasa al siguiente.

ELIGE UN AMBIENTE
Nueve categorías, cada una con su color: Conocerse, Charla profunda, Datos curiosos, Historias, ¿Qué prefieres?, Debate ligero, Parejas, Familia y niños, y Trabajo en equipo. Combina las que quieras y elige qué tan profundo ir: ligero, medio o profundo.

¿NECESITAS UNA CHISPA?
¿No sabes cómo empezar? Toca «¿Necesitas una chispa?» y recibe una forma concreta de arrancar. Cuando un tema prende, toca +1 min y una pregunta extra lo lleva más lejos.

UN TEMPORIZADOR QUE NO ESTORBA
El tiempo es un anillo que se vacía despacio alrededor de la tarjeta, no un reloj que hace tictac. Elige de 30 segundos a 5 minutos, o desactívalo y usa solo las tarjetas. El fin del tiempo es una vibración suave y un sonido delicado, nunca una alarma. Toca la tarjeta para pausar cuando llega el camarero.

DE DÍA Y DE NOCHE
Stickers alegres de día. De noche se enciende la fogata, con un sonido opcional de fuego crepitando de fondo.

PARA MOMENTOS DE VERDAD
Primeras citas, cenas con amistades, tardes en familia, viajes por carretera y eventos de equipo. Guarda tus temas favoritos para tu próximo grupo o comparte uno con alguien.

PRIVADA DE VERDAD
Sin cuentas, sin anuncios, sin rastreo. Todo se queda en tu teléfono y funciona sin conexión.

En español e inglés.

## Graphics (in this folder)

| Asset | File | Play requirement |
| --- | --- | --- |
| App icon | `play-icon-512.png` | 512×512 PNG |
| Feature graphic | `feature-graphic-en.png`, `feature-graphic-es.png` | 1024×500 PNG |
| Phone screenshots | take on the phone (see below) | 2–8, 9:16 |

Regenerate the icon and feature graphics with `npm run make:icons`.

**Screenshots to take** (installed preview build, both languages if possible):
1. Welcome at night (campfire lit)
2. Pick a vibe with 2–3 colored categories selected (day)
3. A topic card with the ring half drained (day)
4. A topic card with "Need a spark?" opened
5. Night topic card (deep talk, dusk blue)
6. Favorites list

## Data safety form (answers)

- Does your app collect or share any of the required user data types? **No**
- Is all user data encrypted in transit? Not applicable (no data leaves the device)
- Do you provide a way for users to request that their data be deleted? Not applicable (nothing is collected; uninstalling removes everything)

## Content rating questionnaire (guidance)

- Category: **Utility, productivity, communication or other** (not a game)
- Violence, sexuality, profanity, drugs, gambling: **No**
- Users can interact or exchange content with each other in the app: **No** (sharing opens the phone's own share menu; nothing passes through Kindling)
- Shares location: **No**. Allows purchases: **No**.
- Expected result: rated for everyone / PEGI 3 or similar.

## Target audience (recommendation)

Choose **13 and older** (13–15, 16–17, 18+). Couples and some Deep talk topics are written for teens and adults. Including under-13s would put the app under Google Play's Families policy with extra requirements; Family topics stay suitable for kids playing alongside adults either way.

## Testing before production (new personal developer accounts)

Google requires a **closed test with at least 12 testers opted in for 14 continuous days** before you can apply for production access. Plan: upload the production .aab to a closed testing track, invite 12+ friends by email (Google Group or email list), and keep them opted in for 14 days.
