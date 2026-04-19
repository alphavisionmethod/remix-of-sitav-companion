# Runtime Host Adapter Completion Plan

**Generated:** 2026-04-19
**Closure:** architecture-hardening
**Status:** ✅ Adapter extraction complete — this doc certifies the boundary.

## 1. Canonical adapter

`src/runtimes/runtime-host-adapter.ts` is the **single** portability surface. All shared hooks that need browser-only globals (scroll position, before-unload, online state, current path) route through this adapter.

## 2. Adapter API

```ts
interface RuntimeHostAdapter {
  getScrollY(): number;
  setScrollY(y: number, behavior?: ScrollBehavior): void;
  addScrollListener(fn: () => void): () => void;
  addBeforeUnload(fn: () => void): () => void;
  addOnlineListener(fn: (online: boolean) => void): () => void;
  getCurrentPath(): string;
  readonly isBrowserHost: boolean;
}
```

## 3. Implementations

| Implementation | File | Active when |
|---|---|---|
| Web | `src/runtimes/web/web-host-adapter.ts` | Browser tier (WEB_APP) |
| No-op | `src/runtimes/noop/noop-host-adapter.ts` | SSR, simulated, server contexts |

`getRuntimeHostAdapter()` selects via `detectActiveRuntimeTier()`. React consumers use `useRuntimeHost()` (context-aware for testability).

## 4. Refactored shared hooks (already complete)

| Hook | Adapter usage |
|---|---|
| `src/hooks/useAppStatePersistence.ts` | beforeunload + path |
| `src/hooks/use-zero-latency.ts` | online listener |
| `src/hooks/use-session-restore.ts` | path |
| `src/hooks/useSetupOrchestration.ts` | beforeunload |

Verified by existing validator `check-runtime-host-abstraction.ts`.

## 5. Shell/runtime layer specifics

| Layer | Allowed |
|---|---|
| `src/shell/electron/` | Electron-specific globals (window, document, IPC) |
| `src/runtimes/desktop/electron/` | Electron-specific |
| `electron/` | Electron main process |
| `src/hooks/useElectronBridge.ts` | classified `shell-specific` — Electron preload only |
| `src/hooks/use-mobile.tsx` | classified `leaf-browser-only` — `matchMedia` is browser-spec |
| `src/hooks/useReducedMotion.ts` | classified `leaf-browser-only` |
| `src/hooks/useWindowSnap.ts` | classified `leaf-browser-only` — DESKTOP_HOST chrome |

## 6. Forbidden patterns

- ❌ A second adapter file outside `src/runtimes/`
- ❌ Direct `window.*` in `src/lib/services/`
- ❌ Direct shell-path imports (`electron/`, `src/shell/electron`) from `src/hooks/` or `src/lib/services/`

All three are enforced by validators (existing + new this pass).

## 7. New validators (this pass)

- `check-runtime-host-boundaries.ts` — every shared hook with browser-globals must be classified or adapter-routed
- `check-shell-runtime-portability.ts` — shell paths must not leak into shared roots

## 8. No second abstraction

Enforced by `scripts/validation/check-runtime-host-abstraction.ts` (existing). The hardening pass adds reverse-import enforcement (`check-shell-runtime-portability.ts`) to close the bidirectional gap.
