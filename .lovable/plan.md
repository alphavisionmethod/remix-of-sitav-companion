

## Diagnosis

User wants two things:
1. **Verify** the artifact-ownership fix from the previous loop is 100% in place on disk and deployment-ready.
2. **Update `MISSING_AUDIT.md`** (both mirrors) — the previous loop already touched it, but user wants confirmation it reflects RESOLVED state for this specific P2 item.

This is verification + targeted doc reconciliation. No behavioral code changes.

## Verification I'll do during execution

1. `ls generated/artifact-ownership-manifest.json && jq '.coveragePercent, .totalArtifacts, .withProducer, .orphanCount' generated/artifact-ownership-manifest.json` — confirm manifest exists and coverage ≥ 80%
2. `ls scripts/manifests/generate/generate-artifact-ownership-manifest.ts scripts/architecture/checks/check-artifact-ownership-coverage.ts src/lib/architecture/artifact-ownership-registry.ts` — confirm 3 new files on disk
3. `grep -E "generate:artifact-ownership|check:artifact-ownership-coverage" package.json` — confirm 2 npm scripts wired
4. `npm run check:artifact-ownership-coverage` — must PASS (≥80% floor)
5. `npm run check:manifest-truth-completeness` — confirm new metric surfaces
6. `npx tsc --noEmit` — 0 errors
7. `npm run release:readiness` — 21/21 BLOCK GREEN unchanged
8. `grep -c "Generated-artifact ownership\|artifact-ownership-manifest" public/generated/MISSING_AUDIT.md /mnt/documents/MISSING_AUDIT.md` — confirm references present
9. `grep -c "RESOLVED 2026-04-20.*artifact-ownership\|artifact-ownership.*RESOLVED" public/generated/MISSING_AUDIT.md` — confirm RESOLVED marker
10. `md5sum public/generated/MISSING_AUDIT.md /mnt/documents/MISSING_AUDIT.md` — mirrors identical

## Plan

### Step 1 — Read & verify on-disk state
Run the 10 checks above in parallel batches. Capture exact coverage %, validator stdout, gate counts, and current MISSING_AUDIT.md content for the artifact-ownership sections.

### Step 2 — Locate artifact-ownership references in `MISSING_AUDIT.md`
Read the file to find precise line ranges for:
- **Part III** (Cluster Audit) — `generated/` row
- **Part XIII** (Drift) — "Generated-artifact ownership" entry
- **Part XIV** (Fix Plan) — the P2 line item

Determine whether previous loop's edits are complete or incomplete; identify any remaining OPEN/P2 references to this specific issue.

### Step 3 — Apply targeted doc updates (only if needed)

If the previous loop already fully marked it RESOLVED, only bump the audit timestamp. Otherwise, surgically update:

| Section | Change |
|---|---|
| **Part III** Cluster Audit | `generated/` row → `TRACED → artifact-ownership-manifest.json (94% coverage, 858/913 producers mapped)` |
| **Part XIII** Drift | Move "Generated-artifact ownership" from OPEN to RESOLVED ledger; cite manifest + validator |
| **Part XIV** Fix Plan | Strike the P2 item; replace with `RESOLVED 2026-04-20 — artifact-ownership-manifest.json + check:artifact-ownership-coverage (94% coverage)` |
| **Header** | Bump revision marker |

Write to `public/generated/MISSING_AUDIT.md`, then `cp` to `/mnt/documents/MISSING_AUDIT.md`. Confirm `md5sum` identical.

### Step 4 — Final verification
- `grep -c "RESOLVED 2026-04-20" public/generated/MISSING_AUDIT.md` ≥ 2 (onboarding + artifact-ownership)
- `grep -c "artifact-ownership-manifest" public/generated/MISSING_AUDIT.md` ≥ 2
- `md5sum` mirror check identical
- `npm run release:readiness` → 21/21 BLOCK GREEN unchanged
- Emit `<lov-artifact path="MISSING_AUDIT.md" mime_type="text/markdown">` for download

## What this does NOT touch

- No edits to the manifest generator, validator, registry, or any of the 21 BLOCK gates
- No DB / RLS / edge function / auth / route / UI changes
- No `package.json` script changes (already wired)
- Only `MISSING_AUDIT.md` mirrors modified (if at all)

## Files touched

**Modified (potentially 2):**
- `public/generated/MISSING_AUDIT.md`
- `/mnt/documents/MISSING_AUDIT.md`

