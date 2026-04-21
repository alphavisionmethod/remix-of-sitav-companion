

# SITA OS Platform Remediation Program

## Summary

A phased remediation addressing 8 structural risks: testing confidence, service sprawl (209 dirs vs 45 target), admin sprawl (568 pages), kill-switch drill gaps, AI domain model overlap, platform extensibility, mobile truth, and cost/performance observability. Delivered as new strategy docs, consolidation scripts, redesigned admin surfaces, drill infrastructure, and observability dashboards.

---

## Phase 1 -- Reality and Safety (this implementation pass)

### 1A. Testing Strategy Framework and Critical Path Matrix

**New files:**

- `src/lib/testing/testing-strategy.ts` -- Layered strategy registry declaring 7 test tiers (unit, integration, edge-function, workflow, e2e, regression, safety/permission) with coverage targets per domain.
- `src/lib/testing/critical-path-matrix.ts` -- Matrix of ~25 highest-risk user journeys (homepage load, waitlist submit, beta apply, crowdfund pledge, investor request, deal room, boardroom demo, launchpad download, AI chat, CRM creation, workflow trigger, consent enforcement, receipt creation). Each entry: feature, primary flow, expected behavior, edge cases, data deps, failure modes, owner, test type, current coverage status.
- `src/test/critical-journeys/` -- Behavioral tests for top-10 journeys (homepage route integrity, waitlist submit round-trip, boardroom demo flow, AI chat grounded answer, CRM record CRUD, workflow trigger execution).
- `src/lib/testing/confidence-model.ts` -- Replaces validator-theater with a scored confidence model. Calculates domain coverage %, pass/fail of critical journeys, safety drill status, deployment confidence score, and lists known untested critical paths.

**Modified files:**

- CI integration: New `scripts/architecture/checks/check-behavioral-confidence.ts` that requires behavioral tests for sensitive domains and blocks merge when critical journey coverage drops.

### 1B. Kill Switch Inventory and First Drills

**New files:**

- `src/lib/control-plane/kill-switch-drill-runner.ts` -- Drill execution engine. For each of the 14 registered kill switches: defines trigger conditions, success criteria (observable signal verification), rollback criteria, time-to-disable expectation, and failure escalation. Supports dry-run (simulated) and live drill modes.
- `src/lib/control-plane/kill-switch-drill-calendar.ts` -- Quarterly drill schedule with per-switch cadence, responsible operator assignment, and overdue tracking.
- `src/pages/admin/KillSwitchDrillCenter.tsx` -- Dashboard showing: switch status, last drill date, last successful drill, failed drill history, time-to-stop benchmarks, authorized operators, drill execution button (dry-run), and overdue alerts.

**Database migration:**

- `kill_switch_drill_results` table: drill_id, switch_id, drill_type (dry-run/live), started_at, completed_at, success (bool), time_to_disable_ms, operator_id, failure_notes, rollback_verified. RLS: admin-only read/write.

### 1C. Service Inventory and Classification

**New files:**

- `src/lib/architecture/service-inventory.ts` -- Canonical inventory of all 209 service directories, each classified as: core-domain, orchestration, integration-adapter, utility, dead/redundant, duplicate, merge-candidate, delete-candidate. Includes target destination service mapping.
- `src/lib/architecture/target-service-model.ts` -- Defines the 45-service target operating model with 15 canonical domains: identity-contacts, website-content, waitlist-beta, investor-dealroom, donor-crowdfund, advisory-boardroom, workflow-engine, campaigns-messaging, analytics-attribution, trust-receipts-audit, launchpad-build, platform-integrations, ai-orchestration, admin-command, os-platform.
- `scripts/architecture/checks/check-service-consolidation-progress.ts` -- Tracks consolidation wave progress: current count, target, merged this wave, remaining, and warns when new services are created without domain justification.

### 1D. Admin Route Audit

**New files:**

- `src/lib/architecture/admin-route-audit.ts` -- Inventory of all 568 admin pages classified by: purpose, role served, usage frequency (high/medium/low/unknown), overlap/duplication group, recommended action (keep/merge/archive/delete/convert-to-tab/convert-to-modal).
- `src/lib/architecture/admin-ia-target.ts` -- Target admin IA with ~15 top-level sections: Overview, CRM/Contacts, Investors, Backers/Crowdfund, Waitlist/Beta, Campaigns, Workflows, Advisory/Boardroom, Launchpad/Builds, Website/Content, Trust/Audit, Analytics, Settings/Integrations, Platform Health, Security.
- Consolidation recommendation report generated to `generated/admin-consolidation-plan.json`.

### 1E. AI Domain Model Clarification

**New files:**

- `src/lib/architecture/ai-domain-model.ts` -- Canonical definitions:
  - **Advisor**: A specialized guidance persona bound to a domain (e.g., Business Advisor, Finance Advisor). Owns recommendation generation, domain-specific intelligence, and user-facing guidance interactions.
  - **Boardroom**: A structured multi-advisor consultation surface. Owns debate orchestration, consensus building, and strategic multi-perspective review sessions.
  - **Brain**: The underlying orchestration/memory/reasoning substrate. Owns context retrieval, memory persistence, model routing, capability registration, and inference pipeline.
- Decision tree for engineers: "Single-role guidance? -> Advisor. Multi-perspective strategic session? -> Boardroom. Shared intelligence infrastructure? -> Brain."
- Naming alignment map: lists current services/routes/components with their canonical domain assignment and any required renames.

### 1F. Mobile Truth Correction

**Modified files:**

- `docs/MOBILE_HONESTY.md` -- Updated to clearly distinguish: (1) mobile-responsive web (active, production), (2) installable PWA (active, optional), (3) native mobile app (not available, future consideration). Removes any language implying native app existence.
- `src/lib/architecture/mobile-strategy.ts` -- Strategy declaration: PWA-first for mobile experience, web push via VAPID for notifications, native apps deferred pending business decision. Includes honest "available now / coming later" state for each capability.

### 1G. Baseline Performance Instrumentation

**New files:**

- `src/lib/observability/performance-baselines.ts` -- Defines baseline metrics to track: route load times (p50/p95/p99), edge function latency, AI chat response time, workflow execution time, cold start times. Provides measurement hooks.
- `src/lib/observability/cost-model.ts` -- Cost estimation framework: infra cost by subsystem, AI usage cost per session, storage cost, messaging cost, estimated cost-per-active-user. Initially populated with placeholder estimates to be refined with real data.
- `src/lib/observability/slo-definitions.ts` -- Initial SLO set: core route availability (99.5%), waitlist form success (99.9%), AI chat p95 latency (<3s), kill switch actuation (<30s), workflow execution success (99%).

---

## Phase 2 -- Simplification and Confidence

### 2A. Critical Behavioral Test Implementation

Expand `src/test/critical-journeys/` to cover all 25 matrix entries with real behavioral assertions (not just structural checks). Add CI gate requiring 80%+ critical journey coverage.

### 2B. Service Consolidation Wave 1

Execute first consolidation wave targeting the clearest merge/delete candidates (~50 services). Create migration scripts in `scripts/architecture/consolidation/` that move exports, update import paths, and verify no broken references.

### 2C. Admin IA Redesign

Implement the target admin IA: collapse 568 pages into ~80 by converting most to tabs/views within consolidated parent pages. Build `AdminGlobalSearch.tsx` command palette for instant jump-to-any-record.

### 2D. Confidence Dashboard

`src/pages/admin/PlatformConfidenceDashboard.tsx` -- Shows: test coverage by domain, critical journey pass/fail, safety drill status, deployment confidence score, service consolidation progress, admin reduction progress.

### 2E. Kill Switch Dashboard Enhancement

Wire drill results from the database into the existing kill switch console. Add SLO tracking for actuation time benchmarks.

### 2F. First SLOs and Cost Model

Populate SLO definitions with real measured baselines. Create `src/pages/admin/CostPerformanceDashboard.tsx` showing latency, failure rate, error budget, and estimated unit economics.

---

## Phase 3 -- Platform Readiness

### 3A. Public API Strategy

- `docs/API_STRATEGY.md` -- Defines first externally accessible surfaces (contacts, events, receipts, workflow triggers), authentication model (API keys + JWT), versioning (URL path v1/v2), rate limiting, and audit trail.
- `src/lib/architecture/api-surface-registry.ts` -- Registry of approved public API endpoints with permission requirements.

### 3B. Extension/Plugin Model

- `docs/EXTENSION_STRATEGY.md` -- Defines what third parties can extend (workflow actions, integration adapters, advisory tools), safe exposure boundaries, and UI extension points.

### 3C. Tenant/Isolation Strategy

- `docs/TENANCY_STRATEGY.md` -- Documents current org/workspace model, data isolation via RLS, secrets isolation, and roadmap to full multi-tenant deployment.

### 3D. Service Consolidation Wave 2

Continue toward the 45-service target. Update the service facade barrel export.

---

## Phase 4 -- Operational Excellence

### 4A. Recurring Drills

Quarterly kill-switch drill automation with email/notification reminders and overdue escalation.

### 4B. Stronger CI Gates

Behavioral test requirements for all P0 flows. Service creation guardrail (require domain justification ADR).

### 4C. Platform Stabilization Command Center

`src/pages/admin/PlatformStabilizationCenter.tsx` -- Executive dashboard showing all 8 remediation tracks: service consolidation %, test coverage %, admin reduction %, kill switch drill status, domain model alignment, API readiness, mobile roadmap status, performance/cost readiness. Risk register and owner/milestone tracking.

---

## Technical Details

### Database Migrations (Phase 1)

```sql
CREATE TABLE public.kill_switch_drill_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  switch_id TEXT NOT NULL,
  drill_type TEXT NOT NULL CHECK (drill_type IN ('dry-run', 'live')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  success BOOLEAN,
  time_to_disable_ms INTEGER,
  operator_id UUID REFERENCES auth.users(id),
  failure_notes TEXT,
  rollback_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.kill_switch_drill_results ENABLE ROW LEVEL SECURITY;
```

### New Files Summary (Phase 1 -- ~20 files)

- `src/lib/testing/testing-strategy.ts`
- `src/lib/testing/critical-path-matrix.ts`
- `src/lib/testing/confidence-model.ts`
- `src/test/critical-journeys/*.test.ts` (6 test files)
- `src/lib/control-plane/kill-switch-drill-runner.ts`
- `src/lib/control-plane/kill-switch-drill-calendar.ts`
- `src/pages/admin/KillSwitchDrillCenter.tsx`
- `src/lib/architecture/service-inventory.ts`
- `src/lib/architecture/target-service-model.ts`
- `src/lib/architecture/admin-route-audit.ts`
- `src/lib/architecture/admin-ia-target.ts`
- `src/lib/architecture/ai-domain-model.ts`
- `src/lib/architecture/mobile-strategy.ts`
- `src/lib/observability/performance-baselines.ts`
- `src/lib/observability/cost-model.ts`
- `src/lib/observability/slo-definitions.ts`
- `scripts/architecture/checks/check-behavioral-confidence.ts`
- `scripts/architecture/checks/check-service-consolidation-progress.ts`

### Modified Files (Phase 1)

- `docs/MOBILE_HONESTY.md` -- Truth corrections
- Route registration for new admin pages

### Design Direction

All new admin surfaces use the existing glassmorphic card system with: muted backgrounds, high-contrast data, minimal chrome, evidence-based status indicators (green/yellow/red with proof links), and executive-grade information density. No decorative elements -- every pixel earns its place.

