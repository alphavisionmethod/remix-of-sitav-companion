# SITA OS — Remediation Secondary Discoveries

> Generated: 2026-04-16

## Additional Architecture Debt Found During Remediation

| # | Discovery | Classification | Severity | Action |
|---|-----------|---------------|----------|--------|
| 1 | `src/lib/services/` (478 files) far exceeds ~45 canonical service target | NEEDS_REFACTOR | P1 | Execute service consolidation manifest |
| 2 | `src/lib/mock-data/` (27) and `src/lib/demo-data/` (31) overlap significantly | DUPLICATE | P2 | Merge into unified `demo-data/` |
| 3 | `src/lib/engine/` (3) vs `src/lib/engines/` (60) namespace collision | AMBIGUOUS | P2 | Merge `engine/` → `engines/` |
| 4 | Three AI directories: `ai/` (16), `ai-engineering/` (12), `ai-gateway/` (1) | AMBIGUOUS | P2 | Merge `ai-gateway/` → `ai/` |
| 5 | `src/lib/hooks/` (10) alongside `src/hooks/` (158) | AMBIGUOUS | P2 | Merge into `src/hooks/` |
| 6 | `src/lib/journeys/` (2) vs `src/lib/customer-journey/` (9) | DUPLICATE | P2 | Merge into `customer-journey/` |
| 7 | Investment Office has 41 frontend pages with no dedicated edge functions | FRONTEND_HEAVY | P1 | Add investment API edge functions |
| 8 | Digital Presence has 20 pages with no dedicated edge functions | PARTIALLY_WIRED | P2 | Add or classify appropriately |
| 9 | `scripts/legacy/` (2 files) still present | DEPRECATED | P3 | Safe to remove |
| 10 | Electron build not integrated into CI pipeline | NOT_DEPLOYMENT_READY | P1 | Add CI workflow when ready |
| 11 | No Sentry/error monitoring SDK | MISSING | P0 | Add before launch |
| 12 | No emergency payment kill switch | MISSING | P0 | Add before payments go live |
| 13 | Some admin pages may render demo data without real DB | AMBIGUOUS | P1 | Per-page audit required |
| 14 | `lib/constants/` could be merged with design tokens | NEEDS_REFACTOR | P3 | Low priority |

## Stale Files Safe to Remove

| Path | Reason | Risk |
|------|--------|------|
| `scripts/legacy/` (2 files) | Pre-refactor archived scripts | None |
| `src/lib/engine/` (3 files) | Superseded by `src/lib/engines/` | Low — verify imports first |

---

*All discoveries documented for sprint planning. P0 items are launch blockers.*
