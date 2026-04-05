## Wave 5 — CI / E2E / Behavioral Truth / Launch Gate

### Phase 1: Database Schema
Create tables for: `ci_runs`, `ci_jobs`, `e2e_journeys`, `e2e_runs`, `e2e_steps`, `runtime_probes`, `runtime_probe_runs`, `launch_gates`, `launch_gate_criteria`, `launch_blockers`, `route_truth_records`, `behavioral_regressions`

### Phase 2: GitHub Actions CI Pipeline
- `.github/workflows/ci.yml` — typecheck, lint, unit tests, build, e2e
- Artifact upload for Playwright reports

### Phase 3: Playwright E2E Suite (P0 Journeys)
- Auth: sign-in, protected routes, logout
- Files: upload, browse, persistence
- AI Chat: send message, degraded state handling
- Core routes: home, admin, flagship routes load without crash
- Command palette: open, navigate
- Critical forms: settings persistence

### Phase 4: Runtime Probes Edge Function
- `runtime-probes` edge function checking: route health, edge function health, AI health, auth health, scheduler health

### Phase 5: Admin Surfaces (LT01–LT07)
- LT01: Behavioral Truth Overview
- LT02: CI Pipeline Center
- LT03: E2E Journey Board
- LT04: Runtime Probe Center
- LT05: Launch Gate Board
- LT06: P0 Route & Interaction Truth Board
- LT07: Truth Regression Radar

### Phase 6: Launch Gate Logic
- Evidence-based launch state calculation
- Promotion blocking rules
- Wire to truth surfaces
