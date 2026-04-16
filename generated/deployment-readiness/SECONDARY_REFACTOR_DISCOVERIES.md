# SITA OS — Secondary Refactor Discoveries

> Generated: 2026-04-16
> Source: Master Deployment Audit pass

## Architecture Debt Discovered

| # | Discovery | Classification | Severity | Action Required |
|---|-----------|---------------|----------|-----------------|
| 1 | `src/lib/services/` contains 478 files — far exceeds ~45 canonical service target | NEEDS_REFACTOR | P1 | Consolidate via canonical shim pattern |
| 2 | `src/lib/mock-data/` (27 files) and `src/lib/demo-data/` (31 files) overlap | DUPLICATE | P2 | Merge into unified demo layer |
| 3 | `src/lib/engine/` (3 files) vs `src/lib/engines/` (60 files) namespace collision | AMBIGUOUS | P2 | Merge `engine/` into `engines/` |
| 4 | Three AI library directories: `ai/` (16), `ai-engineering/` (12), `ai-gateway/` (1) | AMBIGUOUS | P2 | Clarify ownership; merge `ai-gateway/` into `ai/` |
| 5 | Investment Office pages exist without backend edge functions | FRONTEND_WITHOUT_BACKEND | P1 | Add edge functions or classify as frontend-only |
| 6 | Digital Twins page has no backend twin engine | FRONTEND_WITHOUT_BACKEND | P2 | Add backend or remove page |
| 7 | VMware/appliance deploy scripts never verified in CI | DOCS_ONLY | P2 | Test or archive scripts |
| 8 | Electron build not in CI pipeline | NOT_DEPLOYMENT_READY | P1 | Add Electron Forge CI workflow |
| 9 | No Sentry/error monitoring integration | MISSING | P0 | Add error boundary + monitoring SDK |
| 10 | No emergency payment kill switch | MISSING | P0 | Add kill-switch edge function |
| 11 | `src/lib/hooks/` (10 files) exists alongside `src/hooks/` (158 files) | AMBIGUOUS | P2 | Merge into `src/hooks/` |
| 12 | Some admin pages render demo data without real DB backing | AMBIGUOUS | P1 | Audit per-page and wire to real data |
| 13 | `src/lib/constants/` could be merged with design tokens | NEEDS_REFACTOR | P3 | Low priority cleanup |
| 14 | `src/lib/journeys/` (2 files) vs `src/lib/customer-journey/` (9 files) | DUPLICATE | P2 | Merge into `customer-journey/` |

## Stale Files / Safe to Remove

| Path | Reason | Risk |
|------|--------|------|
| `scripts/legacy/` (6 files) | Archived from pre-refactor | None — already isolated |
| `src/lib/engine/` (3 files) | Superseded by `src/lib/engines/` | Low — check imports first |

## Route Family Assessment

All 14 route families verified intact. No reorganization needed.

## Admin Surface Assessment

503 admin pages across ~30 domains. No orphaned pages detected. Some may render demo data rather than live DB queries — requires per-page audit for full production classification.

## Manifest/Script Obsolescence

No obsolete manifests or scripts detected after the global refactor. All 202 scripts have canonical paths. All 58 generated artifacts have registry entries.

## Runtime Claim Downgrades

| Claim | Current | Should Be |
|-------|---------|-----------|
| Desktop OS Shell | Implied real | Explicitly SIMULATED |
| Nova Kernel (scheduler, FS, memory) | Implied real | Explicitly SIMULATED |
| VMware appliance boot | Implied prototype | Explicitly DOCS_ONLY |
| IoT/Wearable device integration | Implied prototype | Explicitly DOCS_ONLY |

---

*All issues above are documented for future sprint planning. P0 items are launch blockers. P1 items should be addressed before GA. P2-P3 are technical debt.*
