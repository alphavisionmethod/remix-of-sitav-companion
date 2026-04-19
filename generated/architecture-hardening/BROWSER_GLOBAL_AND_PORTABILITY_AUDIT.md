# Browser Global and Portability Audit

**Generated:** 2026-04-19
**Closure:** architecture-hardening
**Inheritance:** Extends `generated/architectural-cleanup/BROWSER_GLOBAL_ASSUMPTION_AUDIT.md`

## 1. Canonical truth source

`src/runtimes/portability-boundary-model.ts` — every shared module that touches runtime-specific APIs is classified as one of:

- `leaf-browser-only` — legitimate browser leaf, scoped
- `shared-portable` — must work in any tier
- `shell-specific` — tied to one shell (Electron / Ubuntu native)
- `adapter-routed` — accesses runtime via canonical `runtime-host-adapter`

## 2. Current portability status (verified)

| Boundary | Count | Status |
|---|---|---|
| `leaf-browser-only` | 3 hooks (use-mobile, useReducedMotion, useWindowSnap) | ✅ Classified |
| `shell-specific` | 1 hook (useElectronBridge) | ✅ Classified |
| `adapter-routed` | 4 hooks (useAppStatePersistence, use-zero-latency, use-session-restore, useSetupOrchestration) | ✅ Refactored |
| `shared-portable` | All other hooks | ✅ No browser globals |

Total classified: 11/11 window-touching hooks. **Zero unclassified violations.**

## 3. New validator (this pass)

**`check-runtime-host-boundaries.ts`** (BLOCK) — scans every file in `src/hooks/`. For each file that touches `window.*`, `document.*`, `navigator.*`, `localStorage`, or `sessionStorage`, asserts that the file is either:

1. classified in `PORTABILITY_CLASSIFICATIONS`, OR
2. in `LEAF_BROWSER_HOOK_ALLOWLIST`, OR
3. imports `useRuntimeHost` / `getRuntimeHostAdapter`.

Any unclassified shared hook with browser-global access fails BLOCK.

## 4. Companion validator

**`check-shell-runtime-portability.ts`** (BLOCK) — verifies that shell-specific paths (`electron/`, `src/runtimes/desktop/electron`, `src/shell/electron`) are NOT imported from shared roots (`src/hooks/`, `src/lib/services/`).

## 5. Existing canonical adapter

`src/runtimes/runtime-host-adapter.ts` — the **single** portability surface. Implementations:
- `src/runtimes/web/web-host-adapter.ts` (real browser)
- `src/runtimes/noop/noop-host-adapter.ts` (SSR / simulated)

No second abstraction permitted (enforced by `check-runtime-host-abstraction`).

## 6. Cross-references

- `generated/architectural-cleanup/BROWSER_GLOBAL_ASSUMPTION_AUDIT.md` — original full scan
- `generated/security-and-portability-closure/PORTABILITY_BOUNDARY_HEALTH.md` — portability closure
- `scripts/validation/check-no-browser-trapped-shared-hooks.ts` (existing)
- `scripts/validation/check-runtime-host-abstraction.ts` (existing)
- `scripts/validation/check-no-browser-globals-in-portable-code.ts` (existing)
- `scripts/validation/check-runtime-host-boundaries.ts` (NEW this pass)
- `scripts/validation/check-shell-runtime-portability.ts` (NEW this pass)
