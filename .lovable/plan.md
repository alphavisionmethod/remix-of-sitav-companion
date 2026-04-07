

# Phase 5 Verification: Service-Layer Unification — Implementation Status

## What Already Exists (Substantially Complete)

The Phase 5 infrastructure is **~85% implemented**. Here's what's in place:

### Data Layer (Complete)
- **`service-ownership-registry.ts`** (191 lines): 12 domains mapped with `primaryService`, `dependentServices`, `routes`, `capabilities`, `launchCriticality`, `flagshipLoop`, `duplicateRisk`, `shadowServiceRisk`, and `notes`
- **`route-to-service-inventory.ts`** (488 lines): 20 flagship routes mapped with full action-level traceability — handler locations, primary/secondary services, provider deps, DB deps, customer journey keys, canonical confidence, shadow risk
- **Helper functions**: `getRoutesByFlagshipLoop()`, `getRoutesWithShadowRisk()`, `getRoutesWithLowConfidence()`, `getAllActions()`, `getDuplicateActionPatterns()`, `getDomainByKey()`, `getDomainsByFlagshipLoop()`, `getHighRiskDomains()`

### Admin Boards (All 6 SERV boards exist and are routed)
| Board | Route | Status |
|-------|-------|--------|
| SERV01 — Domain Service Ownership | `/admin/services/ownership` | Live, wired to registry |
| SERV02 — Domain Ownership Detail | `/admin/services/domains` | Live, route/action counts |
| SERV03 — Route-to-Service Trace | `/admin/services/route-trace` | Live, filterable, expandable |
| SERV04 — Service Duplication/Shadow | `/admin/services/duplication` | Live, 6 shadow patterns, risk assessment |
| SERV05 — Canonical Action Entry Points | `/admin/services/canonical-actions` | Live, canonical vs non-canonical split |
| SERV06 — Flagship Loop Traceability | `/admin/services/flagship-trace` | Live, per-loop trace scores |

### Shadow Cluster Identification (Complete)
SERV04 identifies 6 shadow patterns: summary card duplication, advisor/assistant overlap, admin board proliferation, connector/provider overlap, direct Supabase calls from pages, recommendation score aggregation. Each has severity, domain, description, and recommendation.

### Thin Re-export Services (Already Rationalized)
- `immune-controller/index.ts` → re-exports from `core-services/self-healing/immune-controller`
- `self-healing/index.ts` → re-exports from `core-services/self-healing/service`
- `observability-hub/index.ts` → thin wrapper (31 lines)

### Architecture Validation Scripts (Exist)
- `check-module-count.ts`, `check-service-sprawl.ts` — budget enforcement, sprawl detection
- PowerShell equivalents for CI

## Gaps Remaining (~15%)

### 1. Anti-Sprawl Guardrails Document
No codified rules file exists at `src/lib/services/service-registry/` for governance conventions (e.g., "no new gateway without justification", "pages must not own domain logic"). The shadow patterns in SERV04 are hardcoded but there's no formal governance ruleset.

**Fix**: Create `src/lib/services/service-registry/anti-sprawl-rules.ts` with typed rules, severity, and enforcement status. Wire into SERV04 or a new section.

### 2. Duplicate Cluster Rationalization Map
The shadow patterns describe problems but don't define the **canonical resolution** for each cluster (which service wins, which becomes adapter, which is deprecated).

**Fix**: Add a `DUPLICATE_CLUSTER_RESOLUTIONS` registry to `service-ownership-registry.ts` mapping each cluster to canonical/adapter/deprecated classification.

### 3. Route Inventory Coverage
20 routes are mapped but 678 total routes exist. The flagship loops are covered but some critical non-flagship routes (e.g., `/notification-settings`, `/connector-hub/callback`) are unmapped.

**Fix**: Add ~10 more critical route entries covering notification settings, connector callbacks, mobile surfaces, and key admin boards.

### 4. Service Directory Count vs Budget
162 service directories exist against a budget of ~45 canonical services. The registry maps 12 domains but doesn't explicitly classify which of the 162 directories are canonical vs speculative vs deprecated.

**Fix**: Add a `SERVICE_DIRECTORY_CLASSIFICATION` map classifying top service directories into canonical/supporting/speculative/deprecated.

### 5. Architecture Guardrails as Runtime Check
The anti-sprawl scripts exist in `scripts/architecture/` but aren't surfaced in Admin OS. SERV boards show static data but don't run or display architecture check results.

**Fix**: Add a summary card to SERV01 showing architecture check status (service count vs budget, sprawl threshold).

## Implementation Plan

### Step 1 — Add duplicate cluster resolution map
Add `DUPLICATE_CLUSTER_RESOLUTIONS` to `service-ownership-registry.ts` — 6 clusters (AI gateway, notifications, observability, finance, self-healing, connectors) with canonical/adapter/deprecated classifications.

### Step 2 — Add anti-sprawl governance rules
Create typed `ANTI_SPRAWL_RULES` in `service-ownership-registry.ts` — 6 rules covering gateway creation, page logic, service ownership, provider calls, naming conventions, and flagship alignment.

### Step 3 — Add service directory classification
Add `SERVICE_DIRECTORY_CLASSIFICATION` mapping the 162 directories into categories: canonical (~30), supporting (~25), speculative (~50), re-export (~10), deprecated-candidate (~47).

### Step 4 — Expand route inventory
Add ~10 more entries to `route-to-service-inventory.ts` for notification settings, connector callbacks, mobile settings, key finance routes, and recommendation execution routes.

### Step 5 — Upgrade SERV01 with budget/sprawl summary
Add service count vs budget display, directory classification breakdown, and governance rule compliance summary.

### Step 6 — Upgrade SERV04 with resolution map
Show duplicate cluster resolutions alongside shadow patterns — what's canonical, what's adapter, what's deprecated.

### Step 7 — Add data-testid attributes to all SERV boards
For Playwright proof stability.

## Files Modified/Created

| File | Change |
|------|--------|
| `src/lib/services/service-registry/service-ownership-registry.ts` | Add cluster resolutions, anti-sprawl rules, directory classification |
| `src/lib/services/service-registry/route-to-service-inventory.ts` | Add ~10 more critical route entries |
| `src/pages/admin/SERV01ServiceOwnership.tsx` | Budget/sprawl summary cards, governance compliance |
| `src/pages/admin/SERV04ServiceDuplication.tsx` | Resolution map display |
| All 6 SERV board files | Add `data-testid` attributes |

## No Database Changes Required

All data is static registry data in TypeScript files.

## Success Criteria
1. All 6 major duplicate clusters have explicit canonical/deprecated classification
2. 6 anti-sprawl governance rules are codified and visible
3. 162 service directories are classified by category
4. 30+ flagship routes are traced with service mapping
5. SERV01 shows budget compliance (162/90 — over budget, visible)
6. All SERV boards have `data-testid` attributes for Playwright

