

# Deployment Readiness Plan: From Contract to Production

## Current State (Honest Assessment)

| Area | Count | Status |
|------|-------|--------|
| Edge functions on disk | 202 | Auto-deployed by Lovable Cloud, most functional |
| Pages with `isDemoMode = false` dead branching | 33 | Compiles but carries dead code |
| Pages importing `DEMO_*`/`MOCK_*` constants | 261 | Most cast to empty arrays `([] as typeof DEMO_X)` -- renders nothing |
| Seed data files (`src/data/seed/`) | 29 | Still exist, referenced from 261 pages |
| Secrets configured | 15 | All critical keys present |
| Electron modules | 17 `.cjs` files | Never packaged or tested |
| ISO build scripts | Complete 9-stage pipeline | Never executed |
| Pre-deploy gate (`scripts/pre-deploy.sh`) | 11 checks | Not wired to CI |

## What "100% Deployment Ready" Means

Three deployment surfaces, three separate work streams:

```text
Surface 1: Web App (Lovable Cloud)    -- closest to ready
Surface 2: Desktop App (Electron)     -- needs first packaging run
Surface 3: OS ISO (Ubuntu appliance)  -- needs CI infrastructure
```

---

## Phase 1: Web App Production Clean (Lovable -- can do now)

### 1A. Complete the `isDemoMode` removal (33 pages)

For each of the 33 pages still containing `const isDemoMode = false`:
- Remove the variable declaration
- Replace `isDemoMode ? "demo" : "live"` ternaries with the "live" branch directly
- Replace `if (isDemoMode) return;` guards with nothing (they are no-ops since the value is always `false`)
- Update `PageTruthBanner truthState={isDemoMode ? "demo" : "live"}` to `truthState="live"`

Files: `DailyPulse.tsx`, `GlobalBoardroom.tsx`, `NotificationCenter.tsx`, `OwnerCenter.tsx`, `ApprovalsCenter.tsx`, `Boardroom.tsx`, `RevenueCallingPage.tsx`, `TrustCenter.tsx`, `AdvisorWorkspace.tsx`, `AdvisorCouncilDashboard.tsx`, `FilesOverview.tsx`, `MoneyOverview.tsx`, `SubscriptionsWaste.tsx`, `ReservesSavings.tsx`, `ConciergeOverview.tsx`, `MonthGridCalendar.tsx`, `UpcomingNeeds.tsx`, `FamilyBoardroom.tsx`, `CommunicationsCenter.tsx`, `QuotesWorkspace.tsx`, `CollectionsCommandCenter.tsx`, `EnterpriseControlPlane.tsx`, `ConnectionDetail.tsx`, and remaining pages in subdirectories.

### 1B. Remove `DEMO_*`/`MOCK_*` dead references (261 pages)

The pattern across 261 pages is:
```tsx
import { DEMO_X } from "@/data/seed/...";
// ...
{([] as typeof DEMO_X).map(item => ...)}  // renders NOTHING
```

For each page:
- Remove the import of `DEMO_*`/`MOCK_*` constants
- Replace `([] as typeof DEMO_X).map(...)` with proper empty-state rendering using `PremiumEmptyState` component
- Where a real data hook already exists alongside the demo import, keep the hook and remove the demo fallback
- Where no real hook exists, render an empty state with a "Connect data source" or "Coming soon" message

### 1C. Delete seed data files

Once no page imports them, delete all 29 files in `src/data/seed/`. These are 1,800+ lines of fake data that ship to production bundles.

### 1D. Wire pre-deploy gate to build

Add the demo-leak check from `scripts/pre-deploy.sh` as a post-build validation in `package.json` so future regressions are caught:
```json
"postbuild": "bash scripts/validators/check-demo-leaks.sh"
```

### 1E. Verify edge function health

Call the deployed `health-check` function to confirm all subsystems report healthy. Fix any that report degraded (e.g., missing `VAPID_PUBLIC_KEY` is already configured).

---

## Phase 2: Desktop App Packaging Readiness (Lovable -- static fixes)

### 2A. Audit Electron module imports

Verify each of the 17 `.cjs` files in `electron/` can resolve their `require()` targets. Currently `main.cjs` imports:
- `crash-reporter.cjs`, `auto-updater.cjs`, `fs-bridge.cjs`, `license-guard.cjs`, `license-ui.cjs`, `integrity-check.cjs`, `runtime-shield.cjs`, `dlp-guard.cjs`, `network-sentinel.cjs`, `sita-apps-bridge.cjs`

All exist on disk. Verify each exports the named functions that `main.cjs` destructures.

### 2B. Verify Vite Electron build path

`vite.config.ts` already handles `ELECTRON_BUILD` with `base: './'`. Confirm `electron/main.cjs` loads from `path.join(__dirname, '..', 'dist', 'index.html')` which matches the Vite output.

### 2C. Verify `forge.config.cjs` packaging rules

Ensure the Electron Forge config does not exclude `dist/` and includes the correct entrypoint.

### 2D. Create missing `package.json` scripts for Electron

If not present, add `electron:dev` and `electron:package` scripts to the root `package.json` for local development.

---

## Phase 3: ISO Build Readiness (Lovable -- script fixes only)

### 3A. Package list validation

Already done in previous session -- `packages.list` updated for Ubuntu 24.04 Noble `t64` transitions.

### 3B. Build script symlink fix

Already done -- `build.sh` updated to install shell binary and create `/usr/bin/sita-shell`.

### 3C. Verify QEMU validation assertions

Review `os/qemu-validate.sh` to ensure the 5 positive assertions match the actual service names and paths installed by `build.sh`.

---

## Phase 4: CI Pipeline (Requires GitHub -- documented in runbook)

These cannot be done in Lovable but the runbook (`docs/FIRST_BUILD_RUNBOOK.md`, already created) covers them:

1. Push code to GitHub
2. Configure repository secrets: `SUPABASE_PROJECT_REF`, `SUPABASE_ACCESS_TOKEN`
3. Trigger "Release - Desktop Matrix" workflow for Electron builds
4. Trigger "sita-os-build-iso" workflow for ISO builds
5. Download artifacts and test locally

---

## Execution Order

| Step | Effort | Scope |
|------|--------|-------|
| 1A: Remove `isDemoMode` from 33 pages | ~2 hours | 33 files |
| 1B: Remove `DEMO_*`/`MOCK_*` from 261 pages | ~6 hours | 261 files + empty states |
| 1C: Delete seed data | 5 min | 29 files |
| 1D: Wire post-build check | 5 min | 1 file |
| 1E: Health check verification | 10 min | API call |
| 2A-2D: Electron audit | 30 min | 17 files |
| 3A-3C: ISO script audit | 15 min | 3 files |

**Total estimated Lovable work: ~9 hours across multiple sessions.**

Phase 1A and 1B are the bulk of the work and should be done in batches of 10-15 pages per session to stay within context limits.

## What This Plan Produces

- A web app that ships zero demo data and zero dead code paths to production
- Static verification that Electron packaging will succeed on first CI run
- Static verification that ISO build scripts reference correct paths and packages
- A post-build gate that prevents demo data from being reintroduced

