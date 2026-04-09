

# SITA OS — Complete Gap Audit for Full Production Readiness

## Current State Summary

**What's solid:**
- 0 TypeScript errors, 0 `as any` in pages, 0 `as unknown as` in pages, 0 `useState<any>`
- 485 database tables, all with RLS enabled
- 52 edge functions deployed
- ~200+ admin pages, ~100+ user-facing pages
- Auth flow (login, signup, reset, demo mode) working
- PWA manifest + service worker + icons present
- Context switcher built and mounted in top bar
- Contextual rail built (205 lines, entity details + proof chain + advisor notes)
- Docker + nginx + systemd service + OTA agent ready
- Service manifest clean (0 `undefined` entries — previously fixed)
- 169 test files, error boundaries, loading states across 214 pages

---

## What's Still Missing (Grouped: App Layer → OS Layer → Ops Layer)

### APP LAYER — Code Quality & Features

#### A1. Type 635 remaining `: any)` callback parameters (P0)
Still 635 instances across ~230 page files. Pattern: `.map((row: any) => ...)`. Each hides runtime bugs.

**Fix:** Domain-by-domain sweep — type each callback using DB row types or view-model interfaces. Split into batches:
- Batch 1: admin/ pages (~150 files, ~300 instances)
- Batch 2: money/, business/, concierge/ pages (~40 files)
- Batch 3: remaining user-facing pages (~40 files)

#### A2. Fix 3 `as any` in platform bridge (P4)
`push-registration-service.ts` lines 27, 28, 237 — `(window as any)?.Capacitor`. Use typed declarations from `vite-env.d.ts`.

#### A3. Consolidate mock-data → demo-data (P2)
24 files in `src/lib/mock-data/`, 15 in `src/lib/demo-data/`. Merge into one canonical `demo-data/` directory. Audit 5 pages that still use mock fallback patterns when live data is empty.

#### A4. Calendar reconciliation (P3 — Sprint 2)
Not implemented. Needs: a calendar sync service, reconciliation UI comparing SITA calendar vs external provider (Google Calendar connector exists), conflict resolution flow.

#### A5. Task delegation flow (P3 — Sprint 2)
Not implemented. Needs: delegation assignment UI in concierge, delegation receipt tracking, delegated-task status in Daily Pulse.

#### A6. Advisor simulation studio (P3 — Sprint 2)
Partially built. Single advisor view exists. Missing: side-by-side simulation comparison, policy impact preview, "what if" scenario runner connecting to the existing `AutomationSimLab`.

---

### SECURITY LAYER

#### S1. Fix 30 RLS policies: `public` → `authenticated` (P1)
Security scan confirmed: `vault_items`, `health_logs`, `tax_estimates`, `appointments`, `money_approvals`, `receivables`, `trade_orders`, and 23 more tables have policies assigned to `{public}` instead of `{authenticated}`.

**Fix:** Single migration altering all 30 policies. No data change, just role assignment.

#### S2. Enable leaked password protection (P1)
Supabase linter flags this. Must be enabled in Supabase Dashboard → Auth → Settings. Not fixable via code — operator action.

---

### OS LAYER — Deployment & Infrastructure

#### O1. OTA update agent script (P2)
`sita-ota.service` exists and references `/opt/sita/sita-ota-agent.sh` but the actual script doesn't exist in the repo.

**Fix:** Create `scripts/release/iso/sita-ota-agent.sh` with: version check against update endpoint, download new Docker images, `docker compose pull && docker compose up -d`, rollback on health check failure, receipt logging.

#### O2. First-boot provisioning script completeness (P2)
`sita-first-boot.sh` exists in `scripts/release/iso/` but needs validation against the first-boot spec (device ID generation, tenant binding, trust baseline, key generation).

#### O3. Backup/restore scripts (P2)
`restore-backup.sh` and `restore-backup.ps1` exist. Need: automated `pg_dump` backup script, volume snapshot script, backup verification/integrity check.

#### O4. ISO build pipeline (P3)
`scripts/build-ova.sh` exists for OVA. Missing: actual ISO builder using Ubuntu autoinstall (profiles exist in `scripts/release/iso/autoinstall/` and `scripts/release/iso/profiles/`). Need a `build-iso.sh` that packages autoinstall + Docker images + SITA runtime into a bootable ISO.

#### O5. Health endpoint for containers (P2)
Docker Compose references health checks but the actual `/health` endpoint in the nginx config and a health check page need verification.

---

### OPS LAYER — Monitoring & Quality

#### Q1. Generate production-ready manifests (P2)
Several generated manifests need regeneration with latest code state. Run `scripts/generate-all.ts` to sync all manifests.

#### Q2. E2E test coverage (P3)
`tests/e2e/` and `tests/integration/` directories exist but coverage of critical flows (auth → onboarding → daily pulse → money → approvals) needs audit.

#### Q3. Performance budget enforcement (P3)
`generated/surface-performance-budget.json` exists. Need: actual Lighthouse CI or bundle-size check in build pipeline.

---

## Recommended Implementation Order

| # | Task | Type | Effort | Priority |
|---|------|------|--------|----------|
| 1 | Fix 30 RLS policies `public` → `authenticated` | Migration | Small | P1 |
| 2 | Type `: any)` callbacks — admin batch | Code | Large | P0 |
| 3 | Type `: any)` callbacks — money/business/concierge | Code | Medium | P0 |
| 4 | Type `: any)` callbacks — remaining pages | Code | Medium | P0 |
| 5 | Create OTA agent script | OS | Small | P2 |
| 6 | Consolidate mock-data → demo-data | Code | Medium | P2 |
| 7 | Fix platform bridge `as any` (3 instances) | Code | Tiny | P4 |
| 8 | Calendar reconciliation feature | Feature | Large | P3 |
| 9 | Task delegation flow | Feature | Medium | P3 |
| 10 | Advisor simulation studio completion | Feature | Medium | P3 |
| 11 | Backup automation scripts | OS | Small | P2 |
| 12 | ISO build pipeline script | OS | Medium | P3 |
| 13 | Regenerate all manifests | Ops | Small | P2 |

## What's Ready Now
- App shell, routing, auth, theming, sidebar — production-ready
- Page-level type safety (no `as any`, no `as unknown as`, no `useState<any>`) — clean
- Edge functions deployed and functional
- PWA installable (manifest, service worker, icons, offline caching)
- Context switcher and contextual rail — built
- Docker + nginx + systemd + OTA timer — structured
- Architecture contracts and boundary enforcement — passing
- 485 tables with RLS enabled

## What Blocks "Fully Advanced"
1. **635 `: any)` callbacks** — the remaining type safety gap
2. **30 RLS policies on `public`** — security compliance
3. **Missing OTA agent script** — OS deployment gap
4. **Calendar reconciliation + task delegation** — Sprint 2 incomplete features

