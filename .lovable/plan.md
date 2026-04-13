

# SITA OS — Recommendation-to-Execution Closure + Service Unification + Flagship Discipline

## Current State (Verified)

**Already fully implemented:**
- `recommendation-loop-service.ts` (332 lines): Full lifecycle state machine (11 states), execution bindings, remediation programs/tasks, outcome verifications, learning signals, pipeline summary views
- **REX01-05** pages all exist and are routed in App.tsx:
  - `/admin/rex/intelligence` — Recommendation volume, quality scores, domain breakdown
  - `/admin/rex/approval-queue` — Pending approvals, aging, evidence gaps
  - `/admin/rex/execution` — Per-recommendation status, binding, outcomes
  - `/admin/rex/programs` — Remediation programs with linked recommendations
  - `/admin/rex/outcomes` — Post-execution verification, journey/score deltas
- **SERV01-06** pages all exist and are routed:
  - `/admin/services/ownership` — 12 domain service ownership with budget gauge
  - `/admin/services/domains` — Domain ownership detail
  - `/admin/services/route-trace` — Route-to-service traceability
  - `/admin/services/duplication` — Duplicate/shadow service audit
  - `/admin/services/canonical-actions` — Canonical action entry points
  - `/admin/services/flagship-trace` — Flagship loop traceability
- **FL01-02** pages routed: Executive board + detail view with truth rings, seed data, 4-dimension scoring
- **Flagship Loop Service** (318 lines): 5 loops seeded with truth scoring
- **Route-to-Service Inventory** (734 lines): Full action-level mapping
- **Service Ownership Registry**: 12 domains with anti-sprawl rules
- **LAUNCH02 Flagship Readiness**: Linked from launch section

## What's Missing

### 1. FL03 — Flagship Loop Prioritization Board (page doesn't exist)
The prompt requires 3 flagship boards. FL03 should show all work mapped to flagship loop impact, breadth-vs-flagship prioritization, and where engineering attention should go.

### 2. AdminCommandPalette missing all REX/SERV/FL entries
None of the 13 boards (REX01-05, SERV01-06, FL01-02) are discoverable via Cmd+K. Operators can't find them.

### 3. No grouped SubNav for REX, SERV, FL
Other board families (AIG, AIT, CN, DRS, etc.) have dedicated SubNav components. REX/SERV/FL have none.

## Implementation Plan

### Step 1 — Create FL03 Flagship Prioritization Board
**New file: `src/pages/admin/FL03FlagshipPrioritization.tsx`**
Shows:
- Per-flagship-loop work item count (linked recommendations, remediation tasks, blockers)
- Breadth vs flagship-critical work ratio
- Engineering attention allocation recommendation
- Loop-impact scoring for active recommendations
Uses existing data from flagship-loop-service and recommendation-loop-service.

### Step 2 — Wire FL03 into App.tsx
Add lazy import and route `/admin/flagship/prioritization` inside AdminShell block.

### Step 3 — Add REX/SERV/FL entries to AdminCommandPalette
Add all 14 entries (REX01-05, SERV01-06, FL01-03) to the NAV_ITEMS array with proper groups: "Recommendation Closure", "Service Architecture", "Flagship Loops".

### Step 4 — Create REXSubNav, SERVSubNav, FLSubNav components
Following the pattern of existing SubNav components (AIGSubNav, CNSubNav, etc.), create navigation helpers for each board family.

---

## Files Changed

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/pages/admin/FL03FlagshipPrioritization.tsx` | Prioritization board |
| Modify | `src/App.tsx` | Add FL03 lazy import + route |
| Modify | `src/components/admin/AdminCommandPalette.tsx` | Add 14 REX/SERV/FL entries |
| Create | `src/components/admin/REXSubNav.tsx` | REX board navigation |
| Create | `src/components/admin/SERVSubNav.tsx` | SERV board navigation |
| Create | `src/components/admin/FLSubNav.tsx` | FL board navigation |

## What Does NOT Change
- All existing REX01-05, SERV01-06, FL01-02 pages stay as-is (already fully advanced)
- recommendation-loop-service.ts stays as-is (complete)
- flagship-loop-service.ts stays as-is (5 loops seeded with scoring)
- route-to-service-inventory.ts stays as-is (734 lines, comprehensive)
- service-ownership-registry.ts stays as-is (12 domains, anti-sprawl rules)
- No database changes needed
- No new services

