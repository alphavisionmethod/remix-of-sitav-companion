

## Re-Audit: Production Operations + Operational Safety — Real Gaps Found

Disk truth shows partial scaffolding (structured-logger, distributed-tracing module, error-monitoring-service that batches into `support-gateway`, an `incidents` table, a demo-data-fed `AlertTriageBoard`), but **no end-to-end real production operations stack**. Specifically:

| # | Item | Status | Evidence |
|---|---|---|---|
| A1 | Error monitoring (Sentry) | ❌ | `grep VITE_SENTRY_DSN` returns 0. `error-monitoring-service.ts` posts to `support-gateway`, but `support-gateway` has **no `report-errors` action** — the batch is dropped on the floor. No `error_events` table |
| A2 | APM / tracing / latency | ⚠️ partial | `distributed-tracing.ts` + `tracedFetch` exist in memory; **never persisted, never aggregated, no admin surface, no correlation-id propagation into edge fns** |
| A3 | Uptime monitoring | ⚠️ partial | `health-check` edge fn returns `{status:"healthy"}` always (no real probes). `public/health.json` is static. No `/ready`, no `/live`, no per-subsystem health endpoint, no uptime history |
| A4 | Alert routing | ❌ | `AlertTriageBoard` reads `DEMO_ALERTS` from `demo-data/admin-platform`. No `alerts` table, no ingest fn, no severity routing, no ack/resolve, no source classification |

---

## Phase 20 — Production Operations Reality Closure

Build the four pillars as **real wired infrastructure**, end-to-end, no stubs.

### 20.A — Error Monitoring (real, dual-channel: Sentry + native sink)

**Why dual:** Sentry is best-in-class but optional (DSN-gated). The native sink (`error_events` table + edge ingest) always works and powers the admin Truth Explorer with no third-party dependency.

**Files**
- **NEW** `src/lib/observability/sentry.ts` — `initSentry()` reads `VITE_SENTRY_DSN`/`VITE_SENTRY_ENVIRONMENT`/`VITE_APP_RELEASE`, calls `Sentry.init` with `BrowserTracing` + `Replay` integrations, sets release + environment + user tags. No-op if DSN missing.
- **NEW** `src/lib/observability/release.ts` — exports `APP_RELEASE` (from `import.meta.env.VITE_APP_RELEASE` with build-time fallback to git SHA via Vite define).
- **NEW** `src/lib/observability/runtime-error-context.ts` — enriches every error with `route`, `userId`, `tenantId`, `correlationId`, `surface`, `featureFlags`.
- **EDIT** `src/lib/services/error-monitoring-service.ts` — also calls `Sentry.captureException` when initialized; keeps native sink as fallback.
- **EDIT** `src/components/sita/GlobalErrorBoundary.tsx` + `RouteErrorBoundary.tsx` + `ErrorBoundary.tsx` — wrap with `Sentry.ErrorBoundary` when Sentry present; always call `reportFatalError`.
- **EDIT** `src/main.tsx` — `initSentry()` → `initErrorMonitoring()` → `initPerformanceMonitor()`.
- **NEW** `supabase/functions/error-ingest/index.ts` — accepts batched error reports (Zod-validated), writes to `public.error_events`, deduplicates by fingerprint+5min window, increments `count` on dup.
- **EDIT** `src/lib/services/error-monitoring-service.ts` — point batch to `error-ingest` instead of `support-gateway`.
- **DB migration** — `error_events` table (id, fingerprint, message, stack, severity, source, route, user_id, tenant_id, correlation_id, release, environment, user_agent, count, first_seen_at, last_seen_at, resolved_at) + RLS (admin-read, service-role-write) + indexes on fingerprint+last_seen_at.
- **NEW** `src/pages/admin/ErrorEventsExplorer.tsx` — admin surface listing real `error_events` with filters (severity/route/release), groups by fingerprint, deep-link to Sentry issue when DSN present.
- **CI/Edge:** edge functions catch + log to `function_errors` (existing tables) AND the new `error_events` via `_shared/error-sink.ts`.

**Env vars added to `.env.production.example`:** `VITE_SENTRY_DSN`, `VITE_SENTRY_ENVIRONMENT`, `VITE_APP_RELEASE`. Build-only: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` (sourcemap upload via `@sentry/vite-plugin` in `vite.config.ts` when set).

### 20.B — APM / Tracing / Latency (real, persisted)

**Files**
- **NEW** `src/lib/observability/request-context.ts` — `withCorrelationId()` generator, `getCurrentCorrelationId()`, attaches `x-correlation-id` and W3C `traceparent` to every `supabase.functions.invoke` and `fetch` call (monkey-patches via interceptor module).
- **NEW** `src/lib/observability/apm.ts` — buffered span exporter that batches completed spans from `tracer.getCompletedSpans()` to the `trace-ingest` edge fn every 15s (or on `visibilitychange`).
- **NEW** `src/lib/observability/perf-budget.ts` — declares `PERF_BUDGETS` (page-load < 3s, route-transition < 800ms, fetch p95 < 1.5s); `recordBudgetBreach()` writes to `slo_burn_events`.
- **NEW** `supabase/functions/_shared/tracing.ts` — `withTrace(req, fn, async (logger, span) => {...})` wrapper; reads inbound `traceparent`/`x-correlation-id`, emits `trace_spans` row on completion with latency, status, function name, parent span id, error msg.
- **EDIT** the 6 highest-traffic edge fns (`agent-executor`, `admin-bff-gateway`, `user-bff-gateway`, `ai-gateway`, `payment-process`, `connector-proxy`) to wrap their handler in `withTrace`.
- **DB migration** — `trace_spans` table (trace_id, span_id, parent_span_id, service, operation, start_ts, end_ts, duration_ms, status, http_status, user_id, correlation_id, tags jsonb, error text) + RLS (admin-read) + indexes (trace_id, start_ts, service+operation).
- **NEW** `supabase/functions/trace-ingest/index.ts` — accepts span batches (Zod), writes `trace_spans`, drops oversized batches.
- **EDIT** `src/pages/ObservabilityPage.tsx` — add "Traces" tab: search by trace-id, latency p50/p95/p99 per service, slowest spans last 1h, drill into span tree.
- **EDIT** `src/lib/services/support-diagnostics/*` — diagnostic bundle now embeds the user's last 50 spans + correlation IDs.

### 20.C — Uptime / Health Endpoints (real probes)

**Files**
- **REWRITE** `supabase/functions/health-check/index.ts` — actually run lightweight DB ping (`select 1`) + auth ping + storage HEAD; return per-subsystem `{db, auth, storage, ai_gateway, push}` with `status` + `latency_ms`. Cached 10s.
- **NEW** `supabase/functions/health-ready/index.ts` — readiness probe: validates required secrets, RPC reachability, returns 200 only if every probe is healthy.
- **NEW** `supabase/functions/health-live/index.ts` — liveness probe: just returns 200; for external monitor heartbeat.
- **NEW** `src/lib/observability/uptime.ts` — `recordHeartbeat()` ping every 60s from running clients to `health-beat` fn (writes `uptime_heartbeats`); admin computes synthetic uptime % per-window.
- **NEW** `supabase/functions/health-beat/index.ts` — receives heartbeats, writes `uptime_heartbeats` table.
- **DB migration** — `uptime_heartbeats` table (timestamp, source: 'client'|'monitor'|'cron', subsystem, status, latency_ms, region) + `uptime_status` view computing rolling 24h/7d/30d uptime.
- **NEW** `supabase/functions/health-cron/index.ts` (scheduled via `pg_cron` every 1m) — runs all 10 internal probes, writes results into `uptime_heartbeats` with `source='cron'`. This is the real always-on uptime monitor.
- **EDIT** `src/pages/ObservabilityPage.tsx` — "Uptime" tab shows real 24h/7d/30d % per subsystem from `uptime_status` view.
- **EDIT** `public/health.json` becomes generated at build time by `scripts/deployment/checks/generate-health.sh` (already exists) + a runtime `/health.json` endpoint via the rewritten `health-check` fn for external monitors.

### 20.D — Alert Routing / Incident Signaling (real, ingestable)

**Files**
- **DB migration** — `alerts` table (id, fingerprint, source, severity: critical|high|medium|low|info, subsystem, title, description, status: active|acknowledged|suppressed|resolved, runbook_id, assignee_user_id, dedup_key, count, first_seen_at, last_seen_at, ack_at, ack_by, resolved_at, resolved_by, metadata jsonb, related_incident_id) + RLS (admin RW, support read) + indexes.
- **DB migration** — `alert_routes` table (id, source_pattern, severity_min, channel: ui|email|push|webhook, target, enabled).
- **NEW** `supabase/functions/alert-ingest/index.ts` — single ingest endpoint for: error-events crossing threshold, SLO burn, uptime probe failures, kill-switch activations, connector failures, AI provider failures, payment failures, sync lag, workflow stalls. Dedupes by fingerprint, increments count, escalates severity if rate > N/min.
- **NEW** `supabase/functions/alert-route/index.ts` — reads `alert_routes`, fans out new alerts: writes `notifications_queue` rows, dispatches push via `push-dispatch`, calls webhooks (Slack-compatible JSON).
- **NEW** `src/lib/services/alerting/alert-client.ts` — typed client: `raiseAlert({source, severity, subsystem, title, …})`; called by error-monitoring, slo-tracking, anomaly-detection, kill-switch handlers, connector health, uptime-cron.
- **EDIT** `src/lib/observability/slo-tracking.ts` — when error budget burn rate > threshold, `raiseAlert("slo-burn", "high", …)`.
- **EDIT** `src/lib/services/anomaly-alert/index.ts` — replaces `notifications` insert with `raiseAlert()`.
- **EDIT** `supabase/functions/payment-kill-switch/index.ts` + `connector-health/index.ts` + `ai-health/index.ts` — emit alerts on activation/failure.
- **REWRITE** `src/pages/admin/AlertTriageBoard.tsx` — replace `DEMO_ALERTS` with live query of `public.alerts`; wire **real** Acknowledge / Suppress / Assign / Resolve / Open Runbook buttons via `alert-ack`/`alert-resolve`/`alert-assign` actions on a new `supabase/functions/alert-actions/index.ts`.
- **EDIT** `src/lib/services/incident-management/index.ts` — `declareIncidentFromAlert(alertId)` links alert→incident bidirectionally; persists to `public.incidents` (real table already exists) instead of in-memory Map.

### 20.E — Wiring + CI

- **EDIT** `src/main.tsx` order: `initSentry()` → `initErrorMonitoring()` → `initPerformanceMonitor()` → `startUptimeHeartbeat()` → `startSpanExporter()` → render.
- **EDIT** `src/routes/os-routes.tsx` — register `/admin/observability/errors` (ErrorEventsExplorer), `/admin/observability/traces` (already in ObservabilityPage tabs), `/admin/alerts` (AlertTriageBoard already exists; ensure routed).
- **NEW** `scripts/architecture/checks/check-production-operations.ts` — CI Gate 31 verifies:
  - Sentry init present and called from `main.tsx`
  - `error-ingest`/`trace-ingest`/`alert-ingest`/`alert-route`/`health-cron`/`health-beat` edge fns present
  - All 4 tables present (`error_events`, `trace_spans`, `uptime_heartbeats`, `alerts`) with RLS
  - `AlertTriageBoard` no longer imports `DEMO_ALERTS`
  - 6 high-traffic edge fns wrapped with `withTrace`
- **EDIT** `src/lib/ci/ci-gate-registry.ts` + `generated/ci-umbrella-manifest.json` → `gateCount: 31`.
- **NEW** `generated/production-operations-report.json` — emitted by gate, lists wired evidence for A1-A4.
- **EDIT** `src/lib/db/non-edge-table-io-sources.ts` — register the 4 new tables.

### Files Summary

| Layer | New | Edit |
|---|---|---|
| Frontend lib | sentry.ts, release.ts, runtime-error-context.ts, request-context.ts, apm.ts, perf-budget.ts, uptime.ts, alerting/alert-client.ts | error-monitoring-service.ts, GlobalErrorBoundary, RouteErrorBoundary, ErrorBoundary, slo-tracking, anomaly-alert, incident-management, main.tsx |
| Edge functions | error-ingest, trace-ingest, alert-ingest, alert-route, alert-actions, health-ready, health-live, health-beat, health-cron, _shared/tracing.ts, _shared/error-sink.ts | health-check (rewrite), agent-executor, admin-bff-gateway, user-bff-gateway, ai-gateway, payment-process, connector-proxy, payment-kill-switch, connector-health, ai-health |
| Admin UI | ErrorEventsExplorer.tsx | ObservabilityPage.tsx, AlertTriageBoard.tsx (de-demoize), os-routes.tsx |
| DB | 4 tables + 1 view + cron + RLS | non-edge-table-io-sources.ts |
| CI | check-production-operations.ts (Gate 31), production-operations-report.json | ci-gate-registry.ts, ci-umbrella-manifest.json |
| Config | .env.production.example (Sentry vars), vite.config.ts (Sentry vite plugin gated on env) | — |

### Acceptance

- Throwing an error in any page → captured by GlobalErrorBoundary → `reportFatalError()` → Sentry (if DSN) + `error_events` row → visible in `/admin/observability/errors` within 15s.
- Calling any of 6 instrumented edge fns → `trace_spans` row with `trace_id`, `correlation_id`, latency → searchable in ObservabilityPage Traces tab.
- `health-cron` runs every minute → `uptime_heartbeats` rows accumulate → `/admin/observability` Uptime tab shows real 24h/7d/30d %.
- Killing a connector → `connector-health` raises alert via `alert-ingest` → `alerts` row → `alert-route` fans out → row appears in `AlertTriageBoard` and is acknowledgeable end-to-end.
- CI Gate 31 green; CI Umbrella `gateCount: 31`; `production-operations-report.json` `ok:true, errors:0`.
- `AlertTriageBoard` no longer reads from `DEMO_ALERTS` (CI-enforced).
- All 4 new tables RLS-covered, registered in `non-edge-table-io-sources.ts`, no cross-domain write violations (Gate 29 still green).

