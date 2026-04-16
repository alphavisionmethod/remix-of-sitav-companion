# SITA OS — Remediation Secondary Discoveries v4.0

> Generated: 2026-04-16 (Updated)
> Previous: 14 discoveries → Now: 14 discoveries (5 resolved, 9 remaining)

## Additional Architecture Debt Found During Remediation

| # | Discovery | Classification | Severity | Status |
|---|-----------|---------------|----------|--------|
| 1 | `src/lib/services/` (478 files) far exceeds ~45 canonical service target | NEEDS_REFACTOR | P1 | 🔶 Planned — shim pattern functional |
| 2 | `src/lib/mock-data/` (27) and `src/lib/demo-data/` (31) overlap significantly | DUPLICATE | P2 | 🔶 Planned |
| 3 | `src/lib/engine/` (3) vs `src/lib/engines/` (60) namespace collision | CLARIFIED | P2 | ✅ **RESOLVED** — `engine/index.ts` documents shell vs domain distinction |
| 4 | Three AI directories: `ai/` (16), `ai-engineering/` (12), `ai-gateway/` (1) | AMBIGUOUS | P2 | 🔶 Planned |
| 5 | `src/lib/hooks/` (10) alongside `src/hooks/` (158) | AMBIGUOUS | P2 | 🔶 Planned |
| 6 | `src/lib/journeys/` (2) vs `src/lib/customer-journey/` (9) | DUPLICATE | P2 | 🔶 Planned |
| 7 | Investment Office has 41 frontend pages with no dedicated edge functions | FRONTEND_HEAVY | P1 | ✅ **RESOLVED** — `investment-portfolio-api` deployed |
| 8 | Digital Presence has 20 pages with no dedicated edge functions | PARTIALLY_WIRED | P2 | ✅ **RESOLVED** — `digital-twin-engine` deployed |
| 9 | `scripts/legacy/` (2 files) still present | DEPRECATED | P3 | 🔶 Safe to remove |
| 10 | Electron build not integrated into CI pipeline | NOT_DEPLOYMENT_READY | P1 | 🔶 Acknowledged — PROTOTYPE classification |
| 11 | No error monitoring SDK | MISSING | P0 | ✅ **RESOLVED** — `error-monitoring-service.ts` + GlobalErrorBoundary |
| 12 | No emergency payment kill switch | MISSING | P0 | ✅ **RESOLVED** — `payment-kill-switch` edge function |
| 13 | Some admin pages may render demo data without real DB | AMBIGUOUS | P1 | 🔶 Per-page audit needed |
| 14 | `lib/constants/` could be merged with design tokens | NEEDS_REFACTOR | P3 | 🔶 Low priority |

## Resolution Summary

| Status | Count |
|--------|-------|
| ✅ Resolved | 5 |
| 🔶 Planned/Acknowledged | 9 |
| **Total** | **14** |

## Stale Files Safe to Remove

| Path | Reason | Risk |
|------|--------|------|
| `scripts/legacy/` (2 files) | Pre-refactor archived scripts | None |

---

*5/14 discoveries resolved in v4.0 remediation. Remaining 9 are P2-P3 technical debt for post-GA sprints.*
