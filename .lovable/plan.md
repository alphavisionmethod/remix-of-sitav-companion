

## Diagnosis

The audit's claim is **partially out of date but structurally real**:

- `src/App.tsx` actually has **19 `<Route>` lines** today (not 14), but most routing is genuinely delegated into 13 nested shell files in `src/routes/*.tsx` (apps-routes, business-routes, money-routes, etc.) plus 4 dynamic generators (`AdminRoutes`, `OwnerRoutes`, `MobileRoutes`, etc.).
- A `generated/route-manifest.json` **does exist** (811 routes) — but its generator (`scripts/manifests/generate/generate-route-manifest.ts`) **only regexes `src/App.tsx`**. It does NOT walk the 13 nested shells, so the 811 figure is misleading and the file is internal-only — never mirrored to `public/generated/`.
- The audit specifically asks for `public/generated/routes.json` — a **flat, externally-consumable truth file** that probes, sitemap generators, and the route-topology gate can read at runtime.
- No npm script wires this; no validator enforces it.

This is a real artifact-completeness gap, not just a doc drift.

## Strategy

Three additive deliverables, zero behavior change to any existing route or shell:

### Step 1 — Real recursive route inventory builder

Replace the regex-only `generate-route-manifest.ts` with a true multi-source walker that emits a flat `generated/routes.json`:

- Parse `src/App.tsx` for top-level `<Route>` JSX
- Recursively parse every file in `src/routes/*.tsx` for `<Route>` JSX (the 13 shell files)
- Cross-reference each route against `src/lib/architecture/route-plane-map.ts` to attach `plane` and `runtime_tier`
- Cross-reference against existing `route-manifest.json` ownerDistribution for `owner`
- Emit canonical shape: `{ path, component, plane, runtimeTier, owner, source }`
- Also emit a top-level summary `{ totalRoutes, byPlane, byOwner, byRuntimeTier, generatedAt, version }`

Write to **both**:
- `generated/routes.json` (internal)
- `public/generated/routes.json` (external probes)

### Step 2 — Validator + drift gate

New: `scripts/architecture/checks/check-routes-inventory-completeness.ts`

WARN-tier (does NOT join BLOCK list per zero-behavior-change constraint). Asserts:
1. `public/generated/routes.json` exists and is fresh (regenerated within last 7 days)
2. Both mirrors are byte-identical
3. Route count ≥ 100 (sanity floor — actual is ~800)
4. Every entry has non-empty `path`, `component`, `plane`
5. No duplicate `path` values across all sources

Emit `generated/routes-inventory-completeness-report.json`.

### Step 3 — Wire into manifest registries + npm scripts

- Add to `src/lib/manifests/manifest-registry.ts`: entry for `routes.json` with producer = `generate-route-manifest`, consumer = `route-topology probes / external sitemap`.
- Add to `src/lib/ci/validator-gate-map.ts`: classify `check-routes-inventory-completeness` as `warn` (consumer: `architecture-hygiene`).
- `package.json` scripts:
  ```json
  "generate:routes-inventory": "npx tsx scripts/manifests/generate/generate-route-manifest.ts",
  "check:routes-inventory-completeness": "npx tsx scripts/architecture/checks/check-routes-inventory-completeness.ts"
  ```

### Step 4 — Update both audits

In `MISSING_AUDIT.md` and `MISSING_AUDIT_v2.md` (and their `public/generated/` mirrors):
- Mark Item #5 "Route inventory" → **RESOLVED 2026-04-20**
- Mark "Top file gap #2 routes.json" → **RESOLVED**
- Update Part XIV fix-plan P1.2 line to RESOLVED with file references
- Bump audit timestamps

## What this does NOT touch

- No changes to any actual route, shell, lazy import, or `App.tsx` registration order
- No changes to the 21 BLOCK gates or `REQUIRED_GATES`
- No DB / RLS / edge function / auth changes
- Existing `route-manifest.json` consumers keep working (we keep the field shape backward-compatible and just add the new `routes.json` flat file)

## Files touched

**New (1):**
- `scripts/architecture/checks/check-routes-inventory-completeness.ts`

**Modified (5):**
- `scripts/manifests/generate/generate-route-manifest.ts` (extend to walk nested shells + emit flat `routes.json` to both mirrors)
- `package.json` (1 new script; 1 renamed alias)
- `src/lib/manifests/manifest-registry.ts` (register routes.json)
- `src/lib/ci/validator-gate-map.ts` (classify new validator)
- `public/generated/MISSING_AUDIT.md` + `/mnt/documents/MISSING_AUDIT.md` + `public/generated/MISSING_AUDIT_v2.md` + `/mnt/documents/MISSING_AUDIT_v2.md` (mark RESOLVED)

**Auto-generated (3):**
- `generated/routes.json`
- `public/generated/routes.json`
- `generated/routes-inventory-completeness-report.json`

## Verification after approval

```bash
npm run generate:routes-inventory
jq '.totalRoutes, .byPlane, .byRuntimeTier' public/generated/routes.json   # ≥ 100, populated
md5sum generated/routes.json public/generated/routes.json                  # identical
npm run check:routes-inventory-completeness                                # PASS
npm run check:validator-gate-coverage                                      # still 100%
npm run release:readiness                                                  # 21/21 BLOCK GREEN unchanged
npx tsc --noEmit                                                           # 0 errors
md5sum public/generated/MISSING_AUDIT.md /mnt/documents/MISSING_AUDIT.md   # identical
md5sum public/generated/MISSING_AUDIT_v2.md /mnt/documents/MISSING_AUDIT_v2.md  # identical
```

Result: a real, on-disk, externally-consumable flat route truth file exists at `public/generated/routes.json`, the generator walks all nested shells (not just `App.tsx`), a CI gate prevents staleness/drift, and both audits reflect RESOLVED — all without touching a single live route.

