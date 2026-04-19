# Runtime Host Extraction — Plan & Status

**Canonical adapter:** `src/runtimes/runtime-host-adapter.ts`  
**Implementations:** `src/runtimes/web/web-host-adapter.ts`, `src/runtimes/noop/noop-host-adapter.ts`  
**Hook accessor:** `useRuntimeHost()` (React) and `getRuntimeHostAdapter()` (non-React)

## Surface

The adapter exposes only the small set of browser-only globals legitimately required by shared hooks:

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

## Selection logic

`getRuntimeHostAdapter()` reads `detectActiveRuntimeTier()`:
- `WEB_APP` | `DESKTOP_HOST` | `APPLIANCE_RUNTIME` → `webHostAdapter`
- everything else (SSR, SIMULATED, tests) → `noopHostAdapter`

## Single-abstraction guarantee

`scripts/validation/check-runtime-host-abstraction.ts` enforces:
1. The 4 refactored hooks import `useRuntimeHost`
2. **No second abstraction file exists** outside `src/runtimes/`

## Migration completed

| Hook | Before | After |
|---|---|---|
| `useAppStatePersistence` | direct `window.scrollY` | `host.getScrollY()` |
| `use-zero-latency` | direct `window.scrollTo` | `host.setScrollY()` |
| `use-session-restore` | direct `window.location` | `host.getCurrentPath()` |
| `useSetupOrchestration` | direct `addEventListener('beforeunload')` | `host.addBeforeUnload()` |

## Next portability candidates (deferred — out of scope for this closure)

None at this time. The audit identified only 4 shared hooks; all 4 are migrated.
