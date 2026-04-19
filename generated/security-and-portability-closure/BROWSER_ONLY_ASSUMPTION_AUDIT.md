# Browser-Only Assumption — Audit

**Generated:** 2026-04-19  
**Validator:** `scripts/validation/check-no-browser-trapped-shared-hooks.ts`

## Findings (pre-closure)

Four shared hooks accessed `window.*` directly without going through the canonical runtime adapter:

| Hook | Direct access | Resolution |
|---|---|---|
| `src/hooks/useAppStatePersistence.ts` | `window.scrollY`, `addEventListener('scroll')` | ✅ refactored to `useRuntimeHost()` |
| `src/hooks/use-zero-latency.ts` | `window.scrollY`, `window.scrollTo` | ✅ refactored to `useRuntimeHost()` |
| `src/hooks/use-session-restore.ts` | `window.location.pathname`, `window.scrollTo` | ✅ refactored to `useRuntimeHost()` |
| `src/hooks/useSetupOrchestration.ts` | `window.addEventListener('beforeunload')` | ✅ refactored to `useRuntimeHost()` |

## Acceptable browser-only leaves (allowlisted)

These hooks are correctly scoped to browser-leaf usage and remain direct (validator allowlist):

- `src/hooks/use-mobile.ts` — viewport-only, browser-leaf
- `src/hooks/useReducedMotion.ts` — `matchMedia`, browser-leaf
- `src/hooks/useWindowSnap.ts` — desktop window manager, shell-specific
- `src/hooks/useElectronBridge.ts` — Electron IPC, shell-specific

## Enforcement

- `check-no-browser-trapped-shared-hooks.ts` BLOCKs new direct `window.`/`document.` access in `src/hooks/**` outside the allowlist
- `check-runtime-host-abstraction.ts` BLOCKs the existence of any second host abstraction file
- `check-portability-boundaries.ts` BLOCKs files in `src/hooks/`, `src/lib/`, `src/runtimes/` lacking a classification entry in `portability-boundary-model.ts`
