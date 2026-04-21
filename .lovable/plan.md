

# Production Operations Readiness — Full Implementation Plan

## Summary

Close the four remaining production-operations gaps: (1) wire real Sentry/APM integration end-to-end, (2) build automated incident escalation with PagerDuty-style policies, (3) create a live SLA monitoring dashboard backed by real DB data, and (4) produce verifiable chaos/game-day drill evidence.

---

## What Already Exists

- **Sentry SDK** initialized in `src/lib/observability/sentry.ts` (DSN-gated, no-op without `VITE_SENTRY_DSN`)
- **Error ingest** edge function writing to `error_events` table with spike detection
- **Alert pipeline**: `alert-ingest` -> `alert-route` (ui/webhook/push/email/sms fan-out)
- **Incident management service** (`src/lib/services/incident-management/`) with full lifecycle but in-memory only
- **SLA dashboard** in Enterprise Control Plane with hardcoded demo data
- **Chaos Testing page** (`SRE05ChaosTestingFramework`) with simulated experiments, no DB persistence
- **DB tables**: `alerts`, `incidents`, `error_events`, `chaos_drill_results`, `uptime_status`, `observability_metrics`, `council_escalations`, `uptime_heartbeats`
- **Chaos types** defined in `src/packages/simulation-contracts/chaos-types.ts` including `GameDay` interface

---

## Part 1: Production APM / Error Monitoring Integration

### 1A. Sentry DSN secret setup
- Use `add_secret` tool to prompt for `VITE_SENTRY_DSN`
- Sentry init already handles DSN-gated activation; no code change needed there

### 1B. APM metrics edge function
- Create `supabase/functions/apm-metrics-ingest/index.ts` — receives batched frontend performance spans (from existing `startSpanExporter()`) and writes to `observability_metrics` table with metric keys like `web.lcp`, `web.fid`, `web.cls`, `web.ttfb`, `api.latency.p95`
- Modify `src/lib/observability/apm.ts` to POST spans to this edge function (currently the span exporter exists but has no backend target)

### 1C. Error monitoring bridge
- Update `src/lib/services/error-monitoring-service.ts` to forward fatal/error events to both `error-ingest` edge function AND Sentry (when active), ensuring dual-write for redundancy
- Add correlation: attach Sentry event ID to `error_events` rows via existing `sentry_event_id` column

---

## Part 2: Automated Incident Escalation

### 2A. Escalation policies table
- Migration: create `escalation_policies` table:
  - `id`, `name`, `severity_match` (text[]), `auto_escalate_after_minutes` (int), `escalation_targets` (jsonb — array of {channel, target, delay_minutes}), `enabled` (bool), `created_at`, `updated_at`
- Seed 3 default policies: Critical (immediate page + webhook), High (10min auto-escalate), Medium (30min auto-escalate)

### 2B. Escalation engine edge function
- Create `supabase/functions/escalation-engine/index.ts`
  - Called by `health-cron` on each tick (or standalone pg_cron every 2 minutes)
  - Scans `alerts` where status = 'active' AND age > policy threshold AND no escalation sent
  - For matching alerts: creates row in `incidents` table (auto-declare), invokes `alert-route` with escalated severity, writes to `council_escalations`
  - Supports multi-tier escalation: L1 (webhook/push) -> L2 (email to owner) -> L3 (all-hands page)

### 2C. Incident auto-declaration
- When escalation triggers, auto-create `incidents` row with linked `alert_id`, severity, affected services from alert metadata, and attach matching runbook IDs from kill-switch registry

### 2D. Wire to existing incident management service
- Update `IncidentDashboardPage.tsx` to read from both `incident_classifications` AND `incidents` table
- Add escalation timeline: show escalation events from `council_escalations` in the incident timeline view

---

## Part 3: Live SLA Monitoring Dashboard

### 3A. SLA definitions table
- Migration: create `sla_definitions` table:
  - `id`, `name`, `metric_key` (text), `target_value` (numeric), `unit` (text), `window` (text — '24h'/'7d'/'30d'), `breach_severity` (text), `enabled` (bool)
- Seed with 6 SLA definitions: Uptime (99.9%), API p95 latency (<200ms), Error rate (<0.1%), Incident MTTR (<4hrs), Data recovery RTO (<1hr), Alert response time (<5min)

### 3B. SLA evaluator edge function
- Create `supabase/functions/sla-evaluator/index.ts`
  - Runs on pg_cron every 5 minutes
  - For each SLA definition: queries source tables (`uptime_status`, `observability_metrics`, `incidents`, `alerts`) to compute current value
  - Writes results to new `sla_snapshots` table: `id`, `sla_id`, `current_value`, `target_value`, `met` (bool), `window_start`, `window_end`, `computed_at`
  - On breach: calls `alert-ingest` with severity from SLA definition

### 3C. Live SLA dashboard page
- Create `src/pages/admin/SLAMonitoringDashboard.tsx`
  - Real-time: subscribes to `sla_snapshots` via Supabase realtime
  - Shows each SLA as a card with: current value, target, trend sparkline (last 24 data points), breach/met badge
  - Summary KPIs: SLAs met ratio, current uptime, MTTR, error rate
  - Breach history table: past SLA violations with timestamps, duration, linked incidents
  - Time range selector: 24h / 7d / 30d
- Replace hardcoded `DEMO_SLA_METRICS` in Enterprise Control Plane with data from `sla_snapshots`
- Add route at `/admin/sla-monitoring`

---

## Part 4: Chaos / Game-Day Drill Evidence

### 4A. Executable chaos drill runner
- Create `supabase/functions/chaos-drill-runner/index.ts`
  - Accepts drill definition (scenario ID, blast radius, safety checks)
  - Executes drill steps: inject fault (simulated) -> verify detection (check if alert raised within N seconds) -> verify recovery (check service health restored) -> record evidence
  - Writes results to existing `chaos_drill_results` table with: detection_seconds, recovery_seconds, outcome, evidence JSON (timestamps, alert IDs, screenshots)
  - Safety interlock: checks kill-switch `KS-CHAOS` before executing; refuses if not enabled

### 4B. Game-day orchestrator
- Create `src/lib/services/game-day-orchestrator.ts`
  - Defines game-day scenarios using existing `GameDay` interface from chaos-types
  - 6 canonical scenarios: (1) Database latency spike, (2) Auth service degradation, (3) Event bus failure, (4) Edge function timeout cascade, (5) Storage write failure, (6) Full network partition
  - Each scenario links to: kill-switch to test, runbook to validate, expected detection time, expected recovery time

### 4C. Game-day evidence dashboard
- Extend `SRE05ChaosTestingFramework.tsx` with a "Game Day Evidence" tab
  - Reads from `chaos_drill_results` and `dr_drill_executions` tables
  - Shows drill history with pass/fail, detection time vs target, recovery time vs target
  - Evidence packet: downloadable JSON with all drill results, timestamps, linked alert IDs
  - "Run Drill" button that invokes `chaos-drill-runner` edge function

### 4D. Evidence generation script
- Create `scripts/validation/generate-chaos-drill-evidence.ts`
  - Queries `chaos_drill_results` from DB
  - Produces `generated/chaos-drill-evidence-report.json` with: total drills run, pass rate, mean detection time, mean recovery time, last drill date, scenario coverage map
  - Fails gate if fewer than 6 scenarios have been drilled or if any critical scenario has 0 passes

---

## Database Migrations (in order)

1. `escalation_policies` table + seed data
2. `sla_definitions` table + seed data  
3. `sla_snapshots` table with realtime enabled
4. Add `escalation_count` and `last_escalated_at` columns to `alerts` table
5. RLS policies: admin read/write on all new tables, authenticated read on `sla_snapshots`

## New Edge Functions

1. `apm-metrics-ingest` — frontend span receiver
2. `escalation-engine` — automated alert escalation
3. `sla-evaluator` — SLA computation on cron
4. `chaos-drill-runner` — executable drill with evidence

## New/Modified Pages

1. `SLAMonitoringDashboard.tsx` — new admin page at `/admin/sla-monitoring`
2. `IncidentDashboardPage.tsx` — add escalation timeline, real incidents table
3. `SRE05ChaosTestingFramework.tsx` — add Game Day Evidence tab
4. `EnterpriseControlPlane.tsx` — replace demo SLA data with live queries

## Route Registration

- `/admin/sla-monitoring` — SLA Monitoring Dashboard (maintenance.view)
- Update admin nav to include SLA Monitoring link

