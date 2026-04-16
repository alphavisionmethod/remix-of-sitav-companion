# SITA OS — Wrapper Map

> Generated: 2026-04-16

## Active Wrappers

No temporary compatibility wrappers are currently active. All path corrections were made directly in the canonical consumer files.

## Wrapper Policy

If future refactors require temporary wrappers (re-export shims for backward compatibility), they should:

1. Be placed in the old file location
2. Re-export from the new canonical location
3. Include a `@deprecated` JSDoc tag with removal date
4. Be tracked in this document
5. Be removed within 2 sprint cycles

## Example Wrapper Pattern

```typescript
// @deprecated — Remove after 2026-05-01. Use new path directly.
// Old: src/lib/engine/some-engine.ts
// New: src/lib/engines/some-engine.ts
export { SomeEngine } from '../engines/some-engine';
```

---

*No wrappers exist. All migrations were direct path corrections.*
