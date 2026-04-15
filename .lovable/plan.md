

# Board of Advisors — Final Phases Completion & Error Audit

## Audit Results: What Is Done

### Phase 1: Database Schema — COMPLETE
- 8 tables created with RLS policies (1 policy each, `auth.uid() = user_id`)
- Realtime enabled on `advisor_board_recommendations` and `advisor_board_actions`
- All tables verified in production database
- Linter: 0 issues

### Phase 2: Unified Board API — COMPLETE
- `business-board-api` edge function: 453 lines, 20+ action routes
- Covers: boardroom.summary, recommendations CRUD, actions CRUD, memory CRUD, autonomy CRUD, health CRUD, profit signals CRUD, reflections CRUD, tool executions CRUD
- Auth: JWT validated in-code via `getUser()`
- Deployed and responding (401 for unauthenticated = correct)

### Phase 3: Cognitive Pipeline — COMPLETE
- `advisor-deep-intelligence`: 838 lines, 8-layer pipeline
- Perception → Normalization → Classification → Reasoning → Synthesis → Planning → Reflection → Persistence
- Multi-model routing (7 task types with fallbacks)
- 12 business archetypes with risk/flow/metric profiles
- 10 advisor personas with structured reasoning

### Phase 4: Frontend Wiring — COMPLETE
- `useBusinessAdvisorBoard.ts`: 637 lines, fully wired
- Queries: boardSummary, persistedRecs, healthScores, profitSignals, autonomyPolicies via BoardAPI
- Mutations: updateRecommendation, createAction, storeMemory, upsertAutonomy
- Realtime subscriptions on recommendations and actions tables
- `board-api-client.ts`: 277 lines, typed SDK covering all endpoints

### Phase 5: Model Routing — COMPLETE (inside Phase 3)
- 7 task-specific model routes with primary + fallback
- signal_classification → gemini-2.5-flash-lite
- advisor_reasoning → gemini-3-flash-preview
- reflection → gemini-2.5-flash-lite

### Phase 6: Admin Control Plane — COMPLETE
- 6 admin pages created and routed under `/admin/advisor-board/`
- All wired to real `BoardAPI` calls (not mock data)
- Routes registered in `AdminRoutes.tsx` with permission gates

---

## Issues Found

### Issue 1: AdvisorBoardCatalog uses LOCAL state only
The catalog page (`AdvisorBoardCatalog.tsx`) manages advisor enable/disable and intensity in `useState` — changes are lost on page reload. It needs to persist to the `advisor_autonomy_policies` table via `BoardAPI.upsertAutonomy()`.

### Issue 2: Missing `advisor_board_memory` reset-slice query chain bug
In `business-board-api/index.ts` line 248-254, the `memory.reset-slice` handler builds a query with conditional `.eq()` calls, but the `await query` happens after the conditional — the query variable from line 248 is `const` but the `.eq()` calls return a new query object (Supabase SDK is immutable). The conditionals need to reassign properly.

### Issue 3: Boardroom page components not consuming persistent data
The 16-tab boardroom page (`BusinessAdvisorBoardPage.tsx`) passes `board.*` props but individual tab components (insights, actions, proof, etc.) likely still rely on in-memory engine state for rendering rather than the new persistent `boardSummaryData`, `persistedRecommendations`, `healthScoresData`, etc.

### Issue 4: Missing `updated_at` triggers
The 8 new tables need `UPDATE` triggers calling `update_updated_at_column()` for the `updated_at` column to auto-update. The trigger function exists but may not be attached to these tables.

---

## Implementation Plan

### Task 1: Fix AdvisorBoardCatalog persistence
Wire enable/disable and intensity changes to `BoardAPI.upsertAutonomy()` so they persist. Load initial state from `autonomyPolicies` query.

### Task 2: Fix memory.reset-slice query chain
Use `let` instead of chaining on `const`, or restructure the conditional query building.

### Task 3: Add `updated_at` triggers to all 8 Board tables
Single migration adding `CREATE TRIGGER` for each table.

### Task 4: Wire boardroom tab components to persistent data
Update the key boardroom tabs (Insights, Actions, Proof, Health) to display data from `boardSummaryData`, `persistedRecommendations`, `healthScoresData`, and `persistedProfitSignals` alongside in-memory engine state.

### Task 5: TypeScript build verification
Run full build to confirm 0 errors across all files.

---

## Technical Details

- Migration: ~20 lines SQL for 8 `CREATE TRIGGER` statements
- AdvisorBoardCatalog.tsx: Add `useQuery` for autonomy policies, `useMutation` for upsert, replace local `useState`
- business-board-api: Fix ~5 lines in memory.reset-slice handler
- Boardroom tab components: Pass persistent data props alongside existing engine data

