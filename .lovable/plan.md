

# Fix Phase F build + Phase G — "True Jarvis" Upgrade

## Part 1 — Immediate fix (1 line)

**File**: `src/components/sita/shell/sita-spatial/index.ts`
- Add `export { SitaSpatialIntentMount } from "./SitaSpatialIntentMount";`

That clears the TS2339 error blocking the preview.

---

## Part 2 — What's missing to be the most advanced Jarvis in the world

Phases A→F gave Sita: HUD, voice, screen context, proactive whispers, agentic execution, multi-device + spatial. To make it **truly Jarvis-grade** we need five more capability layers:

### Phase G — The Cognitive Cortex (the real upgrade)

A unified always-on reasoning brain that closes the loop between **perception → memory → planning → action → reflection**.

1. **Persistent World Model**
   - Single rolling "what Sita knows right now" graph: who you are, what you're working on, open windows, calendar next 48h, finance posture, concierge tasks, recent receipts, advisor opinions.
   - Backed by new table `sita_world_state` (one row per user, jsonb snapshot, updated by a debounced reducer).
   - Read by every Sita surface; eliminates per-feature context re-fetching.

2. **Long-Horizon Goals & Missions**
   - User can declare "missions" (e.g. *"Close Q3 with >£250k cash buffer"*, *"Move to Lisbon by March"*).
   - Sita decomposes each into milestones, schedules sub-plans, monitors drift, and surfaces weekly briefings.
   - New table `sita_missions` + `sita_mission_milestones`. Planner edge function gains a `mission_id` context field.

3. **Reflection & Self-Improvement Loop**
   - Nightly edge function `sita-reflection-loop` reads the day's `ai_action_receipts`, success/failure rates, user overrides, and writes a structured "lessons" record back to memory. Future plans bias against repeated mistakes.
   - User-visible "Sita Journal" panel in the HUD (read-only) shows the day's wins, blockers, and what Sita learned.

4. **Multi-Agent Council in the Background**
   - Promote the holographic boardroom into an **always-on advisory council** that silently scores every Phase E plan before it surfaces. Plans only reach the user when the council reaches quorum (≥4/6 advisors agree) OR when there's productive disagreement worth showing.
   - Reuses Phase E `ActionPlan` type — adds `council_votes` field + `dissent_summary`.

5. **Always-Listening Ambient Mode (opt-in, on-device)**
   - Wake-word ("Sita") with on-device VAD before activating the Phase B voice spine — no cloud streaming until intent is confirmed.
   - Toggle in Control Center, defaults OFF, gated by mic permission + a clear red recording dot in the HUD strip.

6. **Predictive Pre-warm**
   - Sita pre-opens the next likely app/window/document based on time-of-day + calendar + recent intent chain. Uses a tiny on-device markov over the last 200 launches in `sita_app_open_log`.

7. **Real-World Bridges**
   - Wire the existing connectors (Calendar, Email, Banking via Lovable Cloud, Slack/Teams) into typed skill packs so Phase E plans can actually act on the outside world, not just inside the OS.
   - New skill packs: `external.calendar.*`, `external.email.*`, `external.slack.*`, `external.banking.*`.

8. **Trust Receipts in the HUD**
   - Every action Sita takes autonomously surfaces a 3-second glassy "receipt chip" near the HUD orb with one-tap **Undo** for reversible actions.

### Files to add for Phase G

**New**
- `src/lib/sita-cortex/world-model.ts` — reducer + snapshot writer
- `src/lib/sita-cortex/useWorldModel.ts` — hook
- `src/lib/sita-cortex/missions.ts` — mission CRUD + decomposition helper
- `src/lib/sita-cortex/reflection.ts` — client-side daily journal viewer
- `src/lib/sita-cortex/council.ts` — pre-execution multi-advisor scorer
- `src/lib/sita-cortex/ambient-listener.ts` — wake-word + VAD (on-device only)
- `src/lib/sita-cortex/predictive-prewarm.ts` — Markov + launcher integration
- `src/lib/sita-agent/skills/external-skills.ts` — calendar/email/slack/banking
- `src/components/sita/shell/sita-cortex/SitaJournalPanel.tsx`
- `src/components/sita/shell/sita-cortex/SitaMissionsPanel.tsx`
- `src/components/sita/shell/sita-cortex/SitaTrustReceiptChip.tsx`
- `src/components/sita/shell/sita-cortex/SitaCortexMount.tsx`
- `supabase/functions/sita-reflection-loop/index.ts` (nightly cron-ready)
- `supabase/functions/sita-council-prevote/index.ts` (called by planner)
- `mem://features/sita-cortex-phase-g.md`

**Edited**
- `src/components/sita/shell/ShellLiveLayer.tsx` — mount `SitaCortexMount`
- `src/components/sita/shell/ControlCenter.tsx` — Cortex section (ambient listening, missions, journal toggles)
- `src/lib/sita-agent/agent-core.ts` — call council pre-vote, attach mission_id
- `src/lib/sita-agent/skill-registry.ts` — register external skill packs
- `supabase/functions/sita-agent-planner/index.ts` — accept `world_state` + `mission_id`, return `council_votes`
- Index memory file

### Pipeline & safety
- Every new path still flows through `useAction` → 12-stage kernel (trust, approval, budget, receipts) — no bypass.
- Ambient listening is opt-in, on-device VAD only, with a permanent visible recording indicator.
- Council pre-vote runs server-side via Lovable AI Gateway (`google/gemini-2.5-pro`), returns within 1.5s, never blocks the user — it just biases plan ordering.
- Mission decomposition obeys the existing AI Autonomy Ceiling Policy per domain.

### Data
- `sita_world_state` (user_id PK, snapshot jsonb, version, updated_at)
- `sita_missions` (id, user_id, title, success_criteria jsonb, status, target_at, created_at)
- `sita_mission_milestones` (id, mission_id, title, status, due_at, plan_id)
- `sita_council_votes` (id, plan_id, advisor_id, score, rationale, created_at)
- `sita_app_open_log` (id, user_id, app_id, opened_at) — TTL 30d
- `sita_journal_entries` (id, user_id, date, summary jsonb, lessons jsonb)
- All RLS-locked to `auth.uid() = user_id`.

### Out of scope (Phase H+)
- Native AR/VR shells, on-prem self-hosted Sita node, third-party developer skill SDK, federated Sita-to-Sita collaboration across users.

---

## Order of execution (when approved)
1. Apply the one-line index export fix → preview unblocks.
2. DB migration for the 6 new Cortex tables.
3. Edge functions (reflection loop + council pre-vote).
4. Cortex libraries + hooks.
5. Cortex UI panels + HUD mounts.
6. Wire planner + agent core to consume world state + mission + council votes.
7. Memory file + index update.

