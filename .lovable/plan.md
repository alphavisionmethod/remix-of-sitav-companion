

# SITA OS — Admin Pages Domain Barrel Organization

## What Exists
- 287 flat admin pages in `src/pages/admin/*.tsx`
- 15 subdirectories in `src/pages/admin/` (architecture, cloud, modules, etc.)
- `src/admin/pages/index.ts` is an empty placeholder
- Routes import directly from `@/pages/admin/*` — these stay untouched

## What Gets Created

Using the established barrel re-export pattern (no file moves, no import rewrites), create **domain-grouped barrel files** under `src/admin/pages/` that map the 287+ flat pages into their canonical groupings.

### New Admin Page Barrels (15 files)

| File | Contents (lazy-exportable references) |
|------|---------------------------------------|
| `src/admin/pages/home/index.ts` | AdminDashboard, AdminOperationsHub, MissionControlHome |
| `src/admin/pages/ai/index.ts` | All AI*, AIG*, AIT*, Advisor*, BrainCore*, GoogleProviderFamily* (~45 pages) |
| `src/admin/pages/runtime/index.ts` | AND*, APL*, DWE*, UAO*, MSA*, MC authority/control pages, DRS*, NSS* (~45 pages) |
| `src/admin/pages/operations/index.ts` | AR*, ActionLineage*, AlertTriage*, Delivery*, Fleet*, Launch*, Release*, Replay*, Runtime*, System*, Workflow*, RevenueAutopilot* (~25 pages) |
| `src/admin/pages/intelligence/index.ts` | CAI01-CAI15 (~15 pages) |
| `src/admin/pages/integrations/index.ts` | CN*, Connector*, Integration*, ISA*, PFA* (~25 pages) |
| `src/admin/pages/launch/index.ts` | LaunchHonesty*, LT01-LT07, RuntimeRealityValidation, GeneratedTruth* (~10 pages) |
| `src/admin/pages/governance/index.ts` | ComputeGovernance*, Conscience*, Audit*, Policy*, Proof*, Truth*, PlatformMaturity*, Persistence* (~12 pages) |
| `src/admin/pages/strategic/index.ts` | Outcome*, Benchmark*, CostToConfidence*, Decay*, Intelligence*, Operator*, Portfolio*, Quality*, Reasoning*, TimeToTruth*, ValueRisk*, SRE03* (~15 pages) |
| `src/admin/pages/security/index.ts` | Security*, SEC01, SEC02 (~4 pages) |
| `src/admin/pages/architecture/index.ts` | CanonicalChain*, ChangeImpact*, CorePersistence*, CoreServiceMigration*, Dependency*, Domain*, Feature*, SERV* (~12 pages) |
| `src/admin/pages/support/index.ts` | Incident*, Communication*, Builder*, Founder*, HQ*, Team*, User* (~7 pages) |
| `src/admin/pages/verification/index.ts` | SRE01-SRE08 (except SRE03), Compositor*, Contract* (~9 pages) |
| `src/admin/pages/reality-audit/index.ts` | Reality*, Mock*, Simulated* (~7 pages) |
| `src/admin/pages/fleet/index.ts` | FL01-FL03, FCC01-FCC12, ECO*, OS01, SYS01, KernelDashboard (~20 pages) |

### Additional Admin Infrastructure (3 files)

| File | Purpose |
|------|---------|
| `src/admin/hooks/index.ts` | Placeholder barrel for admin-specific hooks |
| `src/admin/routes/index.ts` | Re-export of `@/routes/AdminRoutes` |
| `src/admin/state/index.ts` | Placeholder barrel for admin state management |

### Updated Files (3 files)

| File | Change |
|------|--------|
| `src/admin/pages/index.ts` | Replace placeholder with barrel that re-exports all 15 domain barrels |
| `src/lib/architecture/directory-organization-map.ts` | Add 15 new admin page domain mappings |
| `src/lib/architecture/ia-governance.ts` | Add `src/pages/admin/` to deprecated paths list |

## Total: ~21 new files, 3 modified files

## What This Does NOT Do
- Does not move any files
- Does not change AdminRoutes.tsx imports
- Does not break the build
- Purely additive barrel layer

