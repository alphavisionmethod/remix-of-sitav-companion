

# Fix All Structural Audit Items to 100/100

## Current State (live codebase verified)

| Audit Item | Status Now | Remaining |
|-----------|-----------|-----------|
| `useAction()` hook | EXISTS, used by 45 pages | **60 non-admin mutation pages** still bypass kernel |
| `PublicLayout` | EXISTS, wired in App.tsx | **Done** |
| 7 scattered services | ALL 7 still in `lib/services/` | **Move all 7 to `core-services/`** |
| 9 duplicated services | ALL 9 still duplicated | **Deduplicate all 9** |
| 10 app pages import `lib/services/` | ALL 10 still violating | **Re-route through kernel** |
| 12 app pages import `core-services/` | ALL 12 still violating | **Re-route through kernel** |
| 6 missing capabilities | ALL 6 still missing | **Create and register** |
| `as any` casts | 0 found | **Done** |
| Contracts | Production-grade | **Done** |
| Admin isolation | Production-grade | **Done** |

## Plan — 5 Steps

### Step 1: Wire remaining 60 mutation pages through `useAction()`

45 pages already use `useAction`. 60 non-admin pages still do direct `fromTable().insert/update/delete/upsert` mutations. Each needs its mutation calls replaced with `useAction("domain", "entity.verb")`.

Read-only `.select()` calls via data-services stay as-is (correct pattern).

### Step 2: Move 7 scattered services to `core-services/`

Move these directories from `lib/services/` to `lib/core-services/`:
- `brain-core/` (10 files)
- `model-router/` (2 files)
- `conscience-gate/` (3 files)
- `inference-gateway/` (1 file)
- `mnemosyne/` (2 files)
- `trust-governor/` (1 file)
- `approval-engine/` (5 files)

Leave re-export shims in old locations to prevent import breakage, then update all direct consumers.

### Step 3: Deduplicate 9 services

For: event-bus, receipt-service, policy-engine, memory-service, executor-service, verification-engine, capability-router, projection-service, workflow-engine:
- Keep `core-services/` version as canonical
- Replace `lib/services/` version with a re-export shim pointing to `core-services/`
- Update direct consumers

### Step 4: Remove 22 direct OS imports from app pages

Replace runtime imports from `@/lib/services/` and `@/lib/core-services/` in these 22 non-admin pages with `useAction()` or capability hooks:

**10 pages importing `lib/services/`**: LifeSimulator, ActionsApprovals, ConnectionDetail, IntegrationsCatalog, ProviderDetail, ConnectionsList, InvestmentOffice, PackEditor, GoogleConnectedAccounts, ConnectorHub

**12 pages importing `core-services/`**: PolicySimulatorHub, SystemStatus, FilesSearch, FilesAll, FilesOverview, PolicySimulatorPage, BillsWorkspace, MoneyOverview, InvestmentOffice, LeaseDashboard, ConstitutionEditor, SettingsPage

### Step 5: Register 6 missing capabilities

Create capability files and register in `capability-registry.ts`:
- `digital-presence-capabilities.ts`
- `investment-capabilities.ts`
- `workspace-capabilities.ts`
- `atlas-capabilities.ts`
- `enterprise-capabilities.ts`
- `app-platform-capabilities.ts`

## Score Impact

| Dimension | Before | After |
|-----------|--------|-------|
| Boundary enforcement | 52 → 65 | **95** |
| Service consolidation | 50 | **95** |
| Kernel adoption | 15 → 42 | **95** |
| Web/App separation | 55 → 80 | **90** |
| Runtime correctness | 35 → 55 | **95** |
| **Composite** | **68** | **95** |

## Files Changed
- **~60 pages**: mutation wiring to `useAction()`
- **7 service dirs**: moved to `core-services/` with re-export shims
- **9 service dirs**: deduplicated with re-export shims
- **22 app pages**: OS import removal
- **6 capability files**: created and registered
- **~80 import paths**: updated

## Risk
Medium — service moves require careful import updates. Re-export shims in old locations prevent breakage during transition.

