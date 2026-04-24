# Jarvis Foundation — Unification Plan

## Audit findings (what already exists)

The repo is far more advanced than the prompt assumes. The "Jarvis foundation" is **already built in pieces** — the gap is **unification, not capability**.

**Already present and wired:**
- **World model** — `src/lib/sita-cortex/world-model.ts` + `sita_world_state` table, hydrated on auth via `SitaCortexMount` in `ShellLiveLayer`.
- **Agent loop (Plan→Confirm→Act)** — `useSitaAgent` → `sita-agent-planner` edge fn → `useCanonicalAction` execute → `sita-receipt` events → `SitaActionPlanCard`.
- **Advisor council** — `advisor_registry`, `advisor_agents`, `advisor_action_queue`, `advisor_board_recommendations`, `advisor_action_proof_packs`, `advisor_board_memory`, debate orchestrator, confidence policy, conflict resolution, persona boundaries, identity registry — all in `src/lib/advisors/` and `src/packages/advisor-runtime-contracts`.
- **Council pre-vote** — `sita_council_votes` + `sita-council-prevote` edge fn + `council.ts`.
- **Knowledge graph** — `sita_knowledge_nodes` + `sita_knowledge_edges` (Phase H Sentience).
- **Episodes/perception/personality** — `sita_episodes`, `sita_perception_events`, `sita_personality_profiles`, `sita_affect_events`.
- **Missions** — `sita_missions`, `sita_mission_milestones` + `missions.ts`.
- **Briefings** — `sita_proactive_briefings` + `sita-briefings-generate` edge fn + `sita-sentience/briefings.ts`.
- **Reflection** — `sita_journal_entries` + nightly `sita-reflection-loop` edge fn.
- **Personal Brain (51 tables)** — `pb_profile`, `pb_memories`, `pb_insights_signals`, `pb_chats`, etc.
- **Workflows / proof / receipts** — `workflow-step-contracts.ts`, `advisor_action_proof_packs`, hash-chained self-healing receipts, `evidence_graph_*` tables.
- **Shell layers** — `SitaPresenceOrb`, `SitaWhisper`, `SitaHudStrip`, `ControlCenter` toggles.

**The real gap:**
1. **No single canonical "operating intelligence" surface.** Capabilities are scattered across `/boardroom`, `/owner`, `/desktop`, `/personal-brain`, `/advisor-workspace`, `/global-boardroom` — none of them fuse world model + active mission + advisor council debate + proactive briefing + agent action queue + receipts + explanation into one operator console.
2. **Briefings are generated nightly but never surfaced** in a "what matters now" view.
3. **Knowledge graph has nodes/edges but no entity-centric view** (no `/entity/:id` surface).
4. **Action queue (`advisor_action_queue`) and agent plans (`sita_agent_plans`) live in different surfaces** — operator can't see one unified follow-through queue.
5. **No "why this, why now" explanation panel** — confidence/persona/council vote data exists but isn't rendered together.
6. **World model is read by the agent but not visible to the user** — no surface shows "this is what Sita currently believes about your world".
7. **Memory/timeline of past recommendations and outcomes** isn't navigable as one stream.
8. **No cross-session continuity surface** — episodes table exists but no "recent episodes" view.

## Target architecture

One canonical surface — **`/sita`** (route: `JarvisBridge`) — composed of 7 panels, each a thin view over **existing services and tables**. Plus 4 connective services that fuse already-disparate data, and a small set of new edge-function-backed endpoints where the data needs server-side aggregation.

```
/sita  (JarvisBridge)
├─ HUDFrame           (reuses Presence Orb + Whisper, already mounted)
├─ NowPanel           (active mission + top 3 briefings + "what changed since last visit")
├─ WorldModelPanel    (live snapshot from world-model.ts — visible for the first time)
├─ CouncilPanel       (active recommendations + dissent + pre-vote + persona + confidence)
├─ ActionQueuePanel   (unified: advisor_action_queue + sita_agent_plans + pending approvals)
├─ TimelinePanel      (sita_episodes + receipts + advisor_board_actions, one stream)
├─ ExplainPanel       (selected item: why, sources, council vote, confidence, reversibility)
└─ EntityDrawer       (object-centric view backed by sita_knowledge_nodes/edges)
```

## Build plan — ordered, all wired to real systems

### Phase J1 — Connective services (no UI yet, pure fusion layer)

New files under `src/lib/sita-jarvis/` (small, narrow, depends only on existing tables/hooks):

1. **`useNowSnapshot.ts`** — reads `sita_world_state` + `sita_missions` (active) + top 3 unread `sita_proactive_briefings` + last `sita_journal_entries` ("what changed since yesterday"). Single React Query hook.
2. **`useUnifiedActionQueue.ts`** — fuses `advisor_action_queue` (pending) + `sita_agent_plans` (status='proposed' or 'awaiting_confirmation') + `advisor_board_recommendations` not yet acted on. Returns one sorted list with source-tagged items, each carrying `confidence`, `reversibility`, `requiresApproval`.
3. **`useUnifiedTimeline.ts`** — fuses `sita_episodes` + `sita_perception_events` (last 48h) + `advisor_board_actions` (executed) + receipts from `advisor_action_proof_packs`. Returns one chronological feed.
4. **`useExplanation.ts`** — given a selected item id+source, hydrates: persona boundary (from `advisor-persona-boundary-map`), council vote (`sita_council_votes`), confidence gate result (`advisor-confidence-policy`), reversibility (`advisor-reversibility-map`), and source memories (`advisor_memories` joined to the recommendation).

All four are pure read hooks — no schema changes needed, all tables exist.

### Phase J2 — One canonical surface

New page **`src/pages/sita/JarvisBridge.tsx`** + 7 panel components in `src/components/sita/jarvis/`.

- Mounted as a windowed app in the OS shell (re-uses the existing windowing system — same pattern as `Boardroom.tsx`).
- Route added to `src/routes/os-routes.tsx`: `/sita` → `JarvisBridge`.
- Sidebar entry added under "Control Room" so it's discoverable but doesn't pollute the main app grid.
- Layout: 12-col grid using existing primitives (`Card`, `PremiumEmptyState`, glassmorphic surfaces from `mem://design/premium-ux-system`). Honest empty states everywhere — `PremiumEmptyState` with `variant="no-data"` when a table is empty.
- All panels lazy-load. The page composes existing components where they exist (e.g. `SitaActionPlanCard`, `RecommendationCard`, `MorningExecutiveBrief`) instead of reinventing them.

### Phase J3 — Surfacing the briefing pipeline (trustful proactivity)

The `sita-briefings-generate` edge function exists but the table is rarely populated and never read by the UI. Two small additions:

1. **Cron entry** — schedule `sita-briefings-generate` daily at 06:00 user-local (one row in pg_cron via the insert tool). Idempotent per (user, day).
2. **`NowPanel`** reads top 3 unread `sita_proactive_briefings` and exposes a "Mark seen" action that updates the row.

If the table is empty (cron hasn't run yet), `NowPanel` shows an honest "Sita hasn't generated a briefing yet — first one runs tomorrow at 06:00" empty state. **No fake briefings.**

### Phase J4 — Entity-centric view (knowledge graph becomes navigable)

New route **`/sita/entity/:nodeId`** → `EntityView.tsx`. Pure read of `sita_knowledge_nodes` (the entity) + `sita_knowledge_edges` (relationships) + back-references from `advisor_board_recommendations` (where this entity is mentioned) + receipts touching it.

This makes the existing knowledge graph **visible and navigable for the first time**. No schema changes.

### Phase J5 — Explanation contract (trust surfacing)

`ExplainPanel` renders, for any selected recommendation/plan/action:
- **Why this** — pulls from the recommendation's `rationale` + linked `advisor_memories`.
- **Why now** — from world-model triggers + mission alignment.
- **Who recommended** — advisor identity + persona boundary.
- **Council vote** — from `sita_council_votes` (consensus / dissent / abstain).
- **Confidence** — from `advisor-confidence-policy.evaluateConfidenceGate`.
- **Reversibility** — from `advisor-reversibility-map.getReversibility`.
- **What it will do** — plan steps from `sita_agent_plans`.
- **Approval state** — from `advisor_action_queue` row.

All data already exists. This panel is pure composition.

### Phase J6 — Tests and validators

Reusing the existing verification framework (`mem://architecture/verification-framework`):

1. **Unit** — `src/lib/sita-jarvis/__tests__/use-now-snapshot.test.ts`, `use-unified-action-queue.test.ts`, `use-unified-timeline.test.ts`, `use-explanation.test.ts`. Mock supabase, assert correct fusion ordering, dedupe (apply the existing `dedupeById` pattern from `usePbInsightsSignals`).
2. **Page test** — `src/__tests__/pages/jarvis-bridge.test.tsx` — renders `/sita`, verifies 7 panels mount, verifies empty states are present (honest), verifies route appears in sidebar.
3. **E2E (Playwright)** — `tests/e2e/jarvis-bridge.spec.ts` — login, navigate to `/sita`, assert the 7 panels render, assert clicking an action queue item opens the explain panel with confidence + persona shown, assert clicking an entity link navigates to `/sita/entity/:id`.
4. **Stub regression** — extend the `check-no-literal-stubs.ts` validator to cover the new `src/lib/sita-jarvis/**` so no future hardcoded arrays leak in.

### Phase J7 — Implementation report

`JARVIS_FOUNDATION_IMPLEMENTATION_REPORT.md` documenting (Parts 1–5 from your prompt): existing systems built on, files added/modified, what's now Jarvis-like, tests added, what remains future-facing (e.g. true cross-device handoff is Phase F-spatial, not Jarvis Bridge; we won't reimplement it).

## What I will explicitly NOT do (anti-bloat guarantees)

- **No new advisor system.** Reuses `advisor_registry`, `advisor-runtime-contracts`, `useBusinessAdvisorBoard`, `useGrowthAdvisorBoard`.
- **No new agent loop.** Reuses `useSitaAgent` + `sita-agent-planner` + `useCanonicalAction`.
- **No new world model.** Reuses `world-model.ts`.
- **No new boardroom.** Existing `/boardroom`, `/global-boardroom`, `/business/boardroom`, `/money/boardroom` all stay; Jarvis Bridge links to them, doesn't replace them.
- **No new memory system.** Reuses `advisor_memories`, `pb_memories`, `sita_episodes`, `sita_journal_entries`.
- **No new schema changes** for J1, J2, J4, J5. The only DB write is the J3 pg_cron schedule for `sita-briefings-generate`. Everything else is read-fusion of existing tables.
- **No fake AI behavior.** Briefings only show if the cron has run. World model only shows what's in `sita_world_state`. Empty states are honest.
- **No second product.** Single `/sita` route inside the existing OS shell, lazy-loaded, windowed like every other app.

## Files that will be touched (concrete)

**New (~12 files):**
- `src/lib/sita-jarvis/use-now-snapshot.ts`
- `src/lib/sita-jarvis/use-unified-action-queue.ts`
- `src/lib/sita-jarvis/use-unified-timeline.ts`
- `src/lib/sita-jarvis/use-explanation.ts`
- `src/lib/sita-jarvis/index.ts`
- `src/pages/sita/JarvisBridge.tsx`
- `src/pages/sita/EntityView.tsx`
- `src/components/sita/jarvis/NowPanel.tsx`
- `src/components/sita/jarvis/WorldModelPanel.tsx`
- `src/components/sita/jarvis/CouncilPanel.tsx`
- `src/components/sita/jarvis/ActionQueuePanel.tsx`
- `src/components/sita/jarvis/TimelinePanel.tsx`
- `src/components/sita/jarvis/ExplainPanel.tsx`
- 4 unit tests + 1 page test + 1 Playwright spec
- `JARVIS_FOUNDATION_IMPLEMENTATION_REPORT.md`

**Modified (~3 files):**
- `src/routes/os-routes.tsx` — add `/sita` and `/sita/entity/:nodeId` routes
- `src/components/sita/shell/AppSidebar.tsx` (or equivalent control-room sidebar) — add Jarvis Bridge entry
- `scripts/governance/check-no-literal-stubs.ts` — extend coverage to `src/lib/sita-jarvis/**`

**DB (one insert via insert tool):**
- pg_cron schedule for `sita-briefings-generate` daily 06:00 UTC.

## Estimated outcome

After this lands, a user opening `/sita` sees, in one window:
- "Active mission: launch X. 3 briefings since yesterday. World state: 2 windows open, $4.2k cash runway, 1 bill due in 2 days."
- "Council recommends: defer the Q3 hire (advisor: Finance, confidence 0.82, council vote 4–1 dissent from Growth)."
- "Action queue: 3 pending approvals, 2 reversible, 1 awaiting your confirmation."
- "Last 48h: agent executed 7 actions (all receipted), advisor memory updated 12 times, 1 mission milestone hit."
- Click any item → Explain panel renders why/who/confidence/reversibility/what-it-will-do.

Every byte of that comes from tables and services **that already exist and have RLS**. No mock. No second app. No new advisor framework. Just fusion + one honest surface.

## Risks and mitigations

- **Risk:** users don't discover `/sita`. **Mitigation:** sidebar entry under Control Room + add it as the default landing app in `OwnerCenter`.
- **Risk:** empty state on first load looks bad. **Mitigation:** honest copy ("Sita is still learning your world — open a few apps and check back tomorrow") + mark it clearly as a "Day 0" state, not an error.
- **Risk:** the unified action queue duplicates items across sources. **Mitigation:** apply the proven `dedupeById` pattern (from `usePbInsightsSignals`) plus a `(source, source_id)` tuple key.
- **Risk:** cron doesn't fire in non-prod. **Mitigation:** also expose a "Generate now" button on the empty NowPanel that invokes `sita-briefings-generate` on demand (still honest — user-initiated).

## Approval gate

Approve to switch to default mode and execute J1 → J7 in order. I will stop after J3 and surface the unified surface for review before adding entity view + tests, in case you want to reshape the layout first.