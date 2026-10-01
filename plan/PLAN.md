# Mood Check-In — Plan

Personal wellness tracker. Tap a few options a few times a day, build a dataset over weeks and months, analyze on Mac.

## Stack

Progressive Web App.

- Single `index.html` + vanilla HTML / CSS / JS. No framework, no build step.
- Data in `localStorage` (upgrade to IndexedDB only if it fills — unlikely for tap-based check-ins over years).
- Hosted on GitHub Pages (free, static). User data never leaves the phone.
- Installed on iPhone via Safari → *Add to Home Screen*. Full-screen, own icon, offline-capable via service worker.
- Zero cost. No signing. No App Store. No AltStore. No Swift.

## Why not native iOS

- No notifications needed (user opens the app when they want; timestamp is captured on save).
- No HealthKit runtime needed (user manually reads Apple Health and types values).
- Free Apple ID sideloading expires every 7 days — would silently kill the dataset.
- PWA installed via Add to Home Screen looks and behaves like a native app in daily use.

## Color palette

| Role                                | Hex       | Name          |
| ----------------------------------- | --------- | ------------- |
| Background                          | `#C3D9DF` | Pale blue     |
| Surfaces / cards                    | `#E0C58E` | Light beige   |
| Primary interactive (buttons, chips) | `#6F98A0` | Muted teal    |
| Accent / CTA                        | `#C89B4D` | Golden brown  |
| Period / emotional fields           | `#C98880` | Dusty rose    |

Defaults; can shuffle during build.

---

## Stage 1 — Ship the check-in loop end-to-end

### Features

- **Check-in form** capturing per submission:
  - Mood (single pick, tap options)
  - Energy level (single pick)
  - Food (single pick: crave sugar / junk food / healthy / overeating / chocolate / low appetite)
  - Active minutes (manual number, user reads from Apple Health)
  - Activity type (gym / running / walking / …)
  - Socialized (none / online video / in-person familiar / in-person new / workshop / event)
  - Work experience (feel socialized? feel useful? remote / home / library? busy / quiet?) — hidden on Sat/Sun and after 17:00, with one-tap override
  - Sleep hours + sleep quality — only shown on the first check-in of a calendar day
  - Stress source (short free text)
  - Note (free text)
  - Period phase (early / end / just finished / 1–2 weeks before start / none)
  - Open loops: each active loop appears as a row → tap to include → pick weight (light / moderate / heavy)
- **Open loops list** — separate screen: add new loop, archive resolved / dropped loops.
- **Timestamp** on save (ISO 8601, local time).
- **Storage**: append each check-in to `localStorage` as a JSON object.
- **Export CSV** button — one row per check-in, columns match the data model above. Open loops serialized inline (e.g. `loop_name:weight;loop_name:weight`). Downloads to iPhone Files app; move to Mac via AirDrop or iCloud Drive.

### Constraints

- Vanilla HTML / CSS / JS in a single `index.html` (plus optional split JS / CSS files).
- `localStorage` only.
- No server, no analytics, no third-party calls with user data.
- Zero cost.

### Assumptions

- User remembers to check in on their own; iPhone Clock alarms remain an out-of-app option if nudges are wanted.
- Apple Health values (active minutes, sleep, etc.) are typed in manually.

---

## Stage 2 — Cycle knowledge in the same PWA

Additions on top of Stage 1, no platform change:

- Log period start date; app calculates current cycle day.
- Confirm phase automatically ("today is day 2 of your cycle" / "day 25 — PMS may hit").
- Small JSON knowledge base of cycle-phase hints, referenced by cycle day.

Everything else stays as Stage 1.

---

## Possible future stage — Apple Health connector

Not committed. Would let the app pre-fill active minutes / sleep from Apple Health instead of manual entry.

- Forces a rewrite to a native iOS app (PWAs cannot access HealthKit).
- Revisit only if manual entry proves too much friction after months of real use.

---

## Out of scope

- Notifications (push, local, weekly summary).
- Multi-user, cross-device sync, cloud backup.
- Native iOS app (unless the HealthKit connector future stage is committed).
- Random-timed check-ins.