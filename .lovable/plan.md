

# Create `src/layouts/PublicLayout.tsx` and Deduplicate

## Current State

The architecture is **already correctly wired**:
- Public routes (`/login`, `/signup`, `/forgot-password`, `/reset-password`, `/`) use `PublicLayout` which wraps only `Suspense` — no kernel, no OS runtime
- `AuthProvider` and `ThemeProvider` are mounted above ALL routes (both public and authenticated) in the App component tree
- `SitaKernelProvider`, `OSRuntimeProvider`, `EntityContextProvider` are exclusively inside `AuthenticatedProviders` — only authenticated routes get them
- No OS providers leak into public routes

The audit wants `src/layouts/PublicLayout.tsx` as the canonical location. Currently it lives at `src/components/sita/PublicLayout.tsx`.

## What Needs to Happen

### Step 1: Create `src/layouts/PublicLayout.tsx`
Move the `PublicLayout` component to the audit-required path. The component itself is correct — it wraps children in `Suspense` only. `AuthProvider` and `ThemeProvider` are already above it in the tree (App.tsx lines 691-693), so the layout doesn't need to duplicate them.

### Step 2: Update import in `src/App.tsx`
Change line 24 from:
```
import { PublicLayout } from "@/components/sita/PublicLayout";
```
to:
```
import { PublicLayout } from "@/layouts/PublicLayout";
```

### Step 3: Convert old file to re-export shim
Change `src/components/sita/PublicLayout.tsx` to:
```typescript
export { PublicLayout } from "@/layouts/PublicLayout";
```
This prevents any stale imports from breaking.

### Step 4: Verify no duplicates
Grep confirms:
- `SitaKernelProvider` used only in `AuthenticatedProviders` (App.tsx line 670) — correct
- `OSRuntimeProvider` used only in `AuthenticatedProviders` (App.tsx line 671) — correct
- `EntityContextProvider` used only in `AuthenticatedProviders` (App.tsx line 669) — correct
- Public routes all wrap with `PublicLayout` — correct
- No OS providers in public routes — correct

### Step 5: TypeScript build verification
Run `npx tsc --noEmit` to confirm 0 errors.

## Files Changed
- `src/layouts/PublicLayout.tsx` — new canonical location (moved from components/sita)
- `src/components/sita/PublicLayout.tsx` — converted to re-export shim
- `src/App.tsx` — 1 import path updated

## Risk
Minimal — moving a file and updating one import. Re-export shim prevents any breakage.

