

## Re-Audit — Checklist 26: Observability / Incident Reality (7/10 truthful, 3 gaps)

Live disk shows substantial observability infrastructure: 18 obs lib modules, 15+ obs/health edge functions, incident management service with full lifecycle, mobile diagnostics buffer, and a wired `SystemHealthDashboard` that pulls **real probes**. But three items are claimed without truthful wiring.

### Status by item

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Structured logs | ✅ | `structured-logger.ts` + buffer surfaced in `SystemHealthDashboard.tsx:51` |
| 2 | Metrics | ✅ | `telemetry-collector.ts` + `cost-governance.ts` + 6 obs edge fns |
| 3 | Tracing where needed | ✅ | `distributed-tracing.ts` + `apm.ts` + `request-context.ts` (fetch interceptor wraps all calls; span exporter started in `main.tsx:55`) |
| 4 | Error capture | ✅ | `sentry.ts` + `error-monitoring-service.ts` + `error-ingest` edge fn (initialized in `main.tsx:51-52`) |
| 5 | Incident classification | ✅ | `incident-classification.service.ts` + full `IncidentManagementService` lifecycle with severity routing |
| 6 | Function/service health | ✅ | `health-probes.ts` + `health-check`/`health-cron`/`health-beat`/`ai-health`/`connector-health` edge fns + `serviceHeartbeat` |
| 7 | Mobile diagnostics | ✅ | `src/lib/mobile-platform/analytics/mobile-diagnostics.ts` (buffered, redacted) |
| 8 | Runtime probes | ✅ | `runAllProbes()` (supabase/auth/storage) wired live in `SystemHealthDashboard` |
| 9 | **Support bundle generation** | ⚠️ | `generateDiagnosticBundle()` exists but returns **hardcoded values** (`systemHealth: 94`, empty arrays); not connected to real telemetry/incident/probe state |
| 10 | **Health dashboards reflect real telemetry** | ⚠️ | `SystemHealthDashboard` IS live, but `CloudObservabilityAdmin` returns `getDemoMetrics()` (hardcoded); `FIPObservabilityCenter` reads spec compliance not live signals |
| — | **Observability truth report** | ❌ | No `generated/observability-truth-report.json`, no `check-observability-reality.ts` script, no manifest entry asserting all 10 items |

---

## Phase 31 — Observability/Incident Truth Closure (3 fixes)

### 31.A — Wire diagnostic bundle to real telemetry (fixes #9)

Replace the hardcoded `generateDiagnosticBundle()` in `src/lib/services/support-diagnostics/diagnostic-bundle.service.ts` with a function that aggregates from live sources:

- `runAllProbes()` → systemHealth score (from `getOverallHealth`)
- `incidentManagementService.getActiveIncidents()` → incidents
- `serviceHeartbeat.runHeartbeat(...)` → degradedServices
- `getCostSummary()` → costAnomalies (entries over budget)
- `getLogBuffer()` (last N error/warn) → diagnostic excerpt
- `peekMobileDiagnostics()` → mobile signal sample
- `tracer.getCompletedSpans(50)` → recent trace excerpt

Make it async; preserve `supportSafe: true` redaction. Add `generateSupportBundle()` named export that returns the full payload + a `bundleId` and `generatedAt` ISO string.

### 31.B — Wire CloudObservabilityAdmin to real metrics (fixes #10)

Replace `getDemoMetrics()` with a `useObservability` hook call that pulls from:
- `telemetry-collector.getWindowStats()` for upload/latency/WS metrics
- `runAllProbes()` for storage/db latency
- `getOverallHealth()` for the badge
- Show `PageTruthBanner` indicator when telemetry buffer is empty (cold-start) instead of fake values

### 31.C — Add observability truth gate + report (fixes registry truth)

- New script: `scripts/architecture/checks/check-observability-reality.ts`
  - Asserts every claim in Checklist 26 maps to a live module/edge fn/wiring point
  - Verifies `main.tsx` boot order: sentry → error-monitoring → fetch interceptor → perf → APM → uptime
  - Confirms 6 obs edge functions deployed (`error-ingest`, `trace-ingest`, `alert-ingest`, `alert-route`, `alert-actions`, `health-cron`)
  - Confirms diagnostic bundle reads from real sources (no hardcoded `systemHealth: 94`)
  - Emits `generated/observability-truth-report.json` with 10/10 truthful breakdown
- Register manifest entry 119 in `src/lib/truth-manifests/manifest-registry.ts` (`manifest-observability-truth`)
- Bind script in `scripts/validate-all.ts` under `"observability"` domain

### Files

| Layer | Change |
|---|---|
| `src/lib/services/support-diagnostics/diagnostic-bundle.service.ts` | Rewrite to aggregate real telemetry |
| `src/lib/services/support-diagnostics/index.ts` | Export `generateSupportBundle` |
| `src/pages/admin/cloud/CloudObservabilityAdmin.tsx` | Replace `getDemoMetrics` with live `useObservability` |
| `scripts/architecture/checks/check-observability-reality.ts` | NEW — gate script |
| `scripts/validate-all.ts` | Bind under observability domain |
| `src/lib/truth-manifests/manifest-registry.ts` | Add entry 119 |
| `generated/observability-truth-report.json` | NEW — emitted report |

### Acceptance

- `generateSupportBundle()` returns live data sourced from probes/incidents/heartbeat/logs/traces (no hardcoded `94`)
- `CloudObservabilityAdmin` displays real telemetry windows; falls back to "no data yet" banner instead of fake numbers
- `npx tsx scripts/architecture/checks/check-observability-reality.ts` exits 0
- `generated/observability-truth-report.json` shows `checklist26: { items: 10, truthful: 10, ok: true }`
- `MANIFEST_REGISTRY` grows from 118 → 119 entries; Gate 37 (CI Umbrella Integrity) stays green
- Checklist 26 truthfully **10/10 — fully deployable**

