

# Phase 2 — Dashboard, Workspaces, Chats & 9-Mode Brain

Replace the bare chat page with a true Brain home. Persist every chat and message in `pb_*` tables, introduce workspaces, and expose all 9 mode prompts the Phase-0 edge router already supports.

## What you'll see

- Visiting `/personal-brain` (post-onboarding) lands on **BrainDashboard** instead of a blank chat.
  - Header: greeting + Personal/Business workspace toggle + "New Chat" + "Voice" CTA (placeholder until Phase 4).
  - Cards: **Continue Chats** (recent 5 from `pb_chats`) · **Active Goals** (from `pb_goals` with progress) · **Workspaces** (`pb_workspaces` grid + create) · **Brain Insights** (top 3 inferred memories) · **Suggested Prompts** (mode-aware starter chips).
- `/personal-brain/w/:workspaceId` → workspace home: that workspace's chats, files, scoped memories, default mode.
- `/personal-brain/c/:chatId` → focused chat view, persisted in `pb_messages`, with the **9-mode picker** (Think · Learn · Build · Create · Research · Strategize · Coach · Reflect · Decide).
- New chat side **Context Drawer** ("What memory & sources informed this reply") — reads `sources` jsonb on each `assistant` row.
- "Convert to…" menu on any assistant message → New Note / Task / Project (writes to existing `notes`/`tasks` tables; project = new `pb_workspace`).

## How it works

1. **Routing** — extend `src/routes/os-routes.tsx`:
   ```tsx
   <Route path="/personal-brain" element={<PersonalBrain />} />
   <Route path="/personal-brain/w/:workspaceId" element={<PersonalBrainWorkspace />} />
   <Route path="/personal-brain/c/:chatId" element={<PersonalBrainChat />} />
   ```
   `PersonalBrain.tsx` becomes a thin gate → onboarding → `BrainDashboard`.

2. **Data hooks** (`src/components/personal-brain/hooks/`):
   - `usePbWorkspaces()` — list/create/archive `pb_workspaces`.
   - `usePbChats(workspaceId?)` — list/create/rename/pin/archive `pb_chats`.
   - `usePbChat(chatId)` — load a chat + its `pb_messages` + realtime subscribe.
   - `usePbGoals()` — list/upsert `pb_goals` for dashboard progress.
   - `usePbInsights()` — top 3 active inferred `pb_memories`.

3. **Chat send path (persistent)** — `usePbChat.send(content, mode)`:
   - Insert `pb_messages` (role=user) **before** invoke (optimistic).
   - `supabase.functions.invoke("personal-brain", { body: { messages, mode, chatId } })` — edge already accepts `chatId` and persists user-side; Phase 2 adds **assistant-side persistence** in the edge function (one small additive change in `actionInfer`: collect SSE delta on the server only when `chatId` present, write final assistant `pb_messages` row with `sources` jsonb listing memories used).
   - Auto-create chat on first message if none yet (writes `pb_chats` with mode + workspace).
   - Update `pb_chats.last_message_at` (already wired).

4. **9-Mode picker** — replace the 4-button strip with a `ModePicker` primitive listing all 9 modes (icon + label + 1-line description) sourced from a shared `BRAIN_MODES` const co-located with the edge `MODE_PROMPTS`. Mode persists per chat (`pb_chats.mode`).

5. **Components** (new under `src/components/personal-brain/`):
   `BrainDashboard.tsx`, `BrainHero.tsx`, `WorkspaceCard.tsx`, `WorkspaceGrid.tsx`, `WorkspaceSwitcher.tsx`, `GoalProgressCard.tsx`, `BrainInsightCard.tsx`, `SuggestedPromptStrip.tsx`, `ChatList.tsx`, `ChatRow.tsx`, `ModePicker.tsx`, `ContextDrawer.tsx`, `ConvertMessageMenu.tsx`, `BRAIN_MODES.ts`.

6. **Pages** (new under `src/pages/personal-brain/`):
   `PersonalBrainWorkspace.tsx`, `PersonalBrainChat.tsx` (the actual chat surface; old `PersonalBrainInner` is deleted in favor of this).

7. **Mobile** — add `"/personal-brain": "/mobile"` to `MOBILE_ROUTE_MAP_EXTENDED` in `src/App.tsx` (mobile Brain UI deferred to a later phase; for now mobile users land on home).

## Edge function additive change (small, safe)

In `supabase/functions/personal-brain/index.ts`, `actionInfer` currently streams the response unmodified. Add a **branched path when `chatId` is present**: tee the SSE stream — pass-through to the client AND parse deltas server-side to build the final assistant content, then `pb_messages` insert with `{ role:"assistant", content, sources: { memories_used:[…] }, tokens }`. Falls back gracefully on parse errors. No change to legacy (no-`chatId`) behavior. Bumps the existing edge function smoke test with one extra assertion ("chatId persists assistant message").

## Verification gate (must pass before Phase 3)

- Manual round-trip: create workspace → open it → send "hello" in 3 different modes → reload → all 3 chats + their messages persist with the right mode.
- DB check: `select count(*) from pb_messages where role='assistant' and chat_id is not null` increases by 1 per send.
- Existing edge router tests still pass; one new test for assistant-persistence path added to `src/__tests__/edge-functions/personal-brain-router.test.ts`.
- No regression on the `/personal-brain` legacy path (no `chatId`) — old streaming SSE still works.

## Out of scope (later phases)

- Memory snapshot UI + `/remember` slash command + cron `learn.scan` → **Phase 3**.
- Voice orb, mic, cloud STT → **Phase 4**.
- Settings hub, security console, sensitive-mode UI, data export download button → **Phase 5**.

## Files

**New (~16):**
`src/components/personal-brain/BRAIN_MODES.ts`, `BrainDashboard.tsx`, `BrainHero.tsx`, `WorkspaceCard.tsx`, `WorkspaceGrid.tsx`, `WorkspaceSwitcher.tsx`, `GoalProgressCard.tsx`, `BrainInsightCard.tsx`, `SuggestedPromptStrip.tsx`, `ChatList.tsx`, `ChatRow.tsx`, `ModePicker.tsx`, `ContextDrawer.tsx`, `ConvertMessageMenu.tsx`, `hooks/usePbWorkspaces.ts`, `hooks/usePbChats.ts`, `hooks/usePbChat.ts`, `hooks/usePbGoals.ts`, `hooks/usePbInsights.ts`, `src/pages/personal-brain/PersonalBrainWorkspace.tsx`, `src/pages/personal-brain/PersonalBrainChat.tsx`.

**Edited:**
`src/pages/PersonalBrain.tsx` (becomes dashboard host), `src/routes/os-routes.tsx` (3 new routes), `src/App.tsx` (mobile mapping), `supabase/functions/personal-brain/index.ts` (assistant-side persistence in `actionInfer` when `chatId`), `src/__tests__/edge-functions/personal-brain-router.test.ts` (1 new assertion).

