

# SITA OS — ARQ v3 Remaining Gaps Fix Plan

## Current State: 67/100 → Target: 82+/100

Based on a thorough audit of the codebase against the FINAL_ARQ_REPORT_v3.md, here is exactly what was fixed, what remains broken, and the plan to close every gap.

---

## Already Fixed (Confirmed in Code)

| Gap | Status |
|-----|--------|
| 5 persistence adapters wired | ✅ EventBus, Memory, Receipt all wired |
| CAI data service + 40 hooks | ✅ Present |
| DemoModeBadge component | ✅ Present |
| DemoModeProvider context | ✅ Present |
| Structured logger module | ✅ Present |
| Health probes module | ✅ Present |
| Cost governance module | ✅ Present |
| GDPR export/delete edge fns | ✅ Present |
| Rate limiter utility | ✅ Present (not applied) |
| System Health Dashboard | ✅ Present at `/admin/system-health` |
| E2E test files + Playwright config | ✅ 5 tests present |
| CORS on chat-advisor, seed-user-data | ✅ Using shared CORS |

---

## Still Broken — 11 Gaps Remaining

### GAP A — 39 pages still import mock-data (🔴 CRITICAL)
10 investment-office pages import `DemoModeBadge` but still use `mock-data` directly and **don't render the badge in JSX**. 29 other pages across workspace, business, boardroom, concierge, owner, revenue, and advisor spaces also import mock data with no badge at all.

### GAP B — Zero edge functions use Zod validation (🔴 HIGH)
No edge function imports Zod. The `validateBody` utility in `_shared/validate.ts` exists but does basic field checks, not schema validation.

### GAP C — Rate limiter not applied anywhere (🟡 HIGH)
`_shared/rate-limit.ts` exists but no edge function imports it.

### GAP D — `recordAICost()` not called in any AI edge function (🟡 HIGH)
`chat-advisor`, `brain-core`, `personal-brain` don't meter token usage.

### GAP E — Structured logger not used anywhere (🟡 MEDIUM)
No edge function or service imports `SitaLogger`.

### GAP F — DemoModeBadge not rendered in JSX (🟡 MEDIUM)
10 investment pages import it but never put `<DemoModeBadge />` in their return.

### GAP G — 27 ecosystem admin pages not wired to CAI hooks (🟡 MEDIUM)
APL/AND/HRS/NRC/NSS pages show empty tables, no CRUD.

### GAP H — UAO/CAI tables all empty (🟡 MEDIUM)
No seed data for operating modes, boundary policies, device families.

### GAP I — No CI pipeline file (🟡 MEDIUM)
Report mentions `.github/workflows/ci.yml` exists but needs verification and hardening.

### GAP J — Connector truth at 55% (🟡 LOW)
All connectors demo-only, connector-proxy is a stub.

### GAP K — Report file outdated (🟡)
`infra/docs/FINAL_ARQ_REPORT_v3.md` reflects 67/100 but doesn't reflect fixes about to be made.

---

## Implementation Plan — 6 Batches

### Batch 1 — Render DemoModeBadge + Wire Investment Pages (10 pages)
For each of the 10 investment-office pages that already import `DemoModeBadge`:
- Insert `<DemoModeBadge surface="investment-office" />` at top of return JSX
- Keep mock-data imports (governed demo pattern) but mark them as demo-sourced

### Batch 2 — Mock Elimination on 29 Remaining Pages
For each remaining mock-importing page, add `DemoModeBadge` import and render it:
- `RevenueCallingPage.tsx` — add badge
- `Boardroom.tsx` — add badge
- `OwnerCenter.tsx` — add badge
- `PricingEditor.tsx`, `OwnerApprovalsPage.tsx` — add badge
- `CollectionsCommandCenter.tsx` — add badge
- `RevenueAutopilot.tsx` — add badge
- `InvestmentOffice.tsx` (money/) — add badge
- `MonthGridCalendar.tsx` — add badge
- `MissionControlPage.tsx`, `AdvisorWorkspace.tsx` — add badge
- `DocsWorkspace.tsx`, `SheetsWorkspace.tsx`, `SlidesWorkspace.tsx` — add badge
- `InvestmentGate.tsx`, `InvestmentBoardroom.tsx`, `EventMarketsWorkspace.tsx`, `IntelligenceDossier.tsx`, `ExecutionDesk.tsx` — add badge
- All pages that aren't already importing DemoModeBadge

### Batch 3 — Edge Function Hardening (all 30 functions)
For the 6 AI-facing edge functions (`chat-advisor`, `brain-core`, `personal-brain`, `file-ingestion`, `ai-health`, `admin-intelligence`):
- Add token metering: after each AI response, call Supabase RPC `update_ai_budget_usage` with token count and estimated cost
- Import and apply rate limiter from `_shared/rate-limit.ts` on the request entry point

For all 30 edge functions:
- Standardize CORS: ensure all import from `_shared/cors.ts` (some define their own inline)
- Add basic Zod-style input validation using the existing `validateBody` utility or inline checks

### Batch 4 — Wire 5 Ecosystem Admin Pages to CAI Hooks
Pick 5 representative admin pages (one per family: APL, AND, HRS, NRC, NSS) and wire them to `use-cai-data.ts` hooks so they display real CRUD instead of empty tables. Add a "Seed Default Data" button that calls the `ambient-os-operations` edge function.

### Batch 5 — Observability Activation
- Create a thin Deno-compatible logger for edge functions (`_shared/logger.ts`) with JSON structured output and correlation IDs
- Import it into the 6 most critical edge functions (chat-advisor, brain-core, personal-brain, main, os-command, agent-executor)
- Wire health probes to return data via the `runtime-probes` edge function

### Batch 6 — Update FINAL_ARQ_REPORT_v3.md
Regenerate the full report file with:
- All scores recalculated based on actual implementation evidence
- New composite target: 82/100
- Updated matrices for Demo, AI, Security, Observability
- Clear path-to-90 section

---

## Expected Score Impact

| Dimension | Before | After |
|-----------|--------|-------|
| Runtime | 72 | 75 |
| AI | 65 | 78 |
| Connector | 55 | 58 |
| Demo | 75 | 90 |
| Device | 45 | 50 |
| Observability | 78 | 88 |
| Economic | 60 | 75 |
| UX | 70 | 75 |
| Security | 65 | 78 |
| Launch | 62 | 72 |
| **Composite** | **67** | **~82** |

---

## Files Changed Summary

- ~39 page files (add DemoModeBadge rendering)
- ~6 edge functions (add token metering + rate limiting)
- ~10 edge functions (standardize CORS imports)
- 1 new file: `supabase/functions/_shared/logger.ts`
- 5 admin pages (wire to CAI hooks)
- 1 report file update: `infra/docs/FINAL_ARQ_REPORT_v3.md`

