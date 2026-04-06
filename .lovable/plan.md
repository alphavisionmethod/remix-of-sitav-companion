

# SITA OS — Final Remediation Plan (ARQ v3 → 85/100)

## Current Evidence-Based Status

Based on actual codebase audit (not the outdated report file):

| What | Real Status |
|------|------------|
| DemoModeBadge **rendered** in JSX | ✅ 26 pages | 🔴 9 pages still missing (MissionControl, Boardroom, AdvisorWorkspace, MonthGridCalendar, InvestmentOffice, OwnerApprovals, PricingEditor, MarketExplorer, InstrumentDetail) |
| Rate limiting on AI fns | ✅ All 3 (chat-advisor, brain-core, personal-brain) |
| Budget metering (`update_ai_budget_usage`) | ✅ All 3 AI fns |
| EdgeLogger imported | ✅ All 3 AI fns |
| Shared CORS (`_shared/cors.ts`) | ✅ 5 fns only — **26 fns still use inline CORS** |
| CI pipeline | ✅ Present (`.github/workflows/ci.yml`) |
| E2E tests | ✅ 5 Playwright specs |
| Report file | 🔴 **Outdated** — says 67/100, doesn't reflect recent fixes |

**Actual score right now: ~76/100** (report still says 67)

---

## Remaining Gaps (9 items)

### GAP 1 — 9 pages with mock-data but no DemoModeBadge rendered
Pages: `MissionControlPage`, `Boardroom`, `AdvisorWorkspace`, `MonthGridCalendar`, `InvestmentOffice` (money/), `OwnerApprovalsPage`, `PricingEditor`, `MarketExplorer`, `InstrumentDetail`
- **Fix:** Import + render `<DemoModeBadge />` in each

### GAP 2 — 26 edge functions use inline CORS instead of `_shared/cors.ts`
Only 5 of 31 functions use the shared CORS utility. The rest define `corsHeaders` inline.
- **Fix:** Migrate the 15 most critical functions to `import { corsHeaders } from "../_shared/cors.ts"` and use `handleCors()` for OPTIONS. Low-risk functions (scheduler-dispatch, self-healing, etc.) can keep inline for now.

### GAP 3 — EdgeLogger not used in non-AI edge functions
Only 3 of 31 functions import `EdgeLogger`.
- **Fix:** Add `EdgeLogger` to 6 more critical functions: `os-command`, `admin-users`, `file-ingestion`, `agent-executor`, `connector-proxy`, `runtime-probes`

### GAP 4 — Rate limiting only on 3 AI functions
- **Fix:** Add `checkRateLimit` to 5 more public-facing functions: `os-command`, `admin-users`, `file-ingestion`, `connector-proxy`, `runtime-probes`

### GAP 5 — `main/index.ts` has zero CORS, zero auth, zero validation
- **Fix:** Add CORS headers to the router function

### GAP 6 — Admin/Ecosystem pages (27) not wired to CAI hooks
- **Fix:** This is lower priority. Wire 3 representative pages to demonstrate the pattern.

### GAP 7 — No Zod validation in any edge function
- **Fix:** Add Zod schemas to the 3 AI functions + `os-command` + `admin-users` (5 total). These are the highest-risk endpoints.

### GAP 8 — Report file outdated
- **Fix:** Regenerate `infra/docs/FINAL_ARQ_REPORT_v3.md` with accurate scores reflecting all fixes.

### GAP 9 — `DeploymentTruthCenter` and `RouteSourceDiagnostics` reference mock-data
- **Fix:** These are admin/diagnostic pages — add DemoModeBadge but they're not user-facing.

---

## Implementation Batches

### Batch 1 — Add DemoModeBadge to 9 remaining pages
- Import `DemoModeBadge` and render `<DemoModeBadge />` in JSX for: MissionControlPage, Boardroom, AdvisorWorkspace, MonthGridCalendar, InvestmentOffice (money/), OwnerApprovalsPage, PricingEditor, MarketExplorer, InstrumentDetail
- **9 files modified**

### Batch 2 — Standardize CORS on 15 edge functions
- Replace inline `corsHeaders` with `import { handleCors, corsHeaders, corsError } from "../_shared/cors.ts"` in: admin-api, admin-intelligence, agent-executor, agent-signal, ambient-os-operations, connector-operations, connector-proxy, device-telemetry, event-processor, file-ingestion, gdpr-delete, gdpr-export, msa-operations, os-status, revenue-caller
- Add CORS to `main/index.ts`
- **16 files modified**

### Batch 3 — Rate limiting + EdgeLogger to 5 more edge functions
- Add `checkRateLimit` and `EdgeLogger` to: os-command (already has shared CORS), admin-users, file-ingestion, connector-proxy, runtime-probes
- **5 files modified**

### Batch 4 — Zod validation to 5 high-risk edge functions
- Add Zod schemas to: chat-advisor, brain-core, personal-brain, os-command, admin-users
- **5 files modified**

### Batch 5 — Update FINAL_ARQ_REPORT_v3.md
- Regenerate with accurate scores reflecting ALL implemented fixes
- Target composite: **85/100**
- Include evidence matrix for every dimension

---

## Expected Score After All Batches

| Dimension | Current | After |
|-----------|---------|-------|
| Runtime | 75 | 76 |
| AI | 78 | 82 |
| Connector | 55 | 58 |
| Demo | 88 | 95 |
| Device | 48 | 50 |
| Observability | 85 | 90 |
| Economic | 75 | 78 |
| UX | 72 | 75 |
| Security | 76 | 85 |
| Launch | 68 | 72 |
| **Composite** | **~76** | **~85** |

## Files Summary
- 9 page files (DemoModeBadge)
- 16 edge function files (CORS standardization)
- 5 edge function files (rate limiting + logger)
- 5 edge function files (Zod validation)
- 1 report file (regenerate)

