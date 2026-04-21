

# SITA OS — Full Implementation Verification & Product Separation Plan

## Summary

Formalize the four distinct SITA products (OS Desktop, Mobile App, Admin Backend, Core API Platform) with explicit boundaries, then close all verification gaps across 8 audit layers. This plan addresses the current state where: mobile pages use hardcoded demo data instead of real DB queries, product boundaries are implicit rather than enforced, and several cross-product integration seams are unwired.

---

## Part 0: Product Surface Registry (New Foundation)

**Problem**: No explicit registry separates SITA OS, SITA App, SITA Admin, and SITA Core API as distinct products. The `feature-runtime-tier-registry.ts` maps features to runtime tiers (Web/Desktop/Appliance/Simulated) but does not model the four product surfaces.

**Create** `src/platform/product/product-surface-registry.ts`:
- Define enum `ProductSurface`: `SITA_OS_DESKTOP`, `SITA_MOBILE_APP`, `SITA_ADMIN_BACKEND`, `SITA_CORE_API`
- For each surface, declare: owned routes, owned edge functions, owned DB tables, required capabilities, deployment target, build pipeline
- Map every existing route to exactly one product surface
- Map every edge function to its serving surface(s)

**Create** `src/platform/product/product-boundary-contract.ts`:
- Define allowed cross-product dependencies (Mobile -> Core API, OS -> Core API, Admin -> Core API)
- Forbidden: Mobile importing OS shell components, Admin importing domain app UI, OS importing mobile shell

**Create** CI gate `scripts/architecture/checks/check-product-surface-boundaries.ts`:
- Validate no route belongs to multiple surfaces without explicit declaration
- Validate no forbidden cross-surface imports exist
- Wire into `check-os-release-readiness.ts` as a BLOCK gate

---

## Part 1: Layer 1 — Architecture Completeness Audit

### 1A. Product-to-Route Coverage Matrix
- Create `scripts/validation/check-product-route-coverage.ts`
- For each product surface, assert every required domain has at least one route:
  - **OS Desktop**: `/desktop`, `/business`, `/finance`, `/concierge`, `/boardroom`, `/files`, `/settings`, `/integrations`, `/trust`, etc.
  - **Mobile App**: `/mobile/home`, `/mobile/business`, `/mobile/money`, `/mobile/concierge`, `/mobile/boardroom`, `/mobile/files`, `/mobile/settings`, `/mobile/investment`
  - **Admin**: `/admin/overview`, `/admin/alerts`, `/admin/approvals`, `/admin/environments`, `/admin/ai-runtime`, `/admin/integrations`, `/admin/trust-security`, `/admin/health`, `/admin/releases`, `/admin/verification`, `/admin/config`, `/admin/support`
  - **Core API**: every edge function directory in `supabase/functions/`

### 1B. Backend-for-Every-Action Audit
- Create `scripts/validation/check-action-api-coverage.ts`
- Scan all `onClick`, `onSubmit`, `supabase.functions.invoke`, `supabase.from` calls in frontend code
- Cross-reference against edge function inventory and DB table inventory
- Flag any UI action that has no corresponding backend endpoint or DB write

### 1C. Deployment Target Map
- Create `src/platform/deploy/deployment-target-registry.ts`
- Register: Web (Lovable hosting), iOS (Capacitor), Android (Capacitor), VMware/OVA, ISO, Desktop (Electron)
- For each target: list required build steps, required secrets, required CI gates, current readiness status

---

## Part 2: Layer 2 — Feature Inventory Audit

### 2A. Feature Completeness Matrix
- Create `scripts/validation/check-feature-completeness-matrix.ts`
- For every feature in `FEATURE_RUNTIME_TIER_MAPPING` (48 features), verify existence of:
  - UI component (page or window)
  - State management (hook, context, or store)
  - API endpoint (edge function or direct DB)
  - Persistence (DB table or storage bucket)
  - Permission check (RLS policy or role gate)
  - Error handling (error boundary or try/catch)
- Emit `generated/feature-completeness-matrix.json` with pass/fail per feature per dimension

### 2B. Mobile Feature Parity Check
- Create `scripts/validation/check-mobile-feature-parity.ts`
- For each OS desktop domain (Business, Finance, Concierge, Investment, Boardroom, Files):
  - Assert a corresponding `/mobile/*` route exists
  - Assert the mobile page uses real DB data (not hardcoded arrays)
  - Flag mobile pages that lack: search, filter, detail view, action buttons

---

## Part 3: Layer 3 — API Contract Audit

### 3A. Frontend-Backend Contract Matching
- Create `scripts/validation/check-api-contract-alignment.ts`
- Scan all `supabase.functions.invoke("X")` calls in `src/`
- For each, verify `supabase/functions/X/index.ts` exists
- Verify the request body shape in the frontend matches the Zod/validation schema in the edge function
- Verify response type in frontend matches what the edge function returns

### 3B. Cross-Platform API Consumption Audit
- Create `scripts/validation/check-cross-platform-api-parity.ts`
- Verify that OS Desktop, Mobile App, and Admin all consume the same edge function contracts
- Flag any platform-specific API that should be shared but isn't
- Verify auth token handling is consistent across all three frontends

### 3C. Wire Mobile Pages to Real APIs
**This is the largest gap.** Currently, all 25 mobile pages use hardcoded demo data. For each:
- `MobileHome.tsx`: Replace hardcoded PulseCards with queries to `observability_metrics`, `alerts`, `invoices`
- `MobileBusiness.tsx`: Wire to `business-board-api` edge function
- `MobileMoney.tsx`: Wire to `cashflow-calculate` and finance tables
- `MobileConcierge.tsx`: Wire to `communications-api` and calendar tables
- `MobileBoardroom.tsx`: Wire to `boardroom-session` edge function
- `MobileFiles.tsx`: Wire to storage bucket queries
- `MobileInvestment.tsx`: Wire to `investment-portfolio-api`
- `MobileApprovals.tsx`/`MobileAlerts.tsx`/`MobileProof.tsx`: Wire to `alerts`, `approval_requests`, `receipts` tables
- `MobileSettings.tsx`: Wire to user preferences table
- `MobileInbox.tsx`: Wire to `communications-api` or notifications table
- `MobileTimeline.tsx`: Wire to activity/event log tables
- `MobileAIChat.tsx`: Wire to `advisor-conversation` edge function
- `MobileNotificationCenter.tsx`: Wire to push notification tables
- `MobileSyncControl.tsx`: Wire to `cloud-sync-api`
- `MobileSystemMonitor.tsx`: Wire to `health-check` / `os-status`
- `MobileDeviceTrust.tsx`: Wire to trusted device tables

---

## Part 4: Layer 4 — Wiring/Integration Audit

### 4A. End-to-End Wiring Validator
- Create `scripts/validation/check-end-to-end-wiring.ts`
- For each golden path, trace: UI component -> hook/service -> edge function -> DB table -> RLS policy
- Flag any broken link in the chain
- Verify event bus subscriptions have matching publishers

### 4B. Feature Flag Runtime Verification
- Create `scripts/validation/check-feature-flag-wiring.ts`
- Verify every kill switch in `kill_switches` table has:
  - A corresponding check in application code
  - An admin UI toggle (already in `AR08KillSwitchCenter`)
  - A runbook reference

### 4C. Auth-to-Permission Chain Audit
- Create `scripts/validation/check-auth-permission-chain.ts`
- Trace: login -> session -> role lookup -> RLS policy -> data access
- Verify admin routes use `AdminRoute` guard consistently
- Verify mobile routes use `ProtectedRoute` consistently
- Verify edge functions validate JWT in code

---

## Part 5: Layer 5 — Data Lifecycle Audit

### 5A. CRUD Completeness Check
- Create `scripts/validation/check-crud-completeness.ts`
- For every major entity (leads, customers, invoices, tasks, files, advisors, workflows):
  - Verify Create operation exists (UI + API + DB insert)
  - Verify Read operation exists (list + detail views)
  - Verify Update operation exists (edit form + API + DB update)
  - Verify Delete/Archive exists (soft delete preferred)
  - Verify audit trail (timestamps, actor tracking)

### 5B. Sync/Export/Restore Verification
- Verify `data-export` edge function covers all major tables
- Verify `gdpr-export` and `gdpr-delete` handle all PII tables
- Verify `cloud-sync-api` handles offline-to-online reconciliation
- Verify `sovereign-exporter` produces complete portable data packages

---

## Part 6: Layer 6 — Deployment Readiness Audit

### 6A. Environment/Secrets Audit
- Create `scripts/validation/check-deployment-secrets.ts`
- List every `Deno.env.get("X")` in edge functions
- Cross-reference against known secrets in Lovable Cloud
- Flag any missing secret that would cause runtime failure
- Separate: required-for-web vs required-for-mobile vs required-for-desktop

### 6B. Mobile Build Pipeline Verification
- Enhance existing `check-mobile-build-pipeline.ts` to verify:
  - Capacitor config exists with correct app ID
  - iOS and Android platform directories are addable
  - All native plugins declared in `capacitor.config.ts`
  - PWA manifest is complete (icons, name, colors, start_url)
  - Service worker correctly excludes `/~oauth`

### 6C. ISO/VMware Build Pipeline Verification
- Verify `check-iso-artifact-presence.ts`, `check-ova-artifact-presence.ts`, `check-raw-img-artifact-presence.ts` all pass
- Verify `os/scripts/release.sh` references all build steps
- Verify QEMU smoke test script exists and is wired

### 6D. Desktop (Electron) Build Verification
- Verify `check-desktop-deployability.ts` passes
- Verify signing readiness (`check-electron-signing-readiness.ts`)
- Verify auto-update manifest endpoint (`desktop-update-manifest` edge function)

---

## Part 7: Layer 7 — QA/E2E Audit

### 7A. E2E Test Coverage Gap Analysis
- Verify every domain has a journey spec in `tests/e2e/`:
  - Present: business, money, concierge, investment, boardroom, auth, files, connectors, settings, desktop-shell, admin-boards
  - **Missing**: mobile-journey.spec.ts (entire mobile surface untested)
- Create `tests/e2e/mobile-journey.spec.ts` covering: login -> pulse -> business -> money -> approvals -> settings

### 7B. Degraded/Offline Path Tests
- Create `tests/e2e/degraded-mode.spec.ts` verifying:
  - App loads with network offline (PWA cache)
  - Offline queue captures actions
  - Reconnection syncs queued actions
  - Error boundaries display correct degraded states

### 7C. Admin-Only Flow Tests
- Enhance `tests/e2e/admin-boards.spec.ts` to verify:
  - Non-admin users cannot access admin routes
  - Kill switch toggles propagate to runtime
  - Feature flag changes affect user-facing features

---

## Part 8: Layer 8 — Operational/Admin Completeness Audit

### 8A. Support Without Dev Intervention Check
- Create `scripts/validation/check-admin-operational-sufficiency.ts`
- Verify admin can:
  - View user profiles and sessions (`UserManagement.tsx` exists)
  - Reset user setup state (needs: reset-user-setup edge function)
  - Revoke sessions (needs: session-revoke edge function or admin API)
  - Inspect integration health (`CN05ConnectorHealthBoard.tsx` exists)
  - View webhook failures (`webhook-replay` edge function exists)
  - Manage feature flags (kill switches exist)
  - Repair stuck workflows (`workflow-repair` edge function exists)
  - Export diagnostic bundles (`generate-support-bundle` exists)

### 8B. Missing Admin Capabilities
- **Create** `supabase/functions/admin-reset-user-setup/index.ts` — allows admin to reset a user's onboarding/setup state
- **Create** `supabase/functions/admin-revoke-session/index.ts` — allows admin to force-logout a user
- **Add** billing overview section to admin (wire to `billing-service.ts` if applicable)
- **Add** content management surface (if applicable — currently no CMS exists)

### 8C. Recovery Tooling Verification
- Verify `RecoveryCenter.tsx` has real backend wiring
- Verify DR drill system (`dr-drill-runner`, `dr-drill-executor`) can execute and record results
- Verify chaos drill runner produces evidence in `chaos_drill_results` table

---

## Database Migrations

1. No new tables required — all referenced tables already exist
2. Potential column additions for mobile sync metadata (if needed during mobile wiring)

## New Edge Functions

1. `admin-reset-user-setup` — reset user onboarding state
2. `admin-revoke-session` — force-logout user

## New Files

1. `src/platform/product/product-surface-registry.ts`
2. `src/platform/product/product-boundary-contract.ts`
3. `scripts/architecture/checks/check-product-surface-boundaries.ts`
4. `scripts/validation/check-product-route-coverage.ts`
5. `scripts/validation/check-action-api-coverage.ts`
6. `src/platform/deploy/deployment-target-registry.ts`
7. `scripts/validation/check-feature-completeness-matrix.ts`
8. `scripts/validation/check-mobile-feature-parity.ts`
9. `scripts/validation/check-api-contract-alignment.ts`
10. `scripts/validation/check-cross-platform-api-parity.ts`
11. `scripts/validation/check-end-to-end-wiring.ts`
12. `scripts/validation/check-feature-flag-wiring.ts`
13. `scripts/validation/check-auth-permission-chain.ts`
14. `scripts/validation/check-crud-completeness.ts`
15. `scripts/validation/check-deployment-secrets.ts`
16. `scripts/validation/check-admin-operational-sufficiency.ts`
17. `tests/e2e/mobile-journey.spec.ts`
18. `tests/e2e/degraded-mode.spec.ts`

## Modified Files (Mobile Wiring — 16 files)

All 25 files in `src/pages/mobile/` will be updated to replace hardcoded demo data with real Supabase queries via hooks and edge function calls.

## CI Gate Additions

- Gate: `product-surface-boundaries` (BLOCK)
- Gate: `feature-completeness-matrix` (WARN, ratchet to BLOCK)
- Gate: `mobile-feature-parity` (WARN)
- Gate: `api-contract-alignment` (BLOCK)
- Gate: `deployment-secrets` (BLOCK)
- Gate: `admin-operational-sufficiency` (WARN)

## Implementation Order

1. Product Surface Registry (Part 0) — foundation for everything else
2. Mobile API Wiring (Part 3C) — largest functional gap
3. Validation Scripts (Parts 1-5) — automated verification
4. Missing Admin Capabilities (Part 8B) — operational completeness
5. E2E Tests (Part 7) — behavioral proof
6. Deployment Verification (Part 6) — release readiness

