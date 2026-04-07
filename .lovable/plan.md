

# Enhanced SITA OS Structural Audit Report — Plan

## Problem
1. **17 build errors** — all stale cache. Every file already has correct `DEMO_` prefixes. Fix: touch all 9 files to force rebuild.
2. **Existing report at `/mnt/documents/SITA_OS_APP_FULL_STRUCTURAL_AUDIT.md`** has all 19 sections but is missing significant detail discovered in this deeper scan.

## What's Missing from Current Report

| Gap | Detail to Add |
|-----|---------------|
| **Table ownership by layer** | 513 tables exist. Report says "~486" — needs exact count and layer assignment |
| **Edge function audit** | 51 functions exist with 8 shared utilities (`auth.ts`, `cors.ts`, `rate-limit.ts`, `security-headers.ts`, `audit-logger.ts`, `logger.ts`, `validate.ts`, `zod-validate.ts`). Report mentions them but doesn't classify each by layer |
| **Full 175 service directory classification** | Report covers 16 duplicated services but 175 total directories need layer assignment |
| **Complete mutation page list** | Report says "127 pages" but actual count is **37 non-admin pages** with `.insert/.update/.delete/.upsert`. Needs exact list |
| **Proof-model package** | 7 files in `src/packages/proof-model/` — not mentioned in report |
| **Internal agent config** | 40 agent definitions, 6 councils, supervisors — not mentioned |
| **Hook layer assignment** | 77 hooks exist — which layer do they belong to? |
| **Component layer breakdown** | 327 components, 4 admin component directories — needs breakdown |
| **Kernel context hooks** | 10 exported hooks from `SitaKernelContext.tsx` (`useSitaKernel`, `useCanonicalAction`, `useSharedMemory`, `useSharedTrust`, `useEntityScoped`, `useCapabilityLease`, `useConstitution`, `useKernelStatus`, `useWorkflowRecovery`) — not documented |
| **Explicit answers to 10 top-level questions** | Report answers them implicitly but never numbers them 1-10 |
| **Engine files** | 24 engine files in `src/lib/engines/` — not classified |
| **Dual-reality system** | 18 files — needs layer audit |
| **Data services** | 29 files — needs completeness check against route families |
| **Contract package detail** | 17 packages with exact file counts now known — report has partial |
| **`as any` breakdown by area** | pages: 187, hooks: 59, lib: 415, components: 26 = 687 total (not 710) |

## Plan

### Step 1: Fix Build Errors (touch 9 files)
Touch all 9 affected files to clear stale TypeScript cache:
- `IntegrationConcierge.tsx`, `PolicyEditor.tsx`, `AdvisorRegistry.tsx`, `AppAssociationsPage.tsx`, `AppPermissionsCenterPage.tsx`, `PlaybookBuilder.tsx`, `FormsBuilder.tsx`, `RevenueGate.tsx`, `NotificationPreferences.tsx`

### Step 2: Regenerate Enhanced Report
Create `/mnt/documents/SITA_OS_APP_FULL_STRUCTURAL_AUDIT_v2.md` with all existing content plus:

**New/Enhanced Sections:**

- **Section B enhanced**: Add 513 table count, 8 edge function shared utilities, 77 hooks, 327 components, 24 engines, 18 dual-reality files, 29 data-services, 7 proof-model files, internal-agent-config package
- **Section C enhanced**: Add per-family mutation page counts
- **Section E enhanced**: Classify all 175 service directories by layer (not just the 16 duplicated ones). Group into: OS-core (should be in core-services), Domain (connectors, notifications, finance, etc.), Admin (admin-service, architecture), Infrastructure (auth, database, i18n), Speculative (digital-legacy-vault, duress-detection, etc.)
- **Section F enhanced**: Add proof-model package (7 files), 17 contract packages with exact file counts
- **Section G enhanced**: List all 10 kernel context hooks with adoption status
- **New subsection in H**: Internal agent config (40 agents, 6 councils) as OS primitive
- **New subsection in L**: Engine files (24) and dual-reality files (18) placement audit
- **Section M enhanced**: Correct `as any` count to 687 (pages:187, hooks:59, lib:415, components:26)
- **Section N enhanced**: Correct mutation page count to 37 (not 127), list all 37 files
- **Add explicit answers to all 10 top-level questions** as a dedicated sub-section after Section A
- **Section E enhanced**: Complete edge function layer classification for all 51 functions
- **Section Q enhanced**: Add data-services completeness check (29 services vs 22+ route families)

### Step 3: Verify Build
Run `npx tsc --noEmit` to confirm zero errors.

## Files Changed
- 9 page files touched (force rebuild)
- 1 new file: `/mnt/documents/SITA_OS_APP_FULL_STRUCTURAL_AUDIT_v2.md` (~1200 lines)

