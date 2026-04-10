

# CI / E2E / Behavioral Truth / Launch Gate — Gap Fix Plan

## What Already Exists (Fully Built)

| Layer | Status | Details |
|---|---|---|
| **CI Pipeline** | Complete | `.github/workflows/ci.yml` — 492 lines, 12 jobs: typecheck, lint, unit-tests, integration-tests, security-scan, build, architecture-validation, e2e-p0, docker-build, ring-promotion, launch-gate, bundle-size, pr-summary |
| **E2E Tests** | Complete | 20+ Playwright spec files covering auth, files, advisors, approvals, boardroom, business, connectors, demo-mode, money, navigation, route-health, settings, interactions, responsive, push notifications |
| **Runtime Probes** | Complete | `runtime-probes` edge function (312 lines) — 13 probes: db-health, auth-health, storage-health, edge-health, ai-gateway, scheduler-health, rls-health, notification-health, push-tokens, ai-budget, audit-health, realtime-health, self-healing |
| **Database Tables** | Complete | `ci_runs`, `ci_jobs`, `e2e_journeys`, `e2e_runs`, `e2e_steps`, `runtime_probes`, `runtime_probe_runs`, `launch_gates`, `launch_gate_criteria`, `launch_blockers`, `route_truth_records`, `behavioral_regressions` — all with RLS |
| **7 LT Admin Pages** | Complete | LT01–LT07 at `/admin/truth/*`, all querying real Supabase tables |
| **Journey Reporter** | Complete | Custom Playwright reporter (175 lines) outputting structured JSON |
| **DB Ingestion** | Complete | `scripts/ingest-journey-results.ts` (163 lines) ingesting into DB |
| **CILaunchGateWidget** | Complete | Reusable component used in LT05 and DRS10 |
| **Nightly Workflows** | Complete | `customer-journey-nightly.yml` and `playwright-proof-nightly.yml` |
| **pg_cron Probe** | Complete | `runtime-probes` called every 15 min via pg_cron |
| **Routes** | Complete | All 7 LT pages routed in App.tsx |

## Gaps Found (2 Issues)

### Gap 1: No LTSubNav
LT01–LT07 pages lack a sub-navigation bar. SAG, AIG, and AR pages all have sub-navs (`SAGSubNav`, `AIGSubNav`, `ARSubNav`). LT pages have none — users can't navigate between them without knowing URLs.

**Fix**: Create `src/components/admin/LTSubNav.tsx` (same pattern as ARSubNav) and inject it into all 7 LT pages.

### Gap 2: No Command Palette Entries for LT Pages
The command palette has entries for AR (9 entries), SAG (12 entries), and AIG (9 entries) — but zero entries for LT pages. They are not discoverable via Cmd+K.

**Fix**: Add 7 entries to `UniversalCommandSurface.tsx` under a "Launch Truth" group.

## Implementation Steps

1. **Create `src/components/admin/LTSubNav.tsx`** — 7 navigation links matching `/admin/truth/*` routes (Behavioral Truth, CI Pipeline, E2E Journeys, Runtime Probes, Launch Gate, Route/Interaction Truth, Regression Radar)
2. **Inject LTSubNav** into all 7 LT pages (LT01–LT07) — add import + render at top of each page
3. **Add 7 Command Palette entries** to `UniversalCommandSurface.tsx` for all LT pages
4. **Build verification** — confirm clean TypeScript build

### Technical Details
- LTSubNav: ~50 lines, follows exact ARSubNav pattern
- 7 page edits: ~3 lines each (import + render)
- Command palette: ~15 lines for 7 entries
- No new tables, edge functions, or migrations needed — everything else is already fully implemented

