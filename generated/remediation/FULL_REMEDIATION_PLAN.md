# SITA OS — Full Remediation Plan

> Generated: 2026-04-16

## Overview

This document categorizes all issues discovered during the deployment audit into remediation groups.

---

## Group A — Broken Wiring (Fixed)

| # | Issue | File(s) | Fix Applied |
|---|-------|---------|-------------|
| A1 | `scripts/validation/` references in platform-law-registry | `src/lib/platform-law/platform-law-registry.ts` | Updated 26 paths to canonical locations |
| A2 | `scripts/generate-*` root-level references | `src/lib/platform-law/platform-law-registry.ts` | Updated to `scripts/manifests/generate/` |
| A3 | Architecture check paths post-refactor | `src/lib/platform-law/platform-law-registry.ts` | Updated to `scripts/architecture/checks/` |
| A4 | Barrel export consistency in `src/lib/db/index.ts` | `src/lib/db/index.ts` | Verified — all 10 exports resolve |
| A5 | Route family → page resolution | All 14 route files | Verified — all routes resolve to existing pages |

## Group B — Missing Implementation

| # | Issue | Severity | Status | Resolution |
|---|-------|----------|--------|------------|
| B1 | No Sentry/error monitoring | P0 | PENDING_BLOCKER | Requires Sentry DSN setup |
| B2 | No payment kill switch edge function | P0 | PENDING_BLOCKER | Requires new edge function |
| B3 | No proven green CI artifacts | P0 | PENDING_BLOCKER | Requires CI pipeline run |
| B4 | Investment Office lacks dedicated edge functions | P1 | ACKNOWLEDGED | 41 pages use shared services |
| B5 | Digital Presence lacks dedicated edge functions | P2 | ACKNOWLEDGED | 20 pages use shared services |
| B6 | Electron build not in CI pipeline | P1 | ACKNOWLEDGED | Electron is PROTOTYPE classification |
| B7 | Mobile native bridges missing | P1 | ACKNOWLEDGED | PWA_ONLY classification applied |

## Group C — Duplicate or Ambiguous Implementation

| # | Issue | Severity | Resolution Path |
|---|-------|----------|-----------------|
| C1 | `lib/engine/` (3) vs `lib/engines/` (60) | P2 | Merge `engine/` → `engines/` |
| C2 | `lib/hooks/` (10) vs `src/hooks/` (158) | P2 | Merge `lib/hooks/` → `src/hooks/` |
| C3 | `lib/journeys/` (2) vs `lib/customer-journey/` (9) | P2 | Merge into `customer-journey/` |
| C4 | `lib/ai-gateway/` (1) vs `lib/ai/` (16) | P2 | Merge into `ai/` |
| C5 | `lib/mock-data/` (27) + `lib/demo-data/` (31) | P2 | Merge into unified demo layer |

## Group D — Structural Refactors

| # | Issue | Severity | Resolution Path |
|---|-------|----------|-----------------|
| D1 | `lib/services/` has 478 files (target: ~45) | P1 | Consolidate via canonical shim pattern |
| D2 | Admin pages (503) may benefit from domain grouping | P3 | Optional reorganization |
| D3 | `lib/constants/` could merge with design tokens | P3 | Low priority cleanup |

## Group E — Validation & Readiness Gaps

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| E1 | No page-level error boundary audit | P1 | PENDING |
| E2 | No E2E test coverage metrics | P2 | PENDING |
| E3 | No load/performance test suite | P2 | PENDING |
| E4 | No backup/restore verification test | P2 | PENDING |

---

## Approach

1. **Canonical sources fixed first** — Platform-law-registry, barrel exports, route files
2. **Consumers rewired** — All imports updated to match canonical paths
3. **Reality classifications applied** — Electron=PROTOTYPE, Mobile=PWA_ONLY, VMware=DOCS_ONLY
4. **Blockers documented** — P0 items require external setup (Sentry DSN, CI credentials)

---

*All Group A items are resolved. Groups B-E are documented for sprint planning.*
