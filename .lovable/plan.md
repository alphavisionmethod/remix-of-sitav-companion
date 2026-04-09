

# Fix Section H — OS Layer Reality Audit (3 Services)

## Current State

Investigation reveals:
- **brain-core**: Already canonical in `core-services/brain-core/`, exported via `lib/services/index.ts` line 19 → reachable through barrel. Has admin UI (`BrainCoreDashboard`). **Actually compliant.**
- **ModelRouter**: Already canonical in `core-services/model-router/`, exported via `lib/services/index.ts` line 90. Has admin UI via `BrainCoreDashboard`. **Actually compliant.**
- **ConscienceGate**: Canonical in `core-services/conscience-gate/` with reverse shim in `lib/services/conscience-gate/`. **BUT not exported from `lib/services/index.ts` barrel** → not reachable via `core-services/index.ts`. Also has **no dedicated admin inspection UI** (only a status line in GodTierRuntimeBoard).

## Fixes Required

### Fix 1: Export conscience-gate from `lib/services/index.ts` barrel
Add `export * from "./conscience-gate";` after the existing domain OS exports (line 22). This makes it reachable through the `core-services/index.ts` facade like brain-core and model-router.

**File**: `src/lib/services/index.ts` — add 1 line

### Fix 2: Create admin ConscienceGate inspection page
Create `src/pages/admin/ConscienceGateDashboard.tsx` with:
- Live gate verdict history (using ConscienceGate service functions)
- CritiqueLoop results display
- Evidence state + budget state panels
- Gate decision distribution (pass/caveat/block/refuse)
- Routing hints summary

This mirrors the pattern used by `BrainCoreDashboard` — demo data in demo mode, real service calls in live mode.

**File**: `src/pages/admin/ConscienceGateDashboard.tsx` — new page (~200 lines)

### Fix 3: Add route for ConscienceGate dashboard
Add route in `App.tsx` under the admin routes section.

**File**: `src/App.tsx` — add 1 route

### Fix 4: Add sidebar link for ConscienceGate
Add a link in the admin sidebar navigation to the new dashboard.

## After Fix — Audit Status

| System | Real OS Primitive? | Cross-Module? | Inspectable? | Governable? | In core-services? |
|--------|-------------------|---------------|-------------|-------------|-------------------|
| Brain (brain-core) | ✅ | ✅ | Via admin | ✅ | ✅ |
| ModelRouter | ✅ | ✅ | Via admin | ✅ | ✅ |
| ConscienceGate | ✅ | ✅ | Via admin | ✅ | ✅ |

## Files Changed
- `src/lib/services/index.ts` — 1 export line added
- `src/pages/admin/ConscienceGateDashboard.tsx` — new admin page
- `src/App.tsx` — 1 route added
- Admin sidebar component — 1 nav link added

## Verification
- `npx tsc --noEmit` → 0 errors
- All three services reachable via both `core-services/` and `lib/services/` import paths

