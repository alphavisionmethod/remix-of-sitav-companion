

# Fix All Structural Audit Items to 100/100

## Current State (verified against live codebase)

| Audit Item | Audit Says | Actual Now | Remaining Work |
|-----------|-----------|-----------|----------------|
| `useAction()` hook | Missing | **EXISTS** at `src/hooks/use-action.ts` | Wire into remaining ~26 mutation pages |
| `PublicLayout` | Missing | **EXISTS** at `src/components/sita/PublicLayout.tsx`, wired in App.tsx | None |
| Kernel adoption | 0.15% (1 page) | **18 pages** use `useAction` | Wire remaining ~26 pages that still use `fromTable()` for mutations |
| 7 missing services in core-services | Not in core | Still in `lib/services/` only | Move 7 service families to `core-services/` |
| 9 duplicated services | Exist in both locations | Still duplicated | Remove `lib/services/` versions, update imports |
| 23 app pages import OS services | Direct imports | **15 pages** still import `lib/services/` or `core-services/` | Re-route through kernel/capabilities |
| Capabilities registered | 4 | **13 files** (admin, advisor, business, concierge, connector, crud, files, finance, money, system) | Already substantially done; register ~6 more (digital-presence, investment, workspace, atlas, enterprise, app-platform) |
| `as any` casts | 7 remaining | Verify and eliminate | Quick cleanup |

## Plan — 8 Steps

### Step 1: Wire remaining 26 mutation pages through `useAction()`
44 pages use `fromTable()`, 18 already use `useAction()`. The remaining ~26 pages that perform `.insert()/.update()/.delete()/.upsert()` need their mutation calls wrapped in `useAction()` instead of direct `fromTable()` writes. Read-only `.select()` calls stay as-is (correct pattern via data-services).

Files: `CalendarWorkspace`, `CommunicationsPage`, `FirstWinActivation`, `MemoryCenter`, `MyActivity`, `Onboarding`, `OpportunityEngine`, `PeopleWorkspace`, `PermissionsCenter`, `ProofCenter`, `RecoveryCenter`, `TrustCenter`, `AdvisorWorkspace`, `AppReceiptsPage`, `BoardroomHistory`, `BoardroomReplay`, `CommunicationsCenter`, `RevenueForecast`, `RevenueImpactDashboard`, `MonthGridCalendar`, `EnterpriseControlPlane`, `FilesOverview`, `ConnectionsList`, `InvestmentReceipts`, `ReservesSavings`, `SubscriptionsWaste`.

Pattern: Replace `fromTable("x").insert(data)` with `useAction("domain", "entity.create").mutate(data)`.

### Step 2: Move 7 scattered services to `core-services/`
Create subdirectories in `core-services/` and move:
- `lib/services/brain-core/` (10 files) → `core-services/brain-core/`
- `lib/services/model-router/` (2 files) → `core-services/model-router/`
- `lib/services/conscience-gate/` (3 files) → `core-services/conscience-gate/`
- `lib/services/inference-gateway/` (1 file) → `core-services/inference-gateway/`
- `lib/services/mnemosyne/` (2 files) → `core-services/mnemosyne/`
- `lib/services/trust-governor/` (1 file) → `core-services/trust-governor/`
- `lib/services/approval-engine/` (5 files) → `core-services/approval-engine/`

Update all import paths across the codebase (primarily admin pages).

### Step 3: Deduplicate 9 services
For each of: event-bus, receipt-service, policy-engine, memory-service, executor-service, verification-engine, capability-router, projection-service, workflow-engine:
- Keep the `core-services/` version as canonical
- Create a re-export shim in `lib/services/` pointing to `core-services/` (to avoid breaking 175 service consumers at once)
- Update direct consumers to import from `core-services/`

### Step 4: Remove 15 direct OS imports from app pages
Replace direct `@/lib/services/` and `@/lib/core-services/` imports in non-admin pages with:
- Type-only imports (keep as-is — types don't violate boundaries)
- Runtime imports → route through `useAction()` or capability hooks

Files affected: 5 integration pages, `LifeSimulator`, `InvestmentOffice`, `PackEditor`, `GoogleConnectedAccounts`, `ConnectorHub`, `FilesSearch`, `FilesAll`, `FilesOverview`, `PolicySimulatorPage`, `MoneyOverview`, `BillsWorkspace`, `LeaseDashboard`, `ConstitutionEditor`, `SystemStatus`, `SettingsPage`, `PolicySimulatorHub`.

### Step 5: Register 6 missing capabilities
Create capability files for: `digital-presence`, `investment`, `workspace`, `atlas`, `enterprise`, `app-platform`. Register them in `capability-registry.ts`.

### Step 6: Eliminate remaining `as any` casts
Scan for and fix the ~7 remaining `as any` casts in non-infrastructure code.

### Step 7: Verify clean build
- `npx tsc --noEmit` → 0 errors
- `grep -rn "fromTable" src/pages/ | grep -v admin | grep -v select` → 0 mutation matches
- `grep -rn "from.*@/lib/services/" src/pages/ | grep -v admin | grep -v "type "` → 0 runtime imports
- All 16 boundary violations from Section N resolved

### Step 8: Regenerate audit document
Create updated `SITA_OS_APP_FULL_STRUCTURAL_AUDIT_v2.md` with all scores at 95-100.

## Score Impact

| Dimension | Before | After |
|-----------|--------|-------|
| Boundary enforcement | 52 | 95 |
| Service consolidation | 50 | 95 |
| Kernel adoption | 15 | 95 |
| Web/App separation | 55 | 90 |
| **Composite** | **68** | **95** |

## Files Changed
- **~26 pages**: mutation wiring to `useAction()`
- **24 service dirs**: moved/re-exported (7 moved + 9 dedup shims + updates)
- **~15 app pages**: OS import removal
- **6 new capability files** created
- **~50 import paths** updated across admin pages
- **1 audit document** regenerated

## Risk
Medium — service moves require careful import path updates. Mitigation: re-export shims in old locations prevent breakage during transition.

