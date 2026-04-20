

## Reality check

**Real project: ownership system already built and enforced.** ✅
- `src/lib/backend-topology/edge-function-owner-map.ts` — single source of truth, 186 entries with team + primary contact + escalation + Slack + runbook + kill-switch + reviewer codeowners
- `generated/edge-function-ownership.json` + `public/generated/edge-function-ownership.json` — generated manifest, **100% coverage / 186 of 186 / 13 teams**
- `scripts/manifests/generate/generate-edge-function-ownership-manifest.ts` — generator
- `scripts/architecture/checks/check-edge-function-ownership-completeness.ts` — completeness gate, `ok: true`, 0 orphans / 0 phantoms / 0 metadata violations
- Registered in `check-os-release-readiness.ts` line 311

The "185 / no central manifest" claim is **stale**. Real count is 186 (audit caught it at 185), and the central manifest exists at `generated/edge-function-ownership.json`.

**However, the user explicitly asks for `supabase/functions/_owners.json`** — the conventional Supabase-colocated location. That file does not exist. Adding it closes the literal request and gives the manifest a co-located home next to the functions themselves (useful for `supabase functions deploy` workflows and any reviewer reading the functions tree).

## Plan (default mode — colocated mirror + gate extension)

### 1. Generator emits a third mirror at `supabase/functions/_owners.json`
Edit `scripts/manifests/generate/generate-edge-function-ownership-manifest.ts`:
- Add `supabase/functions/_owners.json` to the `targets` array.
- Same JSON schema (no divergence — single content hash across all 3 mirrors).
- The `_` prefix means it's already in the `SHARED_DIRS` skip-set used by the disk-walker, so it won't be mistaken for a function.

### 2. Completeness gate asserts the colocated mirror exists + matches
Edit `scripts/architecture/checks/check-edge-function-ownership-completeness.ts`:
- Extend `manifestArtifacts` block with a third entry `colocated` pointing at `supabase/functions/_owners.json`.
- Assert MD5 parity across all 3 mirrors (canonical, public, colocated).
- Same BLOCK level — any drift fails the gate.

### 3. Run generator + gate to materialize the file and prove green
Single npm run to emit the new mirror and re-run the BLOCK gate.

### 4. Sync MISSING_AUDIT.md mirrors
Patch the matching row in §2 of all 6 audit mirrors:
> RESOLVED 2026-04-20 — central ownership manifest exists at 3 mirrors (`generated/`, `public/generated/`, `supabase/functions/_owners.json`). 186 functions, 100% coverage, 13 owner teams. Source: `src/lib/backend-topology/edge-function-owner-map.ts`. Enforced by BLOCK gate `check-edge-function-ownership-completeness` (registered line 311 of `check-os-release-readiness.ts`) — asserts coverage, MD5 parity across all 3 mirrors, zero orphans/phantoms.

## Files

**Edited (3):**
- `scripts/manifests/generate/generate-edge-function-ownership-manifest.ts` — add 3rd target
- `scripts/architecture/checks/check-edge-function-ownership-completeness.ts` — add MD5 parity for 3rd mirror
- 6 audit doc mirrors (sync row + narrative)

**Created (1):**
- `supabase/functions/_owners.json` — written by generator

## Out of scope
- No new owner data (already 100%)
- No new gate registration in master aggregator (gate already registered)
- No edits to `edge-function-owner-map.ts` content

