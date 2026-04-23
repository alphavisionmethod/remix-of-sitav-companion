---
name: Sita Proactive — Phase D
description: Phase D of Sita-as-Jarvis. Ambient signal sources push proactive nudges through a throttled bus; HUD whisper card surfaces one at a time with quick-action buttons that reuse the voice intent router.
type: feature
---

Phase D promotes Sita from "responds when asked" to "anticipates and whispers."
It is fully presentational + bus-driven and adds zero backend coupling.

## Pieces
- **`src/lib/sita-proactive/sita-nudge-bus.ts`** — central pub/sub for nudges
  with throttling (`MIN_GAP_MS=25s`, `MAX_QUEUE=6`), TTL auto-expiry,
  6h dismissal memory in `localStorage` (`sita_nudge_dismissed_v1`),
  and quiet-hours respect via the existing `sita_sentinel_prefs_v1` payload.
- **`src/lib/sita-proactive/sita-signal-sources.ts`** — `startSitaSignalSources()`
  starts four ambient observers:
  1. **linger-on-surface** — uses Phase C `subscribeScreenContext` to suggest
     the surface's first `suggestedIntents[]` entry after ~35s dwell.
  2. **time-of-day** — once-per-day morning brief (09:00) and evening wrap-up
     (18:00) nudges.
  3. **long-focus** — listens to `focus-mode-start/stop` window events and
     suggests a 5-min break every 50min while focused.
  4. **voice-followup** — when the HUD bus shows a "speaking" reply, schedules
     a soft "go deeper / take action" nudge ~12s later.
- **`src/components/sita/shell/sita-hud/SitaWhisper.tsx`** — glass card pinned
  under the HUD strip, kind-tinted gradient, up to 3 quick actions, X dismiss.
- **`src/components/sita/shell/sita-hud/SitaProactiveRunner.tsx`** — mounts the
  signal sources and bridges whisper-action `intent` strings into
  `useSitaVoice().dispatchIntent` (Phase B), so a button press behaves
  identically to a spoken command.
- **Wiring** — `ShellLiveLayer.tsx` lazy-loads `SitaWhisper` + `SitaProactiveRunner`
  alongside the Phase A HUD pieces.

## Window events
- `sita-voice-utterance` (consumed) — `{ utterance: string }`. Whisper actions
  with an `intent` field dispatch this; the runner forwards to the voice
  provider.
- Reuses Phase B's `sita-voice-intent` and Phase C's
  `sita-voice-reply` / screen-context subscriptions; no new buses introduced.

## Dismissal & quiet hours
- Dismissing a nudge (X or any action) writes its id into
  `sita_nudge_dismissed_v1` for 6h to prevent loops.
- Non-`high` priority nudges are suppressed during quiet hours
  (start/end strings on `sita_sentinel_prefs_v1`).
- `clearNudgeDismissals()` is exported for a future settings reset.

## Add a new signal source
1. Subscribe to whatever you need (HUD, screen context, custom window event).
2. Call `publishNudge({ id, kind, priority, text, actions, ttlMs? })`.
3. Use a stable `id` keyed off the trigger so dedupe + dismissal memory work.
4. If the action should run as a voice intent, set `actions[i].intent = "..."`
   — the Proactive Runner will route it through `dispatchIntent`.