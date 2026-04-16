# SITA OS — Secondary Refactor Discoveries v4.0

> Generated: 2026-04-16 (Updated)
> Source: Master Deployment Audit pass + P0/P1 remediation

## Architecture Debt Discovered

| # | Discovery | Classification | Severity | Status |
|---|-----------|---------------|----------|--------|
| 1 | `src/lib/services/` contains 478 files — far exceeds ~45 canonical service target | NEEDS_REFACTOR | P1 | 🔶 Planned — shim pattern works |
| 2 | `src/lib/mock-data/` (27 files) and `src/lib/demo-data/` (31 files) overlap | DUPLICATE | P2 | 🔶 Planned |
| 3 | `src/lib/engine/` (3 files) vs `src/lib/engines/` (60 files) namespace collision | CLARIFIED | P2 | ✅ **RESOLVED** |
| 4 | Three AI library directories: `ai/` (16), `ai-engineering/` (12), `ai-gateway/` (1) | AMBIGUOUS | P2 | 🔶 Planned |
| 5 | Investment Office pages exist without backend edge functions | RESOLVED | P1 | ✅ **RESOLVED** — `investment-portfolio-api` |
| 6 | Digital Twins page has no backend twin engine | RESOLVED | P2 | ✅ **RESOLVED** — `digital-twin-engine` |
| 7 | VMware/appliance deploy scripts never verified in CI | DOCS_ONLY | P2 | 🔶 Acknowledged |
| 8 | Electron build not in CI pipeline | NOT_DEPLOYMENT_READY | P1 | 🔶 Acknowledged — PROTOTYPE |
| 9 | No error monitoring integration | RESOLVED | P0 | ✅ **RESOLVED** — `error-monitoring-service.ts` |
| 10 | No emergency payment kill switch | RESOLVED | P0 | ✅ **RESOLVED** — `payment-kill-switch` |
| 11 | `src/lib/hooks/` (10 files) exists alongside `src/hooks/` (158 files) | AMBIGUOUS | P2 | 🔶 Planned |
| 12 | Some admin pages render demo data without real DB backing | AMBIGUOUS | P1 | 🔶 Per-page audit needed |
| 13 | `src/lib/constants/` could be merged with design tokens | NEEDS_REFACTOR | P3 | 🔶 Low priority |
| 14 | `src/lib/journeys/` (2 files) vs `src/lib/customer-journey/` (9 files) | DUPLICATE | P2 | 🔶 Planned |

## Resolution Summary

| Status | Count |
|--------|-------|
| ✅ Resolved in v4.0 | 5 |
| 🔶 Planned/Acknowledged | 9 |

## Stale Files / Safe to Remove

| Path | Reason | Risk |
|------|--------|------|
| `scripts/legacy/` (2 files) | Archived from pre-refactor | None — already isolated |

## Route Family Assessment

All 14 route families verified intact. No reorganization needed.

## Admin Surface Assessment

503 admin pages across ~30 domains. No orphaned pages detected. Some may render demo data rather than live DB queries — requires per-page audit for full production classification.

## Manifest/Script Obsolescence

No obsolete manifests or scripts detected after the global refactor. All 304 scripts have canonical paths. All 79 generated artifacts have registry entries.

## Runtime Claim Downgrades

| Claim | Previous | Updated | Status |
|-------|---------|---------|--------|
| Desktop OS Shell | Implied real | Explicitly SIMULATED | ✅ Applied |
| Nova Kernel (scheduler, FS, memory) | Implied real | Explicitly SIMULATED | ✅ Applied |
| VMware appliance boot | Implied prototype | Explicitly DOCS_ONLY | ✅ Applied |
| IoT/Wearable device integration | Implied prototype | Explicitly DOCS_ONLY | ✅ Applied |

---

*5/14 issues resolved in v4.0 remediation. Remaining 9 are documented for future sprint planning.*
