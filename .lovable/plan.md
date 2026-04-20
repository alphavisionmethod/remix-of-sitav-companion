
## Diagnosis

The audit observation is structurally accurate: only ~10 docs are mirrored to `public/generated/`, but the project has 459 evidence artifacts (markdown audits + JSON manifests + reports across `docs/`, `generated/`, `mnt/documents/`). The in-app document viewer can only fetch what's served from `public/`, so today it sees a small fraction.

This is a real surfacing gap — not just a doc claim. We need a **real, enforced mirror pipeline** that:
1. Selects the canonical set of "publicly viewable" evidence artifacts
2. Mirrors them into `public/generated/` deterministically
3. Produces a typed index so the in-app viewer can list/search them
4. Has a BLOCK-tier gate enforcing the mirror stays in sync (no drift)

## Strategy — additive, deterministic, zero behavior change to existing gates

### Step 1 — Mirror selection policy (`scripts/architecture/lib/public-mirror-policy.ts`)
Single source of truth declaring which artifact classes get mirrored:
- All `MISSING_AUDIT*.md`, `PROJECT_TREE_AUDIT*.md`, `MASTER_REMEDIATION*.md` (already partially mirrored)
- All `generated/*.json` manifests (routes, services, capabilities, connector-catalog, evidence-graph, etc.)
- All `docs/architecture/audits/*.md`
- All `docs/architecture/registry/*.yaml`
- Explicit denylist: secrets, internal scratch, `node_modules`, `*.lock`

### Step 2 — Mirror generator (`scripts/manifests/generate/generate-public-artifact-mirror.ts`)
Walks the policy, copies matching files into `public/generated/artifacts/<category>/<file>`, preserving relative structure. Idempotent. Skips unchanged files (md5 compare) so it doesn't churn git.

### Step 3 — Public artifact index (`public/generated/artifact-index.json`)
Typed manifest the in-app viewer reads: `{ totalArtifacts, categories: [{ name, count, files: [{ path, sizeBytes, lastModified, sha256 }] }] }`. Generated alongside the mirror.

### Step 4 — In-app viewer integration (`src/lib/artifacts/`)
- `src/lib/artifacts/types.ts` — `PublicArtifact`, `ArtifactCategory` types
- `src/lib/artifacts/loadArtifactIndex.ts` — fetches `/generated/artifact-index.json`
- `src/lib/artifacts/loadArtifact.ts` — fetches an individual mirrored artifact by path
- Pure data-layer; no UI changes. Existing viewer components import from here.

### Step 5 — BLOCK-tier enforcement gate (`scripts/architecture/checks/check-public-artifact-mirror.ts`)
Asserts:
1. Every artifact matched by the policy exists in `public/generated/artifacts/` with matching content hash
2. `public/generated/artifact-index.json` exists, parses, and references only present files
3. No drift: count in policy === count in index === count of files on disk under `public/generated/artifacts/`
4. Mirror count meets minimum threshold (≥ 50, well above the current ~10)

Add as **gate #22** to `check-os-release-readiness.ts` aggregator (BLOCK tier). This is the only roster change.

### Step 6 — Audit reconciliation
Mark in all 4 audit mirrors: "Public artifact surfacing — mirror coverage" → **RESOLVED 2026-04-20** with file refs. Preserve byte-identical mirror parity.

## What this does NOT touch
- Zero changes to existing 21 BLOCK gates (just adds a 22nd).
- Zero changes to existing connector / onboarding / evidence systems.
- No migrations, no RLS, no auth, no new routes.
- No UI component edits — only the data layer the viewer already calls.
- The 10 already-mirrored files stay where they are; we add to them.

## Files touched

**New (~8):**
- `scripts/architecture/lib/public-mirror-policy.ts`
- `scripts/manifests/generate/generate-public-artifact-mirror.ts`
- `scripts/architecture/checks/check-public-artifact-mirror.ts`
- `src/lib/artifacts/types.ts`
- `src/lib/artifacts/loadArtifactIndex.ts`
- `src/lib/artifacts/loadArtifact.ts`
- `src/lib/artifacts/index.ts`
- `public/generated/artifact-index.json` (auto-generated)

**Modified (5):**
- `scripts/architecture/checks/check-os-release-readiness.ts` (+1 gate registration → 22 BLOCK gates)
- `public/generated/MISSING_AUDIT.md` + `/mnt/documents/MISSING_AUDIT.md` (RESOLVED markers)
- `public/generated/MISSING_AUDIT_v2.md` + `/mnt/documents/MISSING_AUDIT_v2.md` (RESOLVED markers)

**Auto-mirrored (~50+):**
- New files copied under `public/generated/artifacts/{audits,manifests,registry,reports}/...`

## Verification after approval

```bash
# Generator runs and produces mirror + index
npx tsx scripts/manifests/generate/generate-public-artifact-mirror.ts

# Mirror count well above 10 (target ≥ 50)
ls -R public/generated/artifacts | grep -E '\.(md|json|yaml)$' | wc -l

# New BLOCK gate passes
npx tsx scripts/architecture/checks/check-public-artifact-mirror.ts        # 0 errors

# Master readiness now 22/22 BLOCK green
npm run release:readiness

# TypeScript clean
npx tsc --noEmit                                                            # 0 errors

# Audit mirror parity preserved
md5sum public/generated/MISSING_AUDIT.md /mnt/documents/MISSING_AUDIT.md     # identical
md5sum public/generated/MISSING_AUDIT_v2.md /mnt/documents/MISSING_AUDIT_v2.md  # identical
```

Result: `public/generated/` becomes a real, indexed, drift-enforced mirror of the 459-artifact evidence corpus; the in-app viewer can enumerate and load any mirrored artifact via a typed data layer; a new BLOCK-tier gate prevents future regression — without touching any of the existing 21 gates' logic or any UI component.
