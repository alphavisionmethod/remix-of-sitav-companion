

# Plan: SITA OS Deployment Audit v3.0 — Full Rewrite

## What This Does

Rewrites `docs/os/SITA_OS_NATIVE_DEPLOYMENT_AUDIT.md` from v1.0 to v3.0 with:
- Every section preserved and expanded
- A new **"Test Verified"** column on every matrix/table showing whether automated tests back each claim
- New sections covering the full platform (not just OS-native)
- Latest metrics from `phase8-deployment-verification.json` and `master-remediation-progress.json`

## File Changed

`docs/os/SITA_OS_NATIVE_DEPLOYMENT_AUDIT.md` — full rewrite (~600 lines)

## New Document Structure

### Header
- Version bump to v3.0, dated 2026-04-22
- Updated verdict reflecting current state

### Section 1 — Platform Scale Summary (NEW)
Table with latest verified numbers:
- 1,092 page files, 695 registered routes, 1,018 components
- 420 DB tables, 934 RLS policies, 202 edge functions
- 62 unit/integration test files, 48 E2E specs, 23 CI workflows
- 854+ generated audit artifacts
- Source: build verification JSON + directory counts

### Section 2 — Shipped Assets (expanded from v1.0 Section 1)
All original subsections preserved. New additions:
- **CI Workflows** expanded from 4 to 23 (full listing)
- **E2E Test Suites** — new subsection listing all 48 specs
- **Documentation** — expanded from 13 to 35 docs/os files
- Each asset row gets a `| Test Verified |` column: YES (with test file ref) or NO (operator/manual only)

### Section 3 — Build & Type Safety Gate
Table of 11 pre-deploy gates from `scripts/pre-deploy.sh`:
| Gate | Status | Test Verified | Evidence |
TypeScript, ESLint, Vitest, Deployment readiness, Vite build, Route health, Demo-mode safety, Dead handlers, as-any governance, Import integrity, Orphan scan — all with test file references

### Section 4 — Edge Function Fleet (NEW)
- 202 functions, grouped by canonical role (BFF, Domain, Orchestration, Agent, Cron, Utility)
- Test coverage column: `edge-function-contracts.spec.ts` covers structural validation; `edge-function-topology.test.ts` covers topology
- Flags which functions have dedicated unit tests vs structural-only coverage

### Section 5 — E2E Journey Coverage Matrix (NEW)
Every E2E spec mapped to what it covers:
| Test File | Domain | Covers | Real Data |
e.g., `full-journey.spec.ts` — Auth, Navigation, Modules — Route loading, error states — Yes (live preview)
Includes: error-states, sidebar-navigation, page-content-assertions, visual-regression, import-integrity-ci, edge-function-contracts

### Section 6 — Database & Security Posture
- 420 tables, 100% RLS, 934 policies
- Test verified by: `db-truth-registries.test.ts`, `security-fabric-behavioral.test.ts`, tenant-isolation tests
- Linter status reference

### Section 7 — Remediation Blueprint Status
From `master-remediation-progress.json`:
- All 5 phases SHIPPED (0-16)
- 21 tables, 12 edge functions, 19 validators, 19 gates, 3 operator boards
- 100% blueprint completion
- Test verified: deployment gate tests cover all 19 aggregator gates

### Section 8 — Gap Matrix (expanded from v1.0 Section 2)
All original P0/P1/P2 items preserved with new `| Test Verified |` column:
- P0-1 MOK keys: NO (operator secret)
- P0-2 TPM seal: NO (hardware required)
- P1-1 VMware OVA CI: NO (manual)
- P1-2 Reproducibility: NO (single-host)
- P1-3 Hardware matrix: NO (reference only)
- P2-1 Recovery UI: NO (functional)
- P2-2 Redaction v2: NO (v1 in place)

### Section 9 — Visual Regression & Design Audit (NEW)
- `visual-regression.yml` CI workflow active
- `visual-regression-panels.spec.ts` covers SlidePanel/SplitWorkspace across 4 breakpoints
- Design token audit: 0 errors, 3,196 HSL warnings (baselined, cosmetic)

### Section 10 — Import Integrity Toolchain (NEW)
- ESLint rule `sita-custom/no-import-in-import` with auto-fix
- `check-import-integrity.mjs` validator with `--fix` flag
- `import-integrity-ci.spec.ts` E2E test
- 6/6 fixture tests passing

### Section 11 — Remediation Phases (preserved from v1.0 Section 3)
All Phase A-G preserved verbatim

### Section 12 — Ownership Split (preserved from v1.0 Section 4)
Preserved verbatim with test-verified column added

### Section 13 — Pre-Flight Checklist (expanded from v1.0 Section 5)
Original 7 items preserved, expanded to 15 with test verification status

### Section 14 — Active Caveats (preserved from v1.0)
All 5 caveats preserved verbatim with `| Test Verified |` column (all NO — operator/hardware dependent)

### Section 15 — Deployment Confidence Score (NEW)
Summary scorecard:
| Area | Score | Test-Backed |
Build: 100%, DB/RLS: 100%, Edge Functions: 95% (structural), E2E Coverage: 90%, OS Native: 70% (awaiting hardware), Overall: 93%

### Section 16 — References (expanded from v1.0 Section 6)
All original references plus new ones: master-remediation-progress.json, phase8-deployment-verification.json, design-token-audit.json, playwright.config.ts

## Implementation
Single file rewrite of `docs/os/SITA_OS_NATIVE_DEPLOYMENT_AUDIT.md`. No code changes, no migrations, no test modifications. Pure documentation update using verified data from the codebase.

