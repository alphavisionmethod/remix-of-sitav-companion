

# Fix Kernel Adoption, Service Duplication & PublicLayout — Full Plan

## Problem Summary

1. **Kernel adoption at 0.15%**: 8 pages use `useAction()` (kernel path), but ~35 pages bypass it with raw `useMutation()` + direct Supabase calls
2. **Service duplication**: `core-services/` and `services/` have overlapping modules (e.g. both have `workflow-engine`, `policy-engine`, `receipt-service`, `event-bus`, `memory-service`, `approval-service`, `connector-runners`, `verification-engine`, `entity-graph`)
3. **No PublicLayout on `/`**: The `HomeRoute` at `/` renders `LandingPage` for unauthenticated users without `PublicLayout`, meaning it sits inside the global provider tree (ThemeProvider, RealityModeProvider, etc.) but not explicitly wrapped like `/login` and `/signup`

## Fix 1: Migrate Raw Mutations to `useAction()` (~35 pages)

Pages currently doing `useMutation({ mutationFn: async () => { supabase... } })` should use `useAction("domain", "capability.id", { ... })` instead, routing writes through the kernel's 12-stage canonical execution path.

**Target pages** (all files with raw `useMutation(` in `src/pages/`):
- `PolicyEditor.tsx` — 3 mutations → `useAction("system", "policy.create/toggle/delete")`
- `InboxCapture.tsx` — 1 mutation → `useAction("system", "inbox.capture")`
- `business/OpportunitiesCenter.tsx` — 3 mutations → `useAction("business", "opportunity.create/update/delete")`
- `business/QuotesWorkspace.tsx` — 3 mutations → `useAction("business", "quote.create/update/delete")`
- `files/FilesSettings.tsx` — 1 mutation → `useAction("system", "file-settings.save")`
- `admin/CN04SyncTruthCenter.tsx` — mutation → `useAction`
- `admin/CN06ConnectorDemoReview.tsx` — mutation → `useAction`
- `admin/MSA01MultiSurfaceOverview.tsx` — mutation → `useAction`
- `admin/MSA02CoreSurfaceBoundary.tsx` — mutation → `useAction`
- `admin/MSA05CompatibilityRadar.tsx` — mutation → `useAction`
- `admin/ReplayRecoveryConsole.tsx` — mutation → `useAction`
- `admin/FeatureIntakeDesk.tsx` — mutation → `useAction`
- `admin/UAO01PresenceContinuity.tsx` — mutation → `useAction`
- `admin/UAO02ConnectedDevices.tsx` — mutation → `useAction`
- `admin/PFA01ProviderFamilyRegistry.tsx` — mutation → `useAction`
- `CalendarWorkspace.tsx` — mutation → `useAction`
- `SettingsPage.tsx` — 4 direct supabase calls → wrap in `useAction` where appropriate (avatar upload, seed, GDPR export/delete)
- Remaining ~15 admin pages with raw mutations

**Pattern for each migration:**
```tsx
// BEFORE (bypasses kernel)
const createPolicy = useMutation({
  mutationFn: async () => {
    const { error } = await fromTable("policies").insert({...});
    if (error) throw error;
  },
  onSuccess: () => queryClient.invalidateQueries(...)
});

// AFTER (routes through kernel)
const createPolicy = useAction("system", "policy.create", {
  successMessage: "Policy created",
  invalidateKeys: [["policies"]],
});
```

**Capability registration**: For each new capability ID used, register a handler in the appropriate capability file (`src/lib/capabilities/system-capabilities.ts`, `business-capabilities.ts`, etc.) that performs the actual Supabase operation.

## Fix 2: Resolve Service Duplication (9 overlapping modules)

The following exist in BOTH `src/lib/core-services/` AND `src/lib/services/`:

| Service | core-services/ | services/ | Resolution |
|---------|---------------|-----------|------------|
| workflow-engine | ✅ | ✅ | `core-services/` re-exports from `services/` — make explicit, remove duplicate logic |
| policy-engine | ✅ | ✅ | Same — consolidate into `services/`, re-export |
| receipt-service | ✅ | ✅ | Same |
| event-bus | ✅ | ✅ | Same |
| memory-service | ✅ | ✅ | Same |
| approval-service | ✅ | ✅ | Same |
| connector-runners | ✅ | ✅ | Same |
| verification-engine | ✅ | ✅ | Same |
| entity-graph | ✅ | ✅ | Same |

**Resolution approach**: `core-services/index.ts` already does `export * from "@/lib/services"` (line 25), so the `services/` barrel is canonical. For each duplicate:
1. Verify `core-services/<name>.ts` and `services/<name>/index.ts` — determine which has real logic
2. Make the `core-services/` version a thin re-export: `export * from "@/lib/services/<name>"`
3. Update any imports that reference `core-services/<name>` directly to use `services/<name>` or the barrel

**7 missing OS services** mentioned in the audit — verify these exist in `services/`:
- `brain-core` ✅ (`services/brain-core/`)
- `model-router` ✅ (`services/model-router/`)
- `conscience-gate` ✅ (`services/conscience-gate/`)
- `inference-gateway` ✅ (`services/inference-gateway/`)
- `mnemosyne` ✅ (`services/mnemosyne/`)
- `trust-governor` ✅ (`services/trust-governor/`)
- `approval-engine` ✅ (`services/approval-engine/`)

All 7 are present. Update `core-services/index.ts` comment block to confirm and remove the "missing" designation.

## Fix 3: Wrap `/` Route in PublicLayout

Currently:
```tsx
<Route path="/" element={<HomeRoute />} />
```

The `HomeRoute` renders `LandingPage` for unauthenticated users but doesn't use `PublicLayout`. Fix:

```tsx
<Route path="/" element={<PublicLayout><HomeRoute /></PublicLayout>} />
```

This ensures unauthenticated visitors on `/` get the lightweight provider tree, not the full OS kernel boot.

## Execution Order

1. **PublicLayout on `/`** — 1 line change in `App.tsx` (instant fix)
2. **Service duplication cleanup** — convert 9 `core-services/*.ts` files to re-exports, update `core-services/index.ts` comment
3. **Register ~30 new capability handlers** in capability files (system, business, admin)
4. **Migrate ~35 pages** from raw `useMutation` to `useAction()`
5. **Verify 0 TS errors** after all changes

## Files Changed

- **1 updated**: `src/App.tsx` (PublicLayout wrap on `/`)
- **~9 updated**: `src/lib/core-services/*.ts` (duplicate → re-export)
- **1 updated**: `src/lib/core-services/index.ts` (comment fix)
- **~4 updated**: capability registration files in `src/lib/capabilities/`
- **~35 updated**: page files migrated from `useMutation` to `useAction`

