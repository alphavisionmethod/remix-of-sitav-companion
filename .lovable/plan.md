

## Wave 20 — Supportability Platform Closure

### Summary

The support layer currently has **runbook infrastructure** (19 runbooks, resolver, subsystem map, drill status) and an **app-platform support bundle** (`app-support-bundle.ts`), plus an OS-level shell script (`os/scripts/generate-support-bundle.sh`), an ops diagnostic bundle builder (`scripts/support/diagnostics/ops-build-diagnostic-bundle.ts`), a `support-gateway` edge function, and an `incident-classifier` with DB-backed runbook + kill-switch linkage. What is missing: a **unified client-side support bundle builder** spanning all domains, formal redaction policy, environment fingerprinting, runtime crash packs, integration health packs, escalation packaging, session traceability, bundle expiry governance, customer-safe export, and kill-switch suggestion engine. This wave creates 12 source files in `src/lib/support/`, 1 edge function, 1 validator, and 12 generated proof artifacts.

### What Already Exists (Preserve, Extend)

| System | Location | Action |
|--------|----------|--------|
| Runbook registry (19 entries) | `src/lib/support/runbook-registry.ts` | Preserve |
| Runbook resolver (alert→runbook) | `src/lib/support/runbook-resolver.ts` | Preserve; consumed by issue linkage |
| Runbook subsystem map | `src/lib/support/runbook-subsystem-map.ts` | Preserve |
| Runbook drill status | `src/lib/support/runbook-drill-status.ts` | Preserve |
| Incident classifier (DB-backed) | `src/lib/incidents/incident-classifier.ts` | Preserve; consumed by kill-switch suggester |
| App support bundle (per-app + system) | `src/lib/app-platform/app-support-bundle.ts` | Preserve; wrapped by unified builder |
| OS support bundle shell script | `os/scripts/generate-support-bundle.sh` | Preserve (OS-tier, not client) |
| Ops diagnostic bundle | `scripts/support/diagnostics/ops-build-diagnostic-bundle.ts` | Preserve (CI/ops tier) |
| Support gateway edge function | `supabase/functions/support-gateway/index.ts` | Preserve; extend with bundle generation route |
| Workflow step contracts (support-bundle family) | `src/lib/workflows/workflow-step-contracts.ts` | Preserve |
| Workflow proof registry (support-bundle) | `src/lib/workflows/workflow-proof-registry.ts` | Preserve |
| Support view registry | `src/lib/db/support-view-registry.ts` | Preserve |
| Sensitive doc redaction | `src/lib/services/policy-engine/sensitive-doc-policy.service.ts` | Preserve; referenced by redaction policy |
| Check runbook linkage validator | `scripts/support/check-runbook-linkage.ts` | Preserve |

No duplicates identified — all systems are complementary.

### Part 1 — New Source Files (`src/lib/support/`)

| # | File | Purpose |
|---|------|---------|
| 1 | `support-bundle-contract.ts` | Types: `SupportBundle`, `BundlePack`, `BundleType`, `RedactionStatus`, `ExpiryPolicy`, `EscalationPackage`, `SupportSession` |
| 2 | `support-redaction-policy.ts` | Canonical redaction rules for tokens, emails, payment data, provider credentials, prompts, device IDs. Deterministic masking with audit trail of redacted field names |
| 3 | `support-bundle-expiry-policy.ts` | TTL rules per bundle type (24h for customer export, 7d for operator, 30d for escalation). Archival and purge expectations |
| 4 | `environment-fingerprint-builder.ts` | Captures: runtime surface, app version, deployment profile, feature flags, integration status summaries, browser/Electron info, route context. No sensitive data |
| 5 | `runtime-crash-pack-builder.ts` | Captures: recent crash metadata from app-platform observability, restart attempts, recovery state, runtime health signals, linked runbooks |
| 6 | `integration-health-pack-builder.ts` | Captures: per-provider health state, last success/failure, refresh/retry/webhook status, redacted credential state, degraded UX flags, linked runbooks |
| 7 | `support-bundle-builder.ts` | Canonical unified builder. Assembles bundles from domain-specific packs (environment, crash, integration, app-platform, custom). Enforces redaction before output. Links runbooks and kill-switch suggestions |
| 8 | `escalation-package-builder.ts` | Builds escalation packages: issue summary + fingerprint + diagnostics + incidents + runbooks + kill-switch suggestions + session history + severity + action history |
| 9 | `support-session-trace.ts` | In-memory session model: session ID, actor, issue ref, generated bundles, actions taken, escalations, runbooks consulted, closure state |
| 10 | `support-issue-linkage.ts` | Deterministic issue→runbook linkage using runbook-resolver + subsystem map. Returns linked runbooks, workflows, escalation paths, diagnostics packs per issue classification |
| 11 | `support-kill-switch-suggester.ts` | Consumes incident-classifier to produce structured kill-switch suggestions with confidence, linked runbook, required approval level, and actionable vs informational classification |
| 12 | `customer-safe-export.ts` | Applies redaction policy, strips internal-only content, preserves trace IDs, enforces expiry-limited delivery, labels omissions |

Update `src/lib/support/index.ts` barrel to re-export all new modules.

### Part 2 — Edge Function

`supabase/functions/generate-support-bundle/index.ts`:
- Accepts typed bundle request (bundle type, scope, entity IDs)
- Validates caller via `has_admin_permission` check for `support.view`
- Assembles bundle server-side (queries relevant tables for crash data, integration health, incidents)
- Applies redaction
- Returns bundle JSON with audit trace ID
- Logs to `admin_action_audit`

### Part 3 — Validator Script

`scripts/support/check-support-platform-coverage.ts` — BLOCK-tier validator:
- Verifies all 12 source files exist
- Verifies edge function exists
- Verifies redaction policy covers required categories (tokens, emails, payment, credentials, prompts)
- Verifies expiry policy covers all bundle types
- Verifies kill-switch suggester references incident-classifier
- Verifies issue linkage references runbook-resolver
- Emits `generated/support-platform-coverage-report.json`

### Part 4 — Generated Proof Artifacts (12 files in `generated/`)

| # | File |
|---|------|
| 1 | `support-readiness-report.json` |
| 2 | `support-bundle-coverage.json` |
| 3 | `support-redaction-coverage.json` |
| 4 | `support-expiry-policy-report.json` |
| 5 | `support-escalation-coverage.json` |
| 6 | `support-session-traceability.json` |
| 7 | `support-runbook-linkage.json` |
| 8 | `support-kill-switch-suggestion-coverage.json` |
| 9 | `customer-safe-diagnostics-export-report.json` |
| 10 | `environment-fingerprint-coverage.json` |
| 11 | `runtime-crash-pack-coverage.json` |
| 12 | `integration-health-pack-coverage.json` |

All generated by the validator script in a single pass.

### Part 5 — Integration

1. Register `support-platform-coverage` as a BLOCK gate in `check-os-release-readiness.ts` REQUIRED_GATES
2. Update `src/lib/support/index.ts` barrel with all new exports

### Part 6 — Key Design Decisions

- **Single builder pattern**: `SupportBundleBuilder` is a fluent builder that accepts domain packs. No second bundle system.
- **Redaction before output**: The builder enforces redaction as a mandatory step before `build()` returns.
- **Incident classifier reuse**: The kill-switch suggester wraps the existing DB-backed `incident-classifier.ts` rather than duplicating classification logic.
- **Runbook resolver reuse**: Issue linkage wraps the existing `runbook-resolver.ts` rather than reimplementing source-to-subsystem mapping.
- **App-platform bundle wrapping**: The unified builder can include `app-support-bundle.ts` output as a pack, not replace it.

### Verification

- All 12 source files + 1 edge function compile with 0 errors
- Validator passes with GREEN
- 12 generated artifacts produced
- BLOCK gate registered in aggregator
- Production build succeeds

