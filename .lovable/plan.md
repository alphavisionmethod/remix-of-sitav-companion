
User wants the **cross-tier capability matrix** completed in code so programmatic gates stop relying on hard-coded lookups. The `feature-runtime-tier-registry` is referenced widely but only partial. Goal: make it the single source of truth and make `TierGate`/`useCapability`/runtime checks resolve through it without fallbacks.

## Investigation needed first (read-only)

I need to read these to scope the fix precisely:
1. `src/runtimes/feature-runtime-tier-registry.ts` — see what's registered vs missing
2. `src/runtimes/runtime-tier-model.ts` — canonical types
3. `src/runtimes/runtime-context.tsx` — `useFeatureRuntimeTier`, `useRuntimeTier`, `useCapability`
4. Grep for hard-coded tier checks: `process.env.ELECTRON`, `window.electron`, `navigator.userAgent` matches outside `runtime-detection.ts`, and inline `tier === "..."` comparisons
5. `src/runtimes/runtime-capability-matrix.ts` (referenced in PRODUCT_REALITY_TIERS.md)
6. Existing CI gate `scripts/architecture/checks/check-feature-tier-coverage.ts` if present
7. `TierGate.tsx` usages to find which `featureId`s are referenced but unregistered

## Plan

### Part 1 — Complete the registry (single source of truth)

- Audit every `<TierGate featureId="...">` and `useFeatureRuntimeTier("...")` call site → produce a complete list of feature IDs in use
- Audit every `useCapability("...")` call site → same
- For each missing ID, add a registry entry with: `id`, `name`, `description`, `tierAvailability` (per-tier `supported|simulated|fallback|prohibited|roadmap`), `fallback` text, `owner`, `riskTier`, `capabilityClass`
- Replace any remaining hard-coded tier logic with registry lookups
- Add a `resolveCapability(featureId, activeTier)` resolver in `src/runtimes/runtime-capability-matrix.ts` that is the **only** way callers determine availability

### Part 2 — Kill hard-coded gates

- Replace inline `tier === "WEB_APP"` style checks with `isFeatureSupportedOn(featureId, tier)` from the resolver
- Components affected (likely): things importing from `runtime-context` directly with literal tier comparisons; any `if (window.electron)` outside the detection module
- Update `TierGate` to derive `requireTier` automatically from the registry when the prop is omitted (currently optional but used inconsistently)

### Part 3 — CI gate (BLOCK-tier)

Add `scripts/architecture/checks/check-cross-tier-capability-matrix.ts`:
1. Scan source for all `featureId="..."` and `useFeatureRuntimeTier("...")` / `useCapability("...")` arguments
2. Assert every referenced ID exists in the registry
3. Assert every registry entry declares all 4 tiers (no missing tier coverage)
4. Assert no `tier === "X"` literal comparisons exist outside `src/runtimes/`
5. Emit `generated/cross-tier-capability-matrix-report.{json,md}`
6. Wire into `check-os-release-readiness.ts` as gate #22 (BLOCK)

### Part 4 — Generated truth artifact

- Generate `src/runtimes/generated/cross-tier-capability-matrix.generated.ts` from the registry at build time (so admin dashboards + audits can render the full matrix without re-deriving)
- Surface it in the existing admin runtime tier dashboard (read-only table: feature × tier → status)

### Part 5 — Audit doc update

- Update `MISSING_AUDIT.md` (and `/mnt/documents/` mirror) to mark this item RESOLVED 2026-04-20 with evidence pointers (registry path, CI gate path, report path)
- Update `PROJECT_TREE_AUDIT.md` if it lists tier governance gates
- Update `MASTER_REMEDIATION_VERIFICATION_v2.md` to add gate #22

## Files

**Edited:**
- `src/runtimes/feature-runtime-tier-registry.ts` (add missing entries)
- `src/runtimes/runtime-capability-matrix.ts` (canonical resolver)
- `src/components/runtime/TierGate.tsx` (auto-derive requireTier)
- 1–10 component files removing inline tier literals (count after audit)
- `scripts/architecture/checks/check-os-release-readiness.ts` (register gate #22)
- `MISSING_AUDIT.md`, `/mnt/documents/MISSING_AUDIT.md`
- `PROJECT_TREE_AUDIT.md`, `MASTER_REMEDIATION_VERIFICATION_v2.md` (reference new gate)

**Created:**
- `scripts/architecture/checks/check-cross-tier-capability-matrix.ts`
- `src/runtimes/generated/cross-tier-capability-matrix.generated.ts`
- `generated/cross-tier-capability-matrix-report.json` (build output)
- `generated/CROSS_TIER_CAPABILITY_MATRIX_REPORT.md` (build output)
- (optional) `src/pages/admin/ai-runtime/CrossTierCapabilityMatrixBoard.tsx` if not already present

## Out of scope

- Zero changes to marketing site / strategy doc
- Zero changes to existing 21 BLOCK gates' logic (only add #22)
- No new runtime tiers — strictly the existing 4-tier model

## Order of execution (default mode)

1. Read registry + grep call sites + grep hard-coded literals
2. Add missing registry entries (largest single edit)
3. Add canonical resolver
4. Remove hard-coded literals from components
5. Add CI gate + generated artifact
6. Wire into release aggregator as gate #22
7. Run gate locally, confirm green
8. Update audit docs with RESOLVED markers + evidence pointers
