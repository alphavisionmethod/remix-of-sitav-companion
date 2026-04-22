

# Fix Three Build Errors in Edge Function Registry and Component Tests

## Summary

Three build errors need fixing, all caused by the previous auto-generation placing entries in wrong locations or using wrong patterns.

---

## Fix 1: `primitives-coverage.test.tsx` — Named Export Mismatch

All four primitive components (`BaseCard`, `StatusBadge`, `EmptyState`, `Panel`) use **named exports**, not default exports. The test tries `mod.default || mod.BaseCard` but TypeScript correctly says `.default` doesn't exist.

**Fix**: Replace `mod.default || mod.X` with direct named imports. Change from dynamic `import()` to static imports since these are known components:

```tsx
import { BaseCard } from "@/components/primitives/display/BaseCard";
import { StatusBadge } from "@/components/primitives/status/StatusBadge";
import { EmptyState } from "@/components/primitives/feedback/EmptyState";
import { Panel } from "@/components/primitives/display/Panel";
```

Then use them directly in the render calls.

---

## Fix 2: `edge-function-owner-map.ts` — Entries Merged Into Wrong Object

Lines 66-182 contain flat `"function-name": "team"` entries that were accidentally inserted into the `TEAM_PROFILES` object (which is typed as `Record<OwnerTeam, TeamProfile>`). These entries belong **after** `TEAM_PROFILES` closes, not inside it.

**Fix**: Close `TEAM_PROFILES` at line 65 (after `"app-platform"`) and move lines 66-182 into a separate constant or merge them into the existing `EDGE_FUNCTION_OWNER_MAP` at line 186.

---

## Fix 3: `edge-function-registry.ts` — 117 Entries Inside `getCallGraphFor()` Return

The 117 auto-generated function entries (lines 628-1330) were accidentally placed inside the `getCallGraphFor()` function's fallback return (`entry?.callsInto ?? [...]`), which expects `readonly string[]` not an array of objects. These entries should be appended to the `EDGE_FUNCTION_REGISTRY` array (before the `] as const` at line 596).

**Fix**: Move all 117 entries from inside `getCallGraphFor()` into `EDGE_FUNCTION_REGISTRY` (before line 596's `] as const`). Then restore `getCallGraphFor()` to its original simple form:

```typescript
export function getCallGraphFor(name: string): readonly string[] {
  const entry = getEdgeFunction(name);
  return entry?.callsInto ?? [];
}
```

---

## Files Changed

| File | Change |
|---|---|
| `src/__tests__/components/primitives-coverage.test.tsx` | Replace dynamic imports with static named imports |
| `src/lib/backend-topology/edge-function-owner-map.ts` | Move flat entries out of `TEAM_PROFILES` into proper location |
| `src/lib/backend-topology/edge-function-registry.ts` | Move 117 entries from `getCallGraphFor()` into `EDGE_FUNCTION_REGISTRY` array |

