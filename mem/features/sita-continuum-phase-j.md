---
name: Sita Continuum Layer (Phase J)
description: Continuum spine — bounded "episodes", affect feedback loop, and nightly dream consolidation that promote ephemeral signals into durable knowledge + gentle personality patches.
type: feature
---

Phase J of Sita-as-Jarvis — the **Continuum Layer**. Gives Sita a sense of "where we are right now" and "what we have learned" that survives reloads and feeds the cortex/embodiment.

## Surfaces
- **Episode tracker** (`src/lib/sita-continuum/episode-tracker.ts`) — opens an episode on first signal, closes after 7min idle or `beforeunload`, persists to `sita_episodes`. `noteSignal(surface)` is the single ingestion point.
- **Affect loop** (`src/lib/sita-continuum/affect-loop.ts`) — listens on the global `sita-affect` window event; any UI can call `fireAffect({ signal, target_kind, target_ref })` to log thumbs/dismissals/replays into `sita_affect_events`.
- **Dream consolidator** — edge fn `sita-dream-consolidate` (cron `0 4 * * *`):
  1. Promotes recurring perception payloads (≥3 occurrences) into `sita_knowledge_nodes` (kind='concept').
  2. Decays low-confidence stale nodes (>30d, conf<0.4) and deletes when conf<0.05.
  3. Suggests gentle personality patches based on aggregated affect (proactivity↓ on dismissals, verbosity↑ on positive reactions).
- **Continuum context** (`src/lib/sita-continuum/continuum-context.ts`) — single `subscribeContinuum(fn)` API that gives every Sita surface a coherent `{ open_episode, recent_episodes, affect_net_72h, focus_quality }` snapshot, refreshed every 30s.
- **Mount** (`SitaContinuumMount` in `ShellLiveLayer`) — boots the tracker + affect loop, subscribes to `subscribeScreenContext`, `sita-voice-intent`, `sita-voice-reply`, `sita-voice-utterance` and feeds episode signals.

## Tables (Phase J)
- `sita_episodes` — bounded focus sessions (started_at, ended_at, primary_surface, intent_summary, signals_count, energy_score). RLS: owner-only.
- `sita_affect_events` — micro-feedback (signal, target_kind, target_ref, weight, expires_at = now() + 30d). RLS: owner-only. Hourly purge cron drops expired rows.

## Cron schedules
- `sita-dream-consolidate-nightly` — `0 4 * * *` (after reflection at 03:30).
- `sita-purge-episodes-weekly` — `13 4 * * 0` (Sun, deletes >180d episodes).
- `sita-purge-affect-hourly` — `37 * * * *` (deletes rows past `expires_at`).

## Invariants
- No new STT/TTS engines or buses — reuses Phase B/C/D/H signals.
- All durable state is RLS-locked per user; the dream consolidator runs with service role but iterates one user at a time.
- The consolidator is idempotent per day — re-running just nudges confidences and skips small recurrences.
- The episode tracker auto-recovers from a stale `localStorage` open-episode row if it's >1h old.

## How to fire affect from any UI
```ts
import { fireAffect } from "@/lib/sita-continuum";
fireAffect({ signal: "thumbs_up", target_kind: "whisper", target_ref: nudgeId });
```
The mount listens once globally — no provider wiring needed.