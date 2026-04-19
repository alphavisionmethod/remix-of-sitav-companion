# Browser Global Assumption Audit

**Generated:** 2026-04-19
**Closed by:** prior Security & Portability closure (Phase 2 of this pass = no-op + verify)

## Live scan result

`grep -l "window\\.\|document\\.\|navigator\\." src/hooks/*.{ts,tsx}` returned **11 hooks**.

All 11 are present in `src/runtimes/portability-boundary-model.ts::PORTABILITY_CLASSIFICATIONS`:

| Hook | Boundary | Rationale |
|---|---|---|
| `src/hooks/use-mobile.tsx` | `leaf-browser-only` | `matchMedia` for responsive breakpoint |
| `src/hooks/useReducedMotion.ts` | `leaf-browser-only` | `matchMedia('prefers-reduced-motion')` |
| `src/hooks/useWindowSnap.ts` | `leaf-browser-only` | DESKTOP_HOST chrome only |
| `src/hooks/use-online-status.ts` | `leaf-browser-only` | `navigator.onLine` + online/offline events |
| `src/hooks/use-realtime-notifications.ts` | `leaf-browser-only` | UI toast bridge |
| `src/hooks/useGlobalShortcuts.ts` | `leaf-browser-only` | `window` keydown listener |
| `src/hooks/useWallpaperParallax.ts` | `leaf-browser-only` | mouse parallax — DOM only |
| `src/hooks/useOSRuntime.tsx` | `leaf-browser-only` | OS runtime selector |
| `src/hooks/useOfflineStore.ts` | `leaf-browser-only` | localStorage + IndexedDB by design |
| `src/hooks/use-gesture-engine.ts` | `leaf-browser-only` | pointer/touch — DOM-bound |
| `src/hooks/useElectronBridge.ts` | `shell-specific` | preload IPC bridge — DESKTOP_HOST only |

**Total classified:** 31 (all 11 above + 20 additional pre-classified entries)
**Total `leaf-browser-only` allowlist:** auto-derived from `LEAF_BROWSER_HOOK_ALLOWLIST` in the same model.

## Validator wiring

- `scripts/validation/check-no-browser-trapped-shared-hooks.ts` — already enforces the allowlist (181 BLOCK gates).
- `scripts/validation/check-no-browser-globals-in-portable-code.ts` — **NEW** (this pass) — extends enforcement beyond `src/hooks/` into `src/lib/services/` to prevent regression in portable services.

## No further refactor required

Per the closure plan: "expectation: zero refactors needed; all 11 are legit leaf-browser primitives." The audit confirms this — every `window`-touching hook is intentionally scoped to a browser-rendering shell and explicitly classified.
