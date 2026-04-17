

## Re-Audit: Phase 20 Disk Truth — 4 Residual Gaps

`production-operations-report.json` says `ok:true`, but the gate only verifies *file presence*. Truth-check against runtime behavior reveals:

| # | Gap | Evidence |
|---|---|---|
| **G1** | `health-cron` **never runs** | `SELECT * FROM cron.job` returns **0 rows**. Function exists but no schedule → uptime "real always-on monitor" claim is false. `uptime_heartbeats` will only ever fill from client beacons (visible tabs). |
| **G2** | **Zero alert producers wired** | `grep raiseAlert` in `slo-tracking.ts`, `anomaly-detection.ts`, `payment-kill-switch`, `connector-health`, `ai-health` returns **0 hits**. Alert ingest endpoint is alive but no system feeds it. The triage board will only ever show alerts manually inserted. |
| **G3** | **No Traces or Uptime tabs** in `ObservabilityPage` | Page has `Tabs` but zero references to `trace_spans`, `uptime_status`, `uptime_heartbeats`. Ingested data is invisible to operators. |
| **G4** | **Sourcemap upload not wired** | `vite.config.ts` has `sourcemap: false` and **no** `@sentry/vite-plugin`. Master prompt explicitly requires "sourcemap upload in CI". Sentry stack traces will be unreadable in production. |

---

## Phase 20.1 — Production Operations Closure (~10 files, ~450 LOC)

### 20.1.A — Schedule `health-cron` for real (G1)
**Insert** (data, not migration — uses anon key):
```sql
SELECT cron.schedule(
  'sita-health-cron-1m',
  '* * * * *',
  $$ SELECT net.http_post(
       url:='https://fctupowhcljejygjfpty.supabase.co/functions/v1/health-cron',
       headers:='{"Content-Type":"application/json","Authorization":"Bearer <anon>"}'::jsonb,
       body:='{}'::jsonb
     ); $$
);
```
And `'sita-uptime-rollup-5m'` calling a small `uptime-rollup` fn (or inline `REFRESH MATERIALIZED VIEW` if `uptime_status` is matview). Add a **Manage Cron** admin row to `ObservabilityPage` showing `cron.job` rows so operators can see it's alive.

### 20.1.B — Wire real alert producers (G2)
Edit 5 sources to call `raiseAlert()` (frontend client) or POST `alert-ingest` (edge):
- **`src/lib/observability/slo-tracking.ts`** — when `errorBudgetBurnRate > threshold` → `raiseAlert({source:"slo-burn", severity:"high", subsystem, title, dedupKey})`
- **`src/lib/observability/anomaly-detection.ts`** — on anomaly detection → `raiseAlert("anomaly", severityFromScore, …)`
- **`supabase/functions/payment-kill-switch/index.ts`** — on activation, POST self→`alert-ingest` `{source:"kill-switch", severity:"critical", subsystem:"payments"}`
- **`supabase/functions/connector-health/index.ts`** — on status `down|degraded` → `alert-ingest` `{source:"connector", severity:"high"}`
- **`supabase/functions/ai-health/index.ts`** — on provider failure burst → `alert-ingest` `{source:"ai-provider", severity:"medium"}`
- **`supabase/functions/error-ingest/index.ts`** — when same fingerprint count >= 10 in 5min, internally fire `alert-ingest` `{source:"error-spike", severity:"high"}`

Add `_shared/alert-emitter.ts` so edge fns share one client.

### 20.1.C — Add Traces + Uptime tabs to `ObservabilityPage` (G3)
Edit `src/pages/ObservabilityPage.tsx`:
- New `<TabsTrigger value="traces">Traces</TabsTrigger>` + `<TabsTrigger value="uptime">Uptime</TabsTrigger>`
- New `src/components/observability/TracesPanel.tsx` — query `trace_spans` last 1h, p50/p95/p99 by `service+operation`, top-20 slowest, click-through to span tree
- New `src/components/observability/UptimePanel.tsx` — query `uptime_status` view; show 24h/7d/30d % per subsystem, heatmap of last 60 minutes
- New `src/components/observability/AlertsLivePanel.tsx` (compact) embedded in overview, link to `/admin/alerts`

### 20.1.D — Sentry sourcemap upload (G4)
- Add `@sentry/vite-plugin` to `package.json`
- Edit `vite.config.ts`:
  ```ts
  build: { sourcemap: process.env.SENTRY_AUTH_TOKEN ? 'hidden' : false }
  plugins: [
    react(),
    process.env.SENTRY_AUTH_TOKEN && sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: { name: process.env.VITE_APP_RELEASE },
      sourcemaps: { assets: './dist/**' },
      disable: !process.env.SENTRY_AUTH_TOKEN,
    }),
  ].filter(Boolean)
  ```
- Document the 3 build secrets in `.env.production.example` (already partially done).

### 20.1.E — Strengthen CI Gate 31
Edit `scripts/architecture/checks/check-production-operations.ts`:
- Assert `cron.job` contains `sita-health-cron-1m` (read via supabase admin)
- Assert ≥4 of 5 producer files contain `raiseAlert` or `alert-ingest`
- Assert `ObservabilityPage` references `trace_spans` AND `uptime_heartbeats`/`uptime_status`
- Assert `vite.config.ts` references `sentryVitePlugin`
- Re-emit `generated/production-operations-report.json` with these new evidence keys

### 20.1.F — Tiny `uptime-rollup` edge fn (optional helper for B)
Light fn called by 5-min cron that writes daily aggregates if we keep `uptime_status` as a regular view (no matview refresh needed; skip if view is fine).

---

### Files

| Layer | Change |
|---|---|
| DB cron (insert SQL) | Schedule `health-cron` every 1m + optional rollup 5m |
| `src/lib/observability/slo-tracking.ts` | +raiseAlert on burn |
| `src/lib/observability/anomaly-detection.ts` | +raiseAlert on detection |
| `supabase/functions/_shared/alert-emitter.ts` | NEW shared edge alert client |
| `supabase/functions/payment-kill-switch/index.ts` | +alert on activation |
| `supabase/functions/connector-health/index.ts` | +alert on degraded/down |
| `supabase/functions/ai-health/index.ts` | +alert on provider failure |
| `supabase/functions/error-ingest/index.ts` | +alert on spike fingerprint |
| `src/pages/ObservabilityPage.tsx` | +Traces, Uptime, Cron tabs |
| `src/components/observability/TracesPanel.tsx` | NEW |
| `src/components/observability/UptimePanel.tsx` | NEW |
| `src/components/observability/AlertsLivePanel.tsx` | NEW |
| `vite.config.ts` | Sentry plugin gated on `SENTRY_AUTH_TOKEN` |
| `package.json` | +`@sentry/vite-plugin` |
| `scripts/architecture/checks/check-production-operations.ts` | Stronger assertions |
| `generated/production-operations-report.json` | Refresh with cron + producers + UI evidence |

### Acceptance

- `SELECT * FROM cron.job WHERE jobname='sita-health-cron-1m'` returns 1 active row; `uptime_heartbeats` accrues `source='cron'` rows every minute
- Triggering an SLO burn / kill-switch / connector down / AI provider failure / error spike → row appears in `public.alerts` within 30s, surfaces in `AlertTriageBoard`, ack/resolve buttons work end-to-end
- `/admin/observability` shows live Traces panel (p50/p95/p99 from `trace_spans`) and Uptime panel (24h/7d/30d % from `uptime_status`)
- Production build with `SENTRY_AUTH_TOKEN` set uploads sourcemaps; without it, build still succeeds (gated)
- CI Gate 31 (strengthened) green; report shows `cron_scheduled:true`, `alert_producers:5`, `observability_ui_wired:true`, `sourcemap_upload_wired:true`
- Master prompt sections A1, A2, A3, A4 truthfully **100% wired and deployable**

