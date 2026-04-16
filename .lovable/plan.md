

# SITA OS — Full Project Audit Report

## Executive Summary

| Metric | Count |
|--------|-------|
| Total TS/TSX files | 4,290 |
| Pages | 1,004 |
| Components | 879 |
| Hooks | 158 + 10 (in `src/lib/hooks/`) |
| Edge Functions | 85 (84 with `index.ts`, 1 `_shared/` helper) |
| Core Services | 220 files |
| Services (shim layer) | 479 files |
| Mock Data files | 27 |
| Demo Data files | 31 |
| Empty/stub files (<=3 lines) | 101 |

---

## Category 1 — Structural & Directory Issues

### 1.1 Duplicate Directory Pairs (P2)
| Pair | Files | Issue |
|------|-------|-------|
| `src/lib/engine/` (3 files) vs `src/lib/engines/` (60 files) | Both active, both imported | Namespace collision. `engine/` is used by 2 consumers (FloatingWindow, CalmEngine). Should merge into `engines/` |
| `src/lib/hooks/` (10 files) vs `src/hooks/` (158 files) | 53 files import from `@/lib/hooks/` | Split import paths. `lib/hooks/` has critical hooks like `useAction`, `useOSRuntime`, `useRealityProvider` used by 53 files |
| `src/lib/journeys/` (2 files) vs `src/lib/customer-journey/` (9 files) | `journeys/` has 0 imports | `src/lib/journeys/` is dead code — zero consumers |
| `src/lib/mock-data/` (27 files) vs `src/lib/demo-data/` (31 files) | Both active, overlapping `investment` and `index` | Two parallel mock data layers with identical purpose |

### 1.2 AI Directory Fragmentation (P2)
Four separate AI directories with overlapping concerns:
- `src/lib/ai/` — 16 files (capability client, routing, workforce)
- `src/lib/ai-engineering/` — 12 files (self-healing, agents)
- `src/lib/ai-gateway/` — 1 file (budget gate only)
- `src/lib/sovereign-ai-gateway/` — 2 files (types only)

### 1.3 Core Services vs Services Overlap (P1)
**39 directories** exist in both `src/lib/core-services/` and `src/lib/services/` with identical names. The `services/` layer (479 files) is the shim/re-export layer, but the duplication causes confusion and inflates the codebase.

---

## Category 2 — Empty/Stub Files (P2)

**101 files** are 3 lines or fewer. Most are barrel re-exports (`export * from "./types"`) which is acceptable. However, **52 files in `src/lib/core-services/`** are empty stubs — modules that were planned but never implemented:

Key stubs in core-services:
- `epistemic-firewall/` — 7 empty files (assumption-registry, cortex-loop, evidence-grader, negative-receipt, sentinel-engine, tool-grounding, index)
- `ai-workforce/` — 3 empty files (admin-budget-routing-policy, workforce-orchestrator, index)
- `finance-os/` — 2 empty files (investment-office.service, index)
- `flagship-loops/` — 2 empty files (flagship-loop-service, index)
- `launch-readiness/` — 2 empty files (launch-readiness-engine, index)
- `architecture/god-tier-integration-engine.ts` — empty
- `security/security-posture-engine.ts` — empty
- `truth-indices/truth-index-aggregator.ts` — empty

---

## Category 3 — Type Safety Issues (P2)

### 3.1 `as any` Usage
- **68 page files** contain `as any` casts (~588 total instances)
- **2 core-service files** use `as any`:
  - `mnemosyne/context-assembler.ts` — `const db = supabase as any`
  - `security/resource-governor.ts` — object initialization cast

### 3.2 `const db = supabase as any` Pattern
This pattern bypasses TypeScript's Supabase type safety. Found in core-services and multiple pages.

---

## Category 4 — Dead Code & Unused Modules

### 4.1 Zero-Import Modules
| Path | Evidence |
|------|----------|
| `src/lib/journeys/` (2 files) | 0 imports found anywhere in codebase |
| `src/lib/constants/` (2 files) | Only 6 files import from it — could merge into design-tokens |

### 4.2 Overlapping Data Files
- `src/lib/demo-data/investment.ts` AND `src/lib/demo-data/investment.tsx` — same domain, two file extensions
- `src/lib/mock-data/` and `src/lib/demo-data/` both declare centralized mock data with overlapping domains

---

## Category 5 — Architecture Boundary Issues

### 5.1 No React in Backend (CLEAN)
Zero React imports found in `src/lib/core-services/*.ts` (non-tsx files). Architecture boundary respected.

### 5.2 Console Statements in Pages (P3)
6 page files contain `console.log/warn/error` statements. Acceptable for error handling but should use structured logging in production.

### 5.3 `src/lib/hooks/` Placement Violation (P2)
10 hooks live in `src/lib/hooks/` instead of `src/hooks/`. This violates the documented architecture where `src/lib/` is backend/service code and `src/hooks/` is the canonical hook location.

---

## Category 6 — Demo/Mock Data Integrity

### 6.1 Mock Data Not Gated (P2)
`src/lib/mock-data/index.ts` says "imported only in dev mode" but there is no runtime guard — mock data is bundled into production builds.

### 6.2 Demo Data in Admin Pages (P1)
Multiple admin pages render demo/mock data without real DB backing. Documented in SECONDARY_REFACTOR_DISCOVERIES.md as item #12.

---

## Category 7 — Edge Function Issues

### 7.1 All 84 Functions Have index.ts (CLEAN)
Only `_shared/` lacks an `index.ts`, which is correct (it's a helper module, not a deployed function).

---

## Category 8 — Documentation vs Reality Mismatches

| Doc Claim | Reality | Delta |
|-----------|---------|-------|
| "47 core-service files" (old ISS-004) | 220 files in `core-services/` | Already fixed in docs |
| "~45 canonical services" (budget) | 39 overlapping dirs between core-services and services | Within budget but services layer has 202 dirs |
| "Canary deployment ring" | Status "pending" in PlatformTruthDashboard — scaffold only | Honest labeling |

---

## Recommended Fix Plan (Priority Order)

### P0 — No remaining P0 issues (confirmed)

### P1 — Should Fix Before GA
1. **Consolidate services/core-services overlap** — 39 duplicate directory names. Verify all `services/` dirs are pure re-exports; remove any with independent logic
2. **Audit admin pages for demo data** — Identify which admin pages show mock data vs real DB queries

### P2 — Technical Debt
3. **Merge `src/lib/engine/` into `src/lib/engines/`** — Update 2 import sites
4. **Merge `src/lib/hooks/` into `src/hooks/`** — Update 53 import sites
5. **Delete `src/lib/journeys/`** — Zero consumers, dead code
6. **Merge `src/lib/mock-data/` and `src/lib/demo-data/`** — Eliminate parallel mock layers
7. **Consolidate AI directories** — Merge `ai-gateway/` and `sovereign-ai-gateway/` into `ai/`
8. **Remove `investment.tsx` duplicate** — Keep `.ts` version in demo-data
9. **Clean up 52 empty stub files in core-services** — Either implement or remove with re-export shims
10. **Continue `as any` cleanup** — 68 page files remaining (ISS-091)

### P3 — Low Priority
11. **Merge `src/lib/constants/` into design-tokens** — Only 6 consumers
12. **Replace `console.*` in pages with structured logging**
13. **Add dev-mode guard to mock-data imports**

### No Action Needed
- ThemeContext.tsx — Valid re-export shim from AppearanceContext
- PublicLayout.tsx — Valid re-export shim from layouts/
- Edge functions — All 84 have proper index.ts
- React boundary — No React imports in backend code
- Architecture compliance — 0 violations in last report

---

## Implementation Estimate

| Priority | Items | Estimated Changes |
|----------|-------|-------------------|
| P1 | 2 items | Audit + potential 39 dir consolidation |
| P2 | 8 items | ~60 files moved/merged, ~55 import path updates |
| P3 | 3 items | ~10 file edits |

All changes are refactoring and cleanup. No new features, no DB migrations, no edge function changes needed.

