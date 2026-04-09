

# Fix: TS2308 `DeferredSetupItem` Export Collision

## Problem
`src/packages/contracts/index.ts` line 67 (`export * from "./specialized"`) triggers TS2308 claiming `DeferredSetupItem` is exported by both `./runtime` and `./specialized`. Investigation shows the name only exists in `runtime/first-boot-provisioning.ts` — the specialized barrel has `SetupDeferredItem` (different name). This appears to be a TypeScript incremental compilation cache artifact, but it needs a definitive fix.

## Fix
In `src/packages/contracts/index.ts`, add an explicit named export for `DeferredSetupItem` from the runtime barrel **before** the specialized star-export. This tells TypeScript unambiguously which module owns the name, resolving TS2308:

**Edit `src/packages/contracts/index.ts`** — add after line 55 (`export * from "./runtime"`):
```ts
// Explicit claim to prevent TS2308 ambiguity with star-exports
export { DeferredSetupItem } from "./runtime/first-boot-provisioning";
```

This is a 1-line addition. No other files change.

## Then: Full Checklist Re-Audit
After fixing the build, I'll verify all Part IV checklist items are implemented per the previous approved plan. Based on the last implementation round, all priority items (typed data models, handoff contracts, events, services, missing pages) were created. This will be a confirmation pass.

