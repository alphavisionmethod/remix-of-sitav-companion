# Fix 8 Stub Empty-State Surfaces — Production Deployment Plan

## Ground Truth (verified against your actual repo + DB)

I inspected each of the 8 surfaces and your live database. The honest situation:

**Pattern in all 8 files:** Each page declares `const X: any[] = []` as a literal stub at module scope and renders from it. There is **no DB query**, **no hook**, **no service call**. The pages will *always* be empty no matter what data exists in the DB.

**Tables that already exist** (verified via `psql`):
- ✅ `connector_registry`, `connector_accounts`, `connector_receipts`, `connector_sync_runs` → Connector Control Center
- ✅ `alerts`, `incidents`, `incident_classifications` → Operations Command Center (services/SLOs need synthesis)
- ✅ `crm_automations` (with `runs`, `last_run_at`, `execution_log`) → Revenue Automation Health
- ✅ `quotes` (full schema with line_items, status, expires_at) → Quote Studio
- ✅ `advisor_registry`, `advisor_board_recommendations` → Growth Advisor Board

**Tables that DO NOT exist** (verified):
- ❌ No `pack_revenue_trend` / `pack_install_events` table → Pack Store Analytics
- ❌ No `integration_providers` registry table → Integration Catalog (data lives in `connector_registry` + a TS catalog file)
- ❌ No `catalyst_events` / `market_events` / `investment_events` table → Investment Catalyst War Room
- ❌ No `call_queue` / `call_log` table → Call Desk
- ❌ No `automation_fatigue_alerts` table → Revenue Automation Health (fatigue tab only)

**This is the key honesty rule:** I will NOT invent fake data. For surfaces with real tables, I wire the queries. For surfaces without tables, I either (a) create the migration + seed real schema, or (b) render an honest "Awaiting first signal" `PremiumEmptyState` with a clear next-step CTA — never a fake row.

---

## Phase 1 — Wire 5 surfaces with existing tables (no migrations needed)

### 1.1 Connector Control Center (`src/pages/atlas/ConnectorControlCenter.tsx`)
- Replace `const connectors: any[] = []` with `useQuery` hook reading `connector_registry` + `connector_accounts` + last `connector_sync_runs.status`
- Compute `health = (successful_syncs_24h / total_syncs_24h) * 100`
- Replace `const auditTimeline: any[] = []` with `connector_receipts` ordered by `created_at desc limit 50`
- Render `PremiumEmptyState` with "Connect your first integration" CTA → `/integrations` when zero rows

### 1.2 Operations Command Center (`src/pages/atlas/OperationsCommandCenter.tsx`)
- Wire `alerts` tab → `select * from alerts where status='active' order by severity, last_seen_at desc`
- Wire `incidents` tab → `select * from incidents where status != 'resolved' order by severity, created_at desc`
- For `services` and `slos` (no dedicated tables yet): synthesize from `internal_agent_slo_snapshots` + `ai_runtime_failure_alerts` (both exist), grouped by `subsystem`
- Keep `runbooks` static from existing `src/lib/runbooks/registry.ts` (already real)
- Honest `PremiumEmptyState` per tab when zero rows

### 1.3 Revenue Automation Health (`src/pages/revenue-office/AutomationHealth.tsx`)
- Wire `automations` → `select * from crm_automations where user_id = auth.uid()` with computed `successRate = (runs - failures_in_execution_log) / runs * 100`
- Compute `healthMetrics` aggregate KPIs from the same query (avg success rate, total runs, recent failures, etc.)
- For `fatigueAlerts` (no table): keep an honest "Fatigue tracking activates after 100+ messages sent in a 7-day window" `PremiumEmptyState` — no fake alerts
- For `advisorInsights`: wire to `advisor_board_recommendations where category='automation'`

### 1.4 Quote Studio (`src/pages/revenue-office/QuoteStudio.tsx`)
- Wire `quotes` → `select * from quotes where user_id = auth.uid() order by created_at desc`
- Use existing schema fields: `title, amount_cents, currency, status, expires_at, line_items`
- `PremiumEmptyState` "Create your first quote" CTA when zero rows

### 1.5 Growth Advisor Board (`src/pages/revenue-office/GrowthAdvisorBoard.tsx`)
- Replace stubbed `ADVISORS` array with `useQuery` against `advisor_registry where domain='revenue'`
- Wire recommendations → `advisor_board_recommendations where status='new' order by urgency_score desc`
- Keep the rich `ADVISOR_RESPONSES` map (it's real fallback content for query types) but display only for advisors that actually exist in the registry
- `PremiumEmptyState` "Activate your advisor board" CTA → `/business/onboarding/advisor-activation` when registry returns zero

**Validation for Phase 1:** All 5 pages render real DB data when present, render canonical `PremiumEmptyState` with operator-grade copy + actionable CTA when empty. No fake fallback data anywhere.

---

## Phase 2 — Honest empty states for 3 surfaces with no backing table

### 2.1 Pack Store Analytics (`src/pages/store/StoreAnalyticsPage.tsx`)
**Current dishonesty:** `PACK_ANALYTICS` has 7 hardcoded rows with fake revenue numbers ($35,960 etc). The `REVENUE_TREND`/`CATEGORY_REVENUE`/`RETENTION_DATA` are empty arrays passed to recharts.

**Two options:**
- **Option A (recommended, fully real):** Create migration adding `pack_install_events` table (pack_id, user_id, event_type ['install'|'uninstall'|'activated'], revenue_cents, occurred_at). Wire `StoreAnalyticsPage` to aggregate from this. Until first event fires, show `PremiumEmptyState`. Remove hardcoded `PACK_ANALYTICS` entirely.
- **Option B (lower scope):** Keep page, replace hardcoded `PACK_ANALYTICS` with `[]`, render full-page `PremiumEmptyState` "Pack analytics activate when first install completes" with link to Pack Store.

I recommend **Option A** — it matches your `mem://infrastructure/receipt-emission` pattern (events fire from real install flow).

### 2.2 Integration Catalog (`src/pages/integrations/IntegrationsCatalog.tsx`)
**Current dishonesty:** `INTEGRATION_PROVIDERS = []`, so the catalog is permanently empty. But you have `connector_registry` (35+ real rows) and a typed catalog at `src/lib/services/integration-hub/providers.ts`.

**Fix:** Wire `INTEGRATION_PROVIDERS` to `connector_registry` (already populated), and `PROVIDER_CATEGORIES` derived from `distinct connector_class`. Use `connector_accounts where user_id = auth.uid()` for the connected/expired badges. No new tables needed.

### 2.3 Investment Catalyst War Room (`src/pages/investment-office/CatalystWarRoom.tsx`)
**Current dishonesty:** `CATALYST_EVENTS = []`. The page already calls `useRiskScenarios()` (real hook) but ignores its data and reads from the empty stub.

**Fix:** Create migration for `investment_catalyst_events` table (id, user_id, title, description, event_date, event_type ['macro'|'earnings'|'product'|'event'], impact, assets jsonb, portfolio_exposure_pct, created_at). Add `useCatalystEvents` hook. Render `PremiumEmptyState` "Connect your portfolio to surface catalyst events" → `/integrations?category=brokerage` until first row.

---

## Phase 3 — Call Desk (no table, needs migration)

### 3.1 Call Desk (`src/pages/revenue-office/CallDesk.tsx`)
**Current:** `callQueue`, `recentCalls`, `callStats`, `callAnalytics` all empty stubs.

**Fix:** Create migration `call_log` table (id, user_id, contact_name, contact_company, contact_id uuid nullable, priority ['critical'|'high'|'medium'|'low'], call_value_cents, reason, prep_notes, suggested_talking_points jsonb, status ['queued'|'in_progress'|'completed'|'skipped'], scheduled_at, completed_at, outcome, warmth_score, last_contact_at, created_at). Standard RLS. Wire page to it. Honest empty state when no rows.

---

## Phase 4 — Honesty enforcement & deployment gates

### 4.1 Add validator
Create `scripts/validation/check-no-literal-stubs.ts` — fails CI if any `src/pages/**/*.tsx` file contains the pattern `const \w+: any\[\] = \[\]` followed by a render reference to that array. This prevents the bug class from regressing.

### 4.2 Empty-state validator (already exists)
The 8 fixed surfaces will pass `check-empty-state-coverage.ts` because they'll all use `PremiumEmptyState` from `@/components/sita/PremiumEmptyState` (already canonical per `mem://design/elite-components`).

### 4.3 Update memory
Add `mem://features/stub-surface-elimination` documenting the 8 surfaces, the table they bind to, and the honest empty-state copy used — so future work doesn't reintroduce stubs.

---

## Migrations summary (3 new tables)

```sql
-- Phase 2.1 - pack analytics events
CREATE TABLE pack_install_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('install','uninstall','activated','first_value')),
  revenue_cents bigint NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}',
  occurred_at timestamptz NOT NULL DEFAULT now()
);
-- + index on (pack_id, occurred_at) and (user_id, occurred_at)
-- + RLS: users see own events, admins see all

-- Phase 2.3 - investment catalyst events
CREATE TABLE investment_catalyst_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  event_date date NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('macro','earnings','product','event')),
  impact text NOT NULL DEFAULT 'medium' CHECK (impact IN ('low','medium','high')),
  assets jsonb NOT NULL DEFAULT '[]',
  portfolio_exposure_pct numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- + RLS: users manage own

-- Phase 3 - call log
CREATE TABLE call_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid,
  contact_name text NOT NULL,
  contact_company text,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')),
  call_value_cents bigint NOT NULL DEFAULT 0,
  reason text NOT NULL DEFAULT '',
  prep_notes text NOT NULL DEFAULT '',
  suggested_talking_points jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','in_progress','completed','skipped')),
  scheduled_at timestamptz,
  completed_at timestamptz,
  outcome text,
  warmth_score integer NOT NULL DEFAULT 50,
  last_contact_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- + RLS: users manage own
-- + trigger: update_updated_at_column on UPDATE
```

---

## Files modified (8 page files + new infrastructure)

**Pages rewritten (literal stubs → real queries):**
- `src/pages/atlas/ConnectorControlCenter.tsx`
- `src/pages/atlas/OperationsCommandCenter.tsx`
- `src/pages/revenue-office/AutomationHealth.tsx`
- `src/pages/revenue-office/CallDesk.tsx`
- `src/pages/revenue-office/QuoteStudio.tsx`
- `src/pages/revenue-office/GrowthAdvisorBoard.tsx`
- `src/pages/investment-office/CatalystWarRoom.tsx`
- `src/pages/integrations/IntegrationsCatalog.tsx`
- `src/pages/store/StoreAnalyticsPage.tsx`

**New hooks (one per surface, colocated under `src/hooks/`):**
- `use-connector-control-center.ts`
- `use-operations-command-center.ts`
- `use-revenue-automation-health.ts`
- `use-call-desk.ts`
- `use-quote-studio.ts`
- `use-investment-catalyst-events.ts`
- `use-pack-store-analytics.ts`
- `use-integration-catalog.ts`
- `useGrowthAdvisorBoard.ts`

**New validator:**
- `scripts/validation/check-no-literal-stubs.ts` (fails CI on stub regression)

**New memory:**
- `.lovable/memory/features/stub-surface-elimination.md`

**Migrations (3):**
- `pack_install_events`, `investment_catalyst_events`, `call_log` with RLS + indexes + triggers

---

## Deployment readiness checklist

After implementation, the following gates pass:
- ✅ `check-empty-state-coverage` — all 8 surfaces use canonical `PremiumEmptyState`
- ✅ `check-admin-empty-state-consistency` — no raw `<p>No data</p>` patterns
- ✅ `check-thin-admin-empty-states` — no thin empty states
- ✅ NEW `check-no-literal-stubs` — no `const X: any[] = []` rendered patterns
- ✅ TypeScript: zero `as any` introductions in pages (per `mem://constraints/type-safety-standards`)
- ✅ RLS: every new table has policies (per Core memory rule)
- ✅ Demo Mode: every wired hook respects `useDataMode()` so demo path still works (per `mem://design/demo-mode-standardization`)

---

## What this is NOT

- **Not** seeding fake production data into your DB
- **Not** weakening any existing test or empty-state validator
- **Not** creating tables for surfaces that semantically don't need them (e.g., Operations services tab uses synthesized aggregates, not a fake `services` table)
- **Not** hiding the truth — when DB is empty, the page says "Connect X to populate Y" with a real CTA, not "No data available"

After this lands, all 8 🟡 statuses become 🟢: code wired to truth, honest empty states for first-run, and CI-enforced regression prevention.