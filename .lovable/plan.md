

# SITA OS — Full Remediation Plan (ARQ v3 Gap Closure)

## Current State: 39.56/100 → Target: 70+/100

The ARQ v3 report identifies clear gaps. Here is what was **already done** vs what **remains unimplemented**.

---

## What Was Done (Confirmed Present)

| Item | Status |
|------|--------|
| 23 CAI database tables | ✅ Created with RLS |
| CAI data service (CRUD for all 23 tables) | ✅ `src/lib/data-services/cai-data-service.ts` |
| CAI React hooks (40+ TanStack Query hooks) | ✅ `src/hooks/use-cai-data.ts` |
| Structured logger | ✅ `src/lib/observability/structured-logger.ts` |
| Cost governance module | ✅ `src/lib/observability/cost-governance.ts` |
| Health probes module | ✅ `src/lib/observability/health-probes.ts` |
| DemoModeBadge component | ✅ `src/components/sita/DemoModeBadge.tsx` |
| GDPR export edge function | ✅ `supabase/functions/gdpr-export/` |
| GDPR delete edge function | ✅ `supabase/functions/gdpr-delete/` |
| AI wired to LOVABLE_API_KEY | ✅ 6 edge functions use it |
| DataModeContext | ✅ Already in use across hooks |
| 5 persistence adapters exist | ✅ In `src/lib/persistence/` |

---

## What Remains Unimplemented (13 Critical Gaps)

### GAP 1 — 5 Persistence Adapters Not Wired to Services (🔴 CRITICAL)

The persistence adapters exist but the actual service files **never import or call them**. `publish-event.service.ts` is purely in-memory — events, memory, policies, receipts, and action lineage are all lost on page refresh.

**Fix:** Modify 5 service files to import and call their persistence adapter functions on every write/read operation.

**Files to modify:**
- `src/lib/services/event-bus/publish-event.service.ts` → import `persistEvent()` from `event-bus-persistence`
- `src/lib/services/memory-service/profile-memory.service.ts` → import `persistMemoryEntry()` from `memory-service-persistence`
- `src/lib/services/memory-service/workflow-memory.service.ts` → same
- `src/lib/services/policy-engine/` → import `persistPolicyEvaluation()` from `policy-engine-persistence`
- Create receipt service wiring → import from `supabase-adapters`
- Wire action lineage → import from `action-lineage-persistence`

### GAP 2 — 39 Pages Still Import Mock Data (🔴 CRITICAL)

39 files in `src/pages/` still import from `mock-data`. These need to be converted to use Supabase queries with empty-state fallbacks.

**Fix:** For each page category:
- **Investment Office (~15 pages):** Replace `@/lib/investment-office/mock-data` imports with a new `use-investment-data.ts` hook that queries real tables, falling back to empty arrays with proper empty states
- **Workspace (3 pages):** Replace `@/lib/mock-data/workspace` with persistence hooks
- **Business (3 pages):** Replace `@/lib/mock-data` imports with Supabase queries
- **Concierge/Calendar (2 pages):** Replace `generateCalendarDemoEvents` with real queries
- **Admin/Other (~10 pages):** Replace inline mock arrays with real data + DemoModeBadge when appropriate

### GAP 3 — Boardroom Hardcoded Arrays (🔴 HIGH)

Boardroom pages use inline hardcoded arrays instead of any data source.

**Fix:** Wire boardroom pages to `use-boardroom-data.ts` (which already exists and queries Supabase) and show DemoModeBadge when data is empty.

### GAP 4 — 27 Ecosystem Admin Pages Show Empty Tables (🟡 HIGH)

The APL/AND/HRS/NRC/NSS admin pages exist but manage empty tables with no seed data and no CRUD wiring to CAI data service.

**Fix:** Wire each admin page to `use-cai-data.ts` hooks for actual CRUD operations. Add seed data button that calls `ambient-os-operations` edge function.

### GAP 5 — No E2E Tests (🔴 CRITICAL for launch)

Zero Playwright test files exist.

**Fix:** Create 5 Playwright E2E tests:
1. Auth flow (signup → login → profile)
2. File management (upload → browse → download)
3. AI chat (send message → receive response)
4. Navigation (sidebar → pages load)
5. Settings (update → verify persistence)

### GAP 6 — No CI Pipeline (🔴 CRITICAL for launch)

No GitHub Actions configuration.

**Fix:** Create `.github/workflows/ci.yml` with TypeScript check, Vite build, and Playwright E2E.

### GAP 7 — Edge Functions Missing CORS/Validation (~10 functions)

Some edge functions lack CORS headers or Zod input validation.

**Fix:** Audit all 29 edge functions, add consistent CORS import and Zod schemas to functions missing them.

### GAP 8 — No Rate Limiting on Edge Functions

No rate limiting anywhere.

**Fix:** Create `supabase/functions/_shared/rate-limit.ts` utility and apply to public-facing edge functions.

### GAP 9 — Structured Logger Not Used Anywhere

The logger module exists but no service or edge function imports it.

**Fix:** Import and use `SitaLogger` in:
- All edge functions (replace `console.log`)
- SitaKernel initialization
- Core service publish/subscribe paths

### GAP 10 — Health Probes Not Connected to Any Dashboard

`health-probes.ts` exists but nothing renders it.

**Fix:** Create a `SystemHealthDashboard.tsx` page that calls health probes and displays real-time status.

### GAP 11 — Cost Governance Not Metered

`cost-governance.ts` exists but AI edge functions don't call it.

**Fix:** Add `trackTokenUsage()` calls to `chat-advisor`, `brain-core`, and `personal-brain` edge functions after each AI response.

### GAP 12 — Demo Governance Framework Incomplete

`DemoModeBadge` exists but no `DemoModeProvider` or mode registry. Pages don't use the badge.

**Fix:** Create `DemoModeProvider` context, mode registry, and add `DemoModeBadge` to all 39 pages that use mock data.

### GAP 13 — UAO/CAI Tables All Empty (44+ tables)

Tables exist but contain no seed data.

**Fix:** Create seed data edge function call or migration that populates default operating modes, assistant role templates, boundary policies, device families, and provider families.

---

## Implementation Order (8 Batches)

### Batch 1 — Wire 5 Persistence Adapters (highest leverage)
Modify 5-6 service files to import and call persistence adapter functions.

### Batch 2 — Investment Office Mock Elimination (15 pages)
Create `use-investment-data.ts` hook, replace all mock imports, add empty states.

### Batch 3 — Remaining Mock Elimination (24 pages)
Convert workspace, business, calendar, admin, boardroom pages to real data.

### Batch 4 — Wire Ecosystem Admin Pages to CAI Hooks
Connect 27 admin pages to `use-cai-data.ts` for CRUD.

### Batch 5 — Demo Governance Framework
Create `DemoModeProvider`, mode registry, add badges to all mock-backed surfaces.

### Batch 6 — Observability Activation
Wire structured logger to edge functions, connect health probes to dashboard, wire cost metering.

### Batch 7 — Edge Function Hardening
Add CORS/Zod to remaining functions, create rate limiter, apply to public endpoints.

### Batch 8 — E2E Tests + CI + Updated ARQ Report
Create Playwright tests, CI pipeline, and regenerate the FINAL_ARQ_REPORT_SITA_OS_v3.md as a file in the codebase at `infra/docs/FINAL_ARQ_REPORT_v3.md`.

---

## Expected Outcome

| Metric | Before | After |
|--------|--------|-------|
| Composite Truth Score | 39.56 | ~72 |
| Mock-dependent pages | 39 | 0 |
| Orphaned persistence adapters | 5 | 0 |
| E2E tests | 0 | 5 |
| CI pipeline | absent | present |
| Pages with DemoModeBadge | 0 | all mock-backed |
| Edge fns with CORS+validation | ~19/29 | 29/29 |
| Structured logging in edge fns | 0 | 29 |
| Cost metering active | no | yes |

## Deliverable

The updated `infra/docs/FINAL_ARQ_REPORT_v3.md` will be regenerated at the end with all scores recalculated based on actual implementation evidence.

