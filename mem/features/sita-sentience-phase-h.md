---
name: Sita Sentience Layer (Phase H)
description: Personality engine, knowledge graph, proactive briefings, conflict resolver, perception layer, and tuner.
type: feature
---

Phase H of Sita-as-Jarvis — the Sentience Layer that gives Sita a stable voice, long-term memory of people/preferences, and proactive briefings.

## Surfaces
- **Personality engine** (`src/lib/sita-sentience/personality.ts`): one row per user in `sita_personality_profiles`. Drives persona (sita | jarvis | terse | warm | british), formality, verbosity, proactivity, humor, honorific, quiet hours.
- **Knowledge graph** (`knowledge-graph.ts`): `sita_knowledge_nodes` + `sita_knowledge_edges` for people/places/preferences/habits. Idempotent upsert by (user, kind, label).
- **Proactive briefings** (`briefings.ts`): `sita_proactive_briefings` queue surfaced through the existing `sita-whisper` event channel. Respects quiet hours + proactivity setting.
- **Conflict resolver** (`conflict-resolver.ts`): `sita_conflict_resolutions` for calendar/budget/mission/priority clashes.
- **Multimodal perception** (`perception.ts`): opt-in clipboard/screen signals into `sita_perception_events` (1-day TTL).

## Mounts
- `SitaSentienceMount` lazy-mounted in `ShellLiveLayer.tsx` — hydrates personality + polls due briefings every 90s.
- `SitaPersonalityControls` mounted in `ControlCenter.tsx` (section 1f).

## Edge functions
- `sita-briefings-generate` — pg_cron-friendly aggregator that crafts morning/midday/evening briefings. Idempotent per (user, kind, day).
- `sita-personality-tune` — JWT-protected. Returns suggested verbosity/proactivity patch from advisor_feedback signal.
- Planner (`sita-agent-planner`) accepts `world_state` + `mission_id` and biases output.

## Cron
- TTL purges (perception) hourly via `purge_sita_perception_events()`.
- Reflection loop nightly at 03:30 UTC.

## Invariants
- All Phase H tables RLS-locked to `auth.uid() = user_id`.
- Perception is opt-in; no recording without `enablePerception()` and visible REC chip in HUD.
- Persona changes never bypass the 12-stage kernel — purely cosmetic + system-prompt fragment.