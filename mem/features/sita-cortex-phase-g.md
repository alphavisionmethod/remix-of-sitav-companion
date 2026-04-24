---
name: Sita Cognitive Cortex (Phase G)
description: World model, missions, council pre-vote, ambient listening, reflection loop, predictive pre-warm.
type: feature
---

Phase G of Sita-as-Jarvis — the Cognitive Cortex that grounds the planner in current reality and learns from outcomes.

## Surfaces
- **World model** (`src/lib/sita-cortex/world-model.ts` + `useWorldModel.ts`): rolling snapshot of focused app, open windows, active mission, recent intents. Polled into the planner via `useSitaAgent`.
- **Missions** (`missions.ts`): `sita_missions` table; create/activate/complete a multi-step goal. Active mission is biased into every plan.
- **Council pre-vote** (`council.ts`): before surfacing a plan, low-cost advisor scoring is persisted to `sita_council_votes` (consensus, dissent, abstain).
- **Ambient listener** (`ambient-listener.ts`): opt-in mic/speech-stream that records intents to `sita_app_open_log` (1-day TTL). REC chip visible in HUD whenever active.
- **Reflection loop** (`reflection.ts` + `sita-reflection-loop` edge fn): nightly aggregator that turns receipts/plans into `sita_journal_entries` (lessons, wins, anomalies).
- **Predictive pre-warm** (`predictive-prewarm.ts`): warms likely-next apps based on the world model's recency/frequency signal.

## Mounts
- `SitaCortexMount` lazy-mounted in `ShellLiveLayer.tsx` — boots world-model polling, ambient listener (if enabled), pre-warm.
- `SitaCortexControls` mounted in `ControlCenter.tsx` — toggles for Ambient Mode, Missions, Journaling.

## Edge functions
- `sita-reflection-loop` — pg_cron 03:30 UTC. Idempotent per (user, day).
- Planner (`sita-agent-planner`) consumes `world_state` + `mission_id` + council scores.

## Cron
- Reflection loop nightly at 03:30 UTC.
- TTL purge for `sita_app_open_log` hourly.

## Invariants
- All Cortex tables RLS-locked to `auth.uid() = user_id`.
- Ambient listening is opt-in; visible REC chip in HUD whenever active.
- Council pre-vote is advisory — never blocks plan execution, only annotates.
