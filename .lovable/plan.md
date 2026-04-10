

# Audit: Ultra-Efficient Intelligence Architecture — Full Check

## Status: 95% Clean — 3 Issues Found

### What's Fully Verified and Working

**Backend Layers (10/10 + pipeline)**
All 12 files in `src/lib/intelligence-architecture/` contain real logic, no stubs:
- Signal Intake (13 sources, 6 routes, novelty scoring)
- Asset Generation (11 sources, TTL, invalidation triggers)
- Pattern Extraction (12 types, fingerprint similarity, privacy classification)
- Differential Reasoning (delta detection, materiality scoring, 4 actions)
- Domain Packet Compiler (9 domains, freshness, compression ratio)
- Reuse Decision Engine (4 modes, stakes-aware, differential-integrated)
- Escalation Engine (weighted scoring, 4 tiers)
- Efficiency Scoring (10 metrics, weighted composite)
- Outcome Economics Engine (14 categories, reasoning path analysis, value benchmarks)
- Cross-Tenant Generalization (privacy gating, anonymization, eligibility checks)
- Pipeline Orchestrator (wires all layers via `processSignal()`)

**Compute Governance (7/7 files)**
All in `src/lib/compute-governance/`: model routing (4 cost classes), budget policy (envelope system with forecasting), context compression (8 methods), margin protection (11 anomaly types), mission cost tracker, plan entitlements (5 tiers + 9 add-ons + fair use).

**UI Screens (11/11)**
All registered in `AdminRoutes.tsx` at routes a20–a30.

**Wiring**
- `budget-gate.ts` → `ai-capability-client.ts` → `check-ai-budget` edge function → `check_ai_budget_policies` DB function
- Barrel exports in `index.ts` for both modules
- Demo data in `admin-intelligence.ts` (185 lines)

---

## 3 Issues to Fix

### Issue 1: Duplicate Outcome Economics — Two Competing Implementations

**`efficiency-scoring.ts`** contains `OutcomeEconomicsReport` + `computeOutcomeEconomics()` + `OutcomeRecord` type.
**`outcome-economics-engine.ts`** contains `OutcomeEconomicsResult` + `evaluateOutcomeEconomics()` + `OutcomeCategory` type.

These are NOT duplicates — they serve different purposes (batch reporting vs single-outcome evaluation). However, the naming overlap is confusing and the `efficiency-scoring.ts` version is an older pattern that should be refactored to delegate to `outcome-economics-engine.ts`.

**Fix**: Refactor `efficiency-scoring.ts` to import and use types/functions from `outcome-economics-engine.ts` for outcome economics, keeping only the efficiency scoring logic in that file. Update barrel export in `index.ts`.

### Issue 2: Duplicate Intelligence Dashboard — `IntelligenceEfficiencyBoard` vs `AIEfficiencyScoreboard`

`src/pages/admin/IntelligenceEfficiencyBoard.tsx` (558 lines, route `/admin/intelligence-efficiency`) overlaps heavily with `src/pages/admin/intelligence/AIEfficiencyScoreboard.tsx` (route `/admin/intelligence/efficiency`). Both show efficiency scores, outcome economics, and reuse metrics.

**Fix**: Remove `IntelligenceEfficiencyBoard.tsx` (the older, monolithic page), update its route in `AdminRoutes.tsx` to redirect to `/admin/intelligence/efficiency`, and remove the lazy import. The newer `AIEfficiencyScoreboard` is more focused and properly organized within the intelligence screen family.

### Issue 3: `AnonymizedPattern` in `efficiency-scoring.ts` Duplicates Cross-Tenant Types

`efficiency-scoring.ts` defines `AnonymizedPattern` (lines 169-180) which overlaps with `GeneralizedPattern` in `cross-tenant-generalization.ts`. The barrel export exposes both.

**Fix**: Remove `AnonymizedPattern` from `efficiency-scoring.ts` and update any references to use `GeneralizedPattern` from `cross-tenant-generalization.ts`. Update barrel export.

---

## Changes Summary

| File | Action |
|------|--------|
| `src/lib/intelligence-architecture/efficiency-scoring.ts` | Remove `OutcomeEconomicsReport`, `computeOutcomeEconomics()`, `OutcomeRecord`, and `AnonymizedPattern`. Keep only `EfficiencyScore`, `computeEfficiencyScore()`, and `OutcomeType`. |
| `src/lib/intelligence-architecture/index.ts` | Update barrel exports — remove duplicate types, ensure clean single-source exports |
| `src/pages/admin/IntelligenceEfficiencyBoard.tsx` | Delete file (duplicate of newer AIEfficiencyScoreboard) |
| `src/routes/AdminRoutes.tsx` | Remove `IntelligenceEfficiencyBoard` import, redirect `/admin/intelligence-efficiency` → `/admin/intelligence/efficiency` |
| Any files importing from the old `IntelligenceEfficiencyBoard` or removed types | Update imports |

