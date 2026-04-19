# Runtime-Host Boundary Cleanup Plan

**Generated:** 2026-04-19
**Status:** No new adapter methods required.

## Decision

Audit confirms that the 4 hooks already routed through `useRuntimeHost()` cover the **full set of cross-tier runtime needs** in shared portable code:

- `useAppStatePersistence.ts` — scroll persistence
- `use-zero-latency.ts` — route-transition scroll restore
- `use-session-restore.ts` — session route + scroll restore
- `useSetupOrchestration.ts` — `beforeunload` subscription

The remaining 11 `window`-touching hooks are all **legitimately leaf-browser-only** — they exist to render browser shell chrome (responsive breakpoints, gestures, parallax, online indicators, OS shortcuts, realtime UI toasts). Routing them through the adapter would be:

- needless indirection (they have no SSR / SIMULATED tier rendering path)
- a drag on initial-mount latency
- a violation of the boundary model's own intent (`leaf-browser-only` is a first-class category, not a temporary state)

## Adapter surface coverage

`src/runtimes/runtime-host-adapter.ts` currently exposes:

- `subscribeBeforeUnload(handler)`
- `restoreScroll(key)`
- `persistScroll(key, position)`

No other hooks in the audit need any of these methods. **No new adapter methods will be added in this pass.**

## Future work (out of scope)

If a future tier (e.g. native shell with no DOM) renders any of the leaf-browser hooks, the closure path is:

1. Reclassify the hook from `leaf-browser-only` to `adapter-routed`.
2. Add the missing adapter method to `runtime-host-adapter.ts` + `web-host-adapter.ts` + `noop-host-adapter.ts`.
3. Refactor the hook to call `useRuntimeHost()` instead of touching the global directly.

This pattern is already proven by the 4 existing adapter-routed hooks.
