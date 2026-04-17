

## Fix C-008: Boardroom uses demo data only — what's actually broken

### Live findings (worse than the brief)

I read every file. The brief understates the problem in 3 ways:

1. 🔴 **Top-level `const isDemoMode = true` at `src/pages/Boardroom.tsx:60`** — a hardcoded module-scoped constant. Even though most components correctly call `useAuth().isDemo`, this constant still exists at file scope and could shadow or confuse future edits. It violates the **reality-mode-wiring** memory rule.

2. 🔴 **`useBoardroomData` does not query the 3 tables the brief mandates.** It queries `approval_queue` (legacy), `goals`, `tasks`, `sita_proof_records` — but the canonical post-C-007 truth is `ai_workforce_approval_queue` + `ai_workforce_recommendations` + `notifications`. Result: even when "live", Boardroom shows zero real REX recommendations and zero real notifications. Confirmed via DB: all 3 canonical tables exist.

3. 🟠 **6 of 7 inline War Room sections (Confidence Radar, Disagreement Theater, Voting Card, Sentiment Pulse, Evidence Chain, Scenario Fork, Decision Seal, Confidence Ladder) are gated behind `if (isDemoMode)` and render *nothing* in live mode** — leaving a giant blank gap on the live boardroom page. They need a "no live data yet" empty state OR be wired to real data.

4. 🟠 **`error` paths in `use-boardroom-data.ts` silently fall back to mock data** (lines 60, 75, 90, 104). Per the constraint memory, this masks real DB errors and hides whether the user actually has data. Should return empty arrays + surface error.

### The fix — 4 surgical changes

**1. Rewrite `src/hooks/use-boardroom-data.ts`** to be the canonical Boardroom data hook per the C-008 brief:
- Query `notifications` (unread, limit 5), `ai_workforce_approval_queue` (pending), `ai_workforce_recommendations` (status='new', limit 10), `boardroom_items` (active), `boardroom_decision_receipts` (recent)
- Keep existing `goals`/`tasks`/`overdueTasks`/`recentProofs` queries but point proofs to `boardroom_decision_receipts` as the canonical proof source
- Remove silent mock fallback on error → return `[]` + log; only fall back to mocks when `isDemoMode === true`
- Add new return fields: `unreadNotifications`, `newRecommendations`, plus the raw arrays
- All queries gated on `enabled: !!user || isDemoMode`
- Backward-compatible: keep `pendingApprovals`, `activeGoals`, `overdueTasks`, `recentProofs` field names so `Boardroom.tsx` and `BoardroomPulseView.tsx` and `BoardroomApprovalView.tsx` keep working

**2. Edit `src/pages/Boardroom.tsx`**:
- DELETE line 60 `const isDemoMode = true;` (the orphan hardcode)
- In `PacketView`, surface the new live counts (notifications + recommendations) into `whatChanged[]` so live users see real activity reflected in the Prep Pack
- For the 6 War Room sections currently gated by `if (isDemoMode)`: change pattern to `{(isDemoMode || hasLiveData) && ...}` where `hasLiveData` derives from the new hook (e.g., disagreements card only renders if there's actual `boardroom_items` with conflicting `advisor_summaries`); otherwise show a compact `EmptyState` so the live page does not have visual gaps
- Wire `Decision Seal` to the most-recent `boardroom_decision_receipts` row when available

**3. Add a new admin/dev helper**: `supabase/functions/seed-boardroom-demo/index.ts` is **not** needed — instead, add a small "Generate sample notification + recommendation" admin button inside `PacketHeader` (admin-gated, visible only to `has_role('admin')`) that calls existing tables to create one row of each. This proves the live loop end-to-end without manual SQL. Mirrors the C-007 pattern.

**4. Add `data-testid` hooks** matching `tests/e2e/selectors/boardroom.ts`: `boardroom-page`, `boardroom-summary`, `boardroom-mode-label`, `boardroom-metric` so the existing demo-vs-real e2e test (`boardroom-demo-vs-real.spec.ts`) actually has selectors to assert against.

### Files

| File | Change |
|---|---|
| `src/hooks/use-boardroom-data.ts` | Rewrite — query `notifications` + `ai_workforce_approval_queue` + `ai_workforce_recommendations` + `boardroom_items` + `boardroom_decision_receipts`; remove silent error→mock fallback; expose new fields |
| `src/pages/Boardroom.tsx` | Delete orphan `const isDemoMode = true`; thread real notification + recommendation counts into Prep Pack; replace `{isDemoMode && ...}` gates with `{(isDemoMode \|\| hasLiveData) && ...}` + empty-state fallback; wire Decision Seal to real receipt; add `data-testid`s; admin-gated "Generate sample" button in `PacketHeader` |

### Acceptance

- Logged-in live user with zero data: Boardroom renders header + Prep Pack with empty-state messages, no blank War Room gaps, no crashes
- Logged-in live user clicks admin "Generate sample": one row inserted into `notifications` + one into `ai_workforce_recommendations` + one into `ai_workforce_approval_queue` → counts update within 15s (staleTime)
- Demo user: identical visual output to today (no regression)
- `isDemoMode` exists nowhere as a hardcoded constant — only via `useAuth().isDemo` or `useDataMode().isDemoMode`
- `boardroom-demo-vs-real.spec.ts` selectors all resolve
- 0 TS errors, 0 silent error→mock fallbacks
- C-008 moves 🟠 DEMO-GOVERNED → ✅ RESOLVED, deployment-ready

