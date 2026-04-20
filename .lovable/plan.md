

## Diagnosis

`MISSING_AUDIT.md` flags as P2: **459 JSON artifacts in `generated/` but only a subset have a declared producer in any manifest.** This is a real ownership-traceability gap — when a generated artifact breaks, drifts, or gets stale, there's no canonical way to know which script produced it, who owns it, or which CI gate consumes it.

This is a structural governance fix, not a behavioral change. The goal: produce a **complete on-disk producer map** for every JSON in `generated/`, wire it into a new BLOCK-eligible WARN-tier validator, and surface it in `MANIFEST_REGISTRY` so every artifact has owner + producer + consumer + validator.

## Verification I'll do during execution

1. `ls generated/**/*.json | wc -l` — confirm the 459 count
2. `cat src/lib/truth-manifests/manifest-registry.ts | head -100` — see current registry shape & coverage
3. `grep -rn "writeJsonOutput\|writeFileSync.*generated/" scripts --include="*.ts" | head -50` — discover all producers
4. `cat scripts/architecture/lib/utils.ts` — see the canonical write helper(s)
5. `ls scripts/architecture/checks/check-manifest-truth-completeness.ts` — review the existing closure-map gate
6. `cat generated/deployment-gap-closure/manifest-truth-closure-map.json` — see existing partial map
7. `cat scripts/architecture/checks/check-os-release-readiness.ts | grep -c "BLOCK"` — confirm 21 BLOCK gates baseline

## Strategy: Producer-discovery scanner + canonical artifact-ownership manifest + validator

Don't hand-author 459 registry entries (brittle, drift-prone). Instead, **discover producers automatically** by scanning every `scripts/**/*.ts` for `writeJsonOutput`/`writeFileSync` calls targeting `generated/`, then emit a canonical manifest that's regenerated every CI run.

### Step 1 — Producer-discovery scanner

New: `scripts/manifests/generators/generate-artifact-ownership-manifest.ts`

Scans all `scripts/**/*.ts` for write calls into `generated/`, extracts the literal output path, infers the producer (script file path + npm script name from `package.json` if mapped), and emits:

```
generated/artifact-ownership-manifest.json
```

Shape per entry:
```ts
{
  artifact: "generated/<path>.json",
  producer: "scripts/<path>.ts",
  npmScript: "generate:<name>" | null,
  owner: "<inferred from path segment>",
  consumers: ["scripts/<check>.ts", ...],   // gates that read this file
  declaredInRegistry: boolean,                 // is this in MANIFEST_REGISTRY?
  lastWrittenAt: <mtime>
}
```

Also produces a coverage summary: `{ totalArtifacts, withProducer, withoutProducer, orphans, coveragePercent }`.

### Step 2 — Consumer-discovery (reverse map)

Same scanner also greps every `scripts/architecture/checks/**/*.ts` for `readJsonSafe`/`readFileSync` references to each artifact, populating the `consumers` array. Artifacts with zero consumers are flagged as **orphan candidates** for future cleanup (warn-tier, not block).

### Step 3 — Canonical artifact-ownership registry (typed)

New: `src/lib/architecture/artifact-ownership-registry.ts`

Hand-curated overlay for the **non-discoverable** cases (artifacts written by edge functions, OS build scripts, or external tools). The runtime merge order is:
1. Auto-discovered entries from the scanner (truth)
2. Hand-curated overlay entries (for things the scanner can't see)
3. `MANIFEST_REGISTRY` entries (for the ~30 already-declared canonical manifests)

Emits a unified typed map keyed by artifact path.

### Step 4 — New WARN-tier validator

New: `scripts/architecture/checks/check-artifact-ownership-coverage.ts`

Asserts:
1. Every `generated/**/*.json` on disk has an entry in `artifact-ownership-manifest.json` (≥ 95% coverage warns; < 80% errors)
2. Every entry's `producer` script exists on disk
3. Every entry has a non-empty `owner`
4. No producer writes to a path it doesn't declare in the manifest

Wired into `package.json` as `check:artifact-ownership-coverage` and added to the WARN suite (NOT the 21 BLOCK gates — keeps mandatory count unchanged at 21).

### Step 5 — Backfill the high-value declarations into `MANIFEST_REGISTRY`

For the top ~50 most-consumed artifacts (the ones referenced by ≥2 BLOCK gates), promote them from auto-discovered to first-class `MANIFEST_REGISTRY` entries with explicit `validator`, `authority: "authoritative"`, and `owner` fields. This satisfies the existing `manifest-truth.test.ts` invariants.

### Step 6 — Wire into release readiness summary

Update `scripts/architecture/checks/check-manifest-truth-completeness.ts` to read the new `artifact-ownership-manifest.json` and report producer-coverage % alongside the existing manifest-truth metric. Existing 21 BLOCK gates untouched.

### Step 7 — Update `MISSING_AUDIT.md` (both mirrors)

- **Part III** Cluster Audit — mark `generated/` as fully traced
- **Part XIII** Drift — move "Generated-artifact ownership" from OPEN to RESOLVED with link to the new manifest
- **Part XIV** Fix Plan — strike the P2 item, add `RESOLVED 2026-04-20 — see artifact-ownership-manifest.json + check:artifact-ownership-coverage`

## What this does NOT touch

- No changes to any of the 459 generators (their output paths are read, not changed)
- No changes to the 21 BLOCK gates or their mandatory count
- No DB / RLS / edge function / auth changes
- No `App.tsx`, route, or UI changes
- No `tsconfig`, `vite.config`, or alias changes
- `MANIFEST_REGISTRY` shape unchanged (only entries added)

## Files touched

**New (3):**
- `scripts/manifests/generators/generate-artifact-ownership-manifest.ts`
- `scripts/architecture/checks/check-artifact-ownership-coverage.ts`
- `src/lib/architecture/artifact-ownership-registry.ts`

**Auto-generated (1):**
- `generated/artifact-ownership-manifest.json` (produced by the new generator on first run)

**Modified (4):**
- `package.json` — add `generate:artifact-ownership` and `check:artifact-ownership-coverage` scripts
- `src/lib/truth-manifests/manifest-registry.ts` — backfill top ~50 high-value entries
- `scripts/architecture/checks/check-manifest-truth-completeness.ts` — surface new coverage metric
- `public/generated/MISSING_AUDIT.md` + `/mnt/documents/MISSING_AUDIT.md` — mark RESOLVED

## Verification after approval

```bash
ls generated/**/*.json 2>/dev/null | wc -l                                # ~459
npm run generate:artifact-ownership                                       # produces manifest
cat generated/artifact-ownership-manifest.json | jq '.coveragePercent'    # ≥ 95
npm run check:artifact-ownership-coverage                                 # PASS
npx tsc --noEmit                                                          # 0 errors
npm run release:readiness                                                 # 21/21 BLOCK GREEN unchanged
md5sum public/generated/MISSING_AUDIT.md /mnt/documents/MISSING_AUDIT.md  # identical
grep -c "RESOLVED 2026-04-20" public/generated/MISSING_AUDIT.md           # ≥ 1
```

Result: Every generated artifact has a discoverable producer + owner + consumer chain, drift is detectable by CI, and the 21 BLOCK gates remain green.

