# Phase 9 — Stub Surface Elimination (Deployment-Critical)

## Audit summary (what is actually broken vs. honestly empty)

| Surface | Real status | Fix class |
|---|---|---|
| **Connector Control Center** (`/atlas/connectors`) | ✅ Hook `useConnectorControlCenter` is wired to real `connector_registry`/`connector_accounts`/`connector_receipts`. Empty because `connector_registry` only has 12 rows and the user has 0 accounts. | **Seed registry + drop dead code** |
| **Operations Command Center** (`/atlas/operations`) | ✅ Hook wired; queues tab is **hardcoded inline** (lines 167-188), runbooks is local `[]` instead of `platform_runbooks`. | **Wire queues + runbooks to DB** |
| **Revenue Automation Health** | ✅ Hook wired; `fatigueAlerts` honestly returns `[]` (no backing table). | **Add `automation_fatigue_alerts` table + wiring** |
| **Call Desk** | 🔴 Page ignores any hook — local `callStats=[], callQueue=[], recentCalls=[], callAnalytics=[]` arrays shadow everything. No hook exists. | **Create `useCallDesk` hook backed by `calendar_events` (event_type='call') + new `call_outcomes` table** |
| **Quote Studio** | ✅ Hook wired to `quotes`; honest empty for upsells/insights. | **No-op (already correct)** |
| **Investment Catalyst War Room** | 🔴 `CATALYST_EVENTS: any[] = []` local stub. Hook `useRiskScenarios` queried but data ignored. | **Wire to `calendar_events` (domain='money', event_type IN ('earnings','macro','catalyst')) + `event_plans`** |
| **Investment Event Probability Lab** | 🔴 `EVENTS: any[] = [{...}]` local stub. | **Wire to `scenarios` (scenario_type='event_probability') + `risk_scenarios`** |
| **Pack Store Analytics** | 🔴 `REVENUE_TREND, CATEGORY_REVENUE, RETENTION_DATA` are `[]`; `PACK_ANALYTICS` is hardcoded mock. | **Wire to new `pack_install_metrics` aggregation view + use `boardroom_sessions`/`app_launch_events` for trend** |
| **Integration Catalog** | 🔴 `INTEGRATION_PROVIDERS: any[] = [], PROVIDER_CATEGORIES: any[] = []` shadow the canonical `src/lib/services/integration-hub/providers.ts` (35+ providers exist!). | **Replace local stub with the real module import — already exists** |
| **Growth Advisor Board** | ✅ Hook wired to `advisor_registry` (domain='revenue') + `advisor_board_recommendations`. Empty because no revenue advisors are seeded into `advisor_registry`. | **Seed 9 revenue advisors into `advisor_registry`** |

## Phase 9A — Pure code fixes (no DB writes)

### 9A.1 Fix `IntegrationsCatalog.tsx` — restore the canonical providers module
- **Bug**: `const INTEGRATION_PROVIDERS: any[] = []; const PROVIDER_CATEGORIES: any[] = []` shadows the real export.
- **Fix**: Import from `@/lib/services/integration-hub/providers` (already has 35+ providers + categories). Wire `My Connections` count to live `useConnectorControlCenter().data.connectors.filter(c => c.status !== "registered").length` instead of `demoConns = []`.
- **Result**: 35-provider grid renders immediately on first paint.

### 9A.2 Fix `StoreAnalyticsPage.tsx` — derive trends from real data
- Replace `REVENUE_TREND: any[] = []`, `CATEGORY_REVENUE: any[] = []`, `RETENTION_DATA: any[] = []`, and the inline `PACK_ANALYTICS` mock with a new hook **`useStoreAnalytics()`**:
  - `pack_installations` table → installs per pack per month (group by `installed_at::date_trunc('month')`).
  - `pack_purchases` table → revenue per pack/category over last 6 months.
  - `app_launch_events` filtered to pack-launches → retention cohorts (12-month with vs without pack).
  - Compute `attach_rate` from `pack_installations.user_id` ÷ active users; `arpu_uplift` from `commercial_memory_events`.
- For users with zero installs, render `<PremiumEmptyState variant="first-use">` per chart card with link to `/store`.

### 9A.3 Fix `CatalystWarRoom.tsx` — DB-backed catalyst timeline
- Create new hook **`useCatalystEvents()`** that queries:
  - `calendar_events` where `domain='money' AND event_type IN ('earnings','macro','catalyst','product','event')` ordered by `event_date ASC`, filtered to next 90 days for the current user.
  - `risk_scenarios` to compute `portfolioExposure` (join through `market_watchlist_items.symbol IN scenarios.assets`).
  - `event_plans` for `description` and `impact` enrichment.
- Replace `CATALYST_EVENTS: any[] = []` and use the hook. Render `<PremiumEmptyState variant="connect-to-activate">` with action "Open Catalyst Calendar" → `/calendar?domain=money` when no events.

### 9A.4 Fix `EventProbabilityLab.tsx` — DB-backed scenario trees
- Create new hook **`useEventProbabilities()`** that queries `scenarios` where `scenario_type='event_probability'` ordered by `(outputs->>'probability')::numeric DESC`.
- The `branches` field reads from `scenario.outputs.branches` (jsonb). The `impact` reads from `scenario.outputs.impact`.
- Replace `EVENTS: any[] = [{ name: "—", … }]` with hook. Empty state: "Run your first probability scenario" → `/investment-office/scenario-builder`.

### 9A.5 Fix `CallDesk.tsx` — wire to real call queue
- Create hook **`useCallDesk()`**:
  - `callQueue`: `calendar_events` where `event_type='call' AND event_date >= today` ordered by `priority` then `start_time`. Enrich with `crm_contacts` lookup by `notes` reference.
  - `recentCalls`: `calendar_events` where `event_type='call' AND event_date < today` LIMIT 20, joined with new `call_outcomes` table (created in 9B.1) for sentiment/outcome.
  - `callStats`: aggregated counts (today/this week/awaiting follow-up).
  - `callAnalytics`: derive from `call_outcomes` (avg duration, sentiment distribution, conversion to quote).
- Replace local `[]` stubs with hook. Render `<PremiumEmptyState variant="first-use">` action "Schedule first call" → `/calendar/new?type=call` on empty.

### 9A.6 Fix `OperationsCommandCenter.tsx` — runbooks tab + queues tab
- Replace local `runbooks: [] = []` with `fromTable("platform_runbooks").select(...)` inside the existing `useOperationsCommandCenter` hook. Add `runbooks: RunbookRow[]` to the return type.
- Queues tab: replace inline hardcoded array with a new `queues` field in the hook, derived from real `pg_stat_activity`/queue depth via existing `internal_agent_slo_snapshots` rows where `slo_name LIKE 'queue_%_depth'`. Until those snapshots exist, render `PremiumEmptyState` instead of fake values.

## Phase 9B — Database migrations (schema)

### 9B.1 New table: `call_outcomes`
```sql
create table public.call_outcomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  calendar_event_id uuid references public.calendar_events(id) on delete cascade,
  contact_name text,
  company text,
  duration_seconds integer not null default 0,
  sentiment text not null default 'neutral'
    check (sentiment in ('very positive','positive','warm','neutral','cool','negative')),
  outcome text not null default '',
  next_step text,
  quote_triggered boolean not null default false,
  follow_up_sent boolean not null default false,
  warmth_score integer check (warmth_score between 0 and 100),
  ai_prep_brief text,
  talking_points jsonb not null default '[]',
  objections jsonb not null default '[]',
  post_call_actions jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.call_outcomes enable row level security;
create policy "Users manage own call_outcomes" on public.call_outcomes
  for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create index idx_call_outcomes_user_created on public.call_outcomes(user_id, created_at desc);
create trigger trg_call_outcomes_updated before update on public.call_outcomes
  for each row execute function public.update_updated_at_column();
```

### 9B.2 New table: `automation_fatigue_alerts`
```sql
create table public.automation_fatigue_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  automation_id uuid references public.crm_automations(id) on delete cascade,
  contact_id uuid,
  channel text not null check (channel in ('email','sms','push','call')),
  signal text not null,                 -- e.g. 'unsubscribe_rate_spike'
  severity text not null default 'warning',
  evidence jsonb not null default '{}',
  acknowledged_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.automation_fatigue_alerts enable row level security;
create policy "Users manage own fatigue_alerts" on public.automation_fatigue_alerts
  for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create index idx_fatigue_alerts_user on public.automation_fatigue_alerts(user_id, created_at desc);
```

### 9B.3 New table: `pack_install_metrics` (aggregated daily, append-only)
```sql
create table public.pack_install_metrics (
  pack_id text not null,
  metric_date date not null,
  installs integer not null default 0,
  uninstalls integer not null default 0,
  active_users integer not null default 0,
  revenue_cents bigint not null default 0,
  arpu_cents bigint not null default 0,
  retention_30d numeric(5,4),
  attach_rate numeric(5,4),
  primary key (pack_id, metric_date)
);
alter table public.pack_install_metrics enable row level security;
create policy "Anyone can read pack metrics" on public.pack_install_metrics
  for select to authenticated using (true);
create policy "Admins write pack metrics" on public.pack_install_metrics
  for all to authenticated using (has_role(auth.uid(),'admin'))
  with check (has_role(auth.uid(),'admin'));
```

## Phase 9C — Reference-data seeds (non-PII, public reads)

### 9C.1 Seed `connector_registry` to 35+ providers
- Programmatically insert one row per `INTEGRATION_PROVIDERS` entry from `src/lib/services/integration-hub/providers.ts` so the Connector Control Center is non-empty even pre-OAuth.
- Use `INSERT ... ON CONFLICT (connector_id) DO UPDATE SET display_name=EXCLUDED.display_name, ...` so the script is idempotent.

### 9C.2 Seed `advisor_registry` with the 9 revenue advisors
- Insert: Revenue Strategist, Pipeline Analyst, Retention Guardian, Acquisition Advisor, Pricing Advisor, Engagement Coach, Reputation Analyst, Automation Strategist, Growth Synthesizer (all `domain='revenue'`).
- This unblocks `useGrowthAdvisorBoard` which currently returns `[]` because no rows exist for that domain.

### 9C.3 Seed `platform_runbooks` with 6 canonical platform runbooks
- Connector Reauth, Cron Lag Recovery, Edge Function Cold Start, RLS Audit Sweep, AI Budget Burnover, Webhook Replay. These power the Operations Center runbooks tab globally (system-owned `user_id`).

## Phase 9D — Validation gates

1. `npx tsc --noEmit` — zero errors after the new hooks are added.
2. `pnpm vitest run scripts/validators/check-no-as-any-pages.test.ts` — must remain green (we replace `any[]` stubs with proper types via `Database` Row inference).
3. Visit each surface in preview and confirm:
   - Connector Control Center: 35+ rows in registry list (even pre-connect).
   - Integration Catalog: 35+ provider cards, search and category filters work.
   - Operations Center → Runbooks: 6 platform runbooks rendered.
   - Growth Advisor Board: 9 advisor cards rendered.
   - Pack Analytics: real charts rendered when metrics exist; clean empty states otherwise.
   - Catalyst War Room / Event Lab / Call Desk: clean empty states with CTA when user has no events; populated when calendar/scenarios contain rows.
4. Update `STABILIZATION_AUDIT.md` — add Phase 9 entry, mark "Stub-Empty Surfaces" issue **CLOSED**, list which were honest-empty (Quote Studio, Revenue Automation, Call Desk, Catalyst Room) vs. real-broken (Integration Catalog stub-shadow, Pack Store mock).

## Files to create
- `src/hooks/use-call-desk.ts`
- `src/hooks/use-catalyst-events.ts`
- `src/hooks/use-event-probabilities.ts`
- `src/hooks/use-store-analytics.ts`
- 3 SQL migrations (9B.1–9B.3) + 3 seed migrations (9C.1–9C.3)

## Files to modify
- `src/pages/atlas/ConnectorControlCenter.tsx` — remove dead `now/h/lifecycleStates` stubs (lifecycle is fine, but `now/h` are unused)
- `src/pages/atlas/OperationsCommandCenter.tsx` — wire runbooks/queues to hook
- `src/hooks/use-operations-command-center.ts` — add `runbooks` + `queues` query
- `src/hooks/use-revenue-automation-health.ts` — wire `fatigueAlerts` to new table
- `src/pages/revenue-office/CallDesk.tsx` — replace 4 local `[]` stubs with `useCallDesk`
- `src/pages/integrations/IntegrationsCatalog.tsx` — import canonical providers
- `src/pages/store/StoreAnalyticsPage.tsx` — wire to `useStoreAnalytics`
- `src/pages/investment-office/CatalystWarRoom.tsx` — wire to `useCatalystEvents`
- `src/pages/investment-office/EventProbabilityLab.tsx` — wire to `useEventProbabilities`
- `STABILIZATION_AUDIT.md` — Phase 9 closure entry

## Out of scope (intentional Empty-State Honesty)
- Quote Studio's `upsellSuggestions` and `pricingInsights` — these need 5+ accepted quotes before any inference is meaningful; the current `connect-to-activate` empty state is the correct UX.
- `crm_automations`, `quotes`, user-scoped `incidents`/`alerts` — must stay empty for new users. The empty state is the feature.

After approval I'll execute Phase 9A → 9B → 9C → 9D in order, with each migration approved individually and the audit doc updated at the end.