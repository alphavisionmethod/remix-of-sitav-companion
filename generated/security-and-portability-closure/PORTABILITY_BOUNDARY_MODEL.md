# Portability Boundary — Canonical Model

**Source of truth:** `src/runtimes/portability-boundary-model.ts`  
**Validator:** `scripts/validation/check-portability-boundaries.ts`

## Classifications

| Classification | Meaning | Example |
|---|---|---|
| `leaf-browser-only` | Browser-only by design; lives in a leaf component or browser-leaf hook | `useReducedMotion`, `use-mobile` |
| `shared-portable` | Must remain runtime-safe; cannot touch browser globals directly | most `src/lib/*` modules |
| `shell-specific` | Belongs to a specific shell runtime | `useWindowSnap`, `useElectronBridge` |
| `adapter-routed` | Portable code that delegates runtime access to the host adapter | `useAppStatePersistence`, `use-session-restore` |

## Enforcement

`check-portability-boundaries.ts` asserts:
1. Every file in `src/hooks/`, `src/lib/`, and `src/runtimes/` has a classification entry
2. Files classified `shared-portable` contain no `window.`/`document.` references
3. Files classified `adapter-routed` import `useRuntimeHost` or `getRuntimeHostAdapter`
4. Files classified `shell-specific` are not imported from `shared-portable` modules

## What this prevents

- Accidental browser-only logic landing in shared/portable surfaces
- Multiple competing host abstractions
- Silent regression of the 4 refactored hooks
- Unclassified new hooks slipping in without an explicit decision
