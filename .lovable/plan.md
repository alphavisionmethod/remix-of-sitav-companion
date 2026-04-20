

## Diagnosis

User wants `MISSING_AUDIT.md` expanded so every one of the 15 mandated parts is present, deeply detailed, and grounded in real filesystem evidence. Current file is ~850 lines (per prior summary) — target is a 3,000–5,000 line, table-heavy, deeply technical document with no missing or shallow sections.

## Verification I'll do during execution

1. Read current `public/generated/MISSING_AUDIT.md` end-to-end, then run `grep -c "^## Part"` to confirm which of the 15 parts exist and which are stubs.
2. Re-inventory the repo for fresh evidence (counts may have changed):
   - `src/lib/` subdir count + per-cluster line totals
   - `src/pages/**` page count + cross-check vs `<Route>` declarations in `src/App.tsx`
   - `supabase/functions/` (count + classify into the 6 edge-function roles)
   - `supabase/migrations/` (count + RLS coverage spot-check)
   - `electron/*.cjs` vs `_layout.cjs` registry domains
   - `os/image-builder/`, `os/scripts/`, `.github/workflows/os-build-iso.yml`
   - `scripts/architecture/checks/` (validator count vs the 21 BLOCK gates)
   - `generated/` and `public/generated/` artifact freshness (mtimes)
   - `src/lib/internal-agents/` (40-agent registry verification)
   - First-use screens vs the 29-screen master spec
3. Read the truth files: `PROJECT_TREE_AUDIT.md`, `MASTER_REMEDIATION_BLUEPRINT_v2.md`, `MASTER_REMEDIATION_VERIFICATION_v2.md`, `check-os-release-readiness.ts`, route-plane-map, app-plane-map.

## Plan — Expand `MISSING_AUDIT.md` to a true principal-engineer audit

### Step 1 — Reconnaissance batch (parallel `ls`/`wc`/`grep`/`find`)
Build a fresh evidence base: cluster sizes, route inventory, edge function classification, migration count, validator count, generated-artifact mtimes, electron module count, OS daemon list.

### Step 2 — Targeted file reads
Read the 12-15 most authoritative files (release aggregator, route registry, plane maps, electron layout, internal-agents registry, top 5 generated reports) to anchor every claim.

### Step 3 — Rewrite `MISSING_AUDIT.md` (single Python heredoc → both locations)
Each of the 15 parts will be expanded to the depths below. **Target: 3,500–5,000 lines.**

| Part | Required content | Target lines |
|---|---|---|
| I. Executive Reality Summary | Solid / Weak / Missing / Overstated / Duplicated tables + critical-path narrative | 150 |
| II. Full Repository Topology | Per-directory table: directory · purpose · canonical status · owner · risks · missing proof, covering ~25 top-level dirs and ~40 `src/lib/` clusters | 400 |
| III. File Cluster Audit | 12 clusters, each with sub-tables for: exists / wired / partial / dead / missing / fixes | 600 |
| IV. End-to-End Wiring Audit | 8 traces (auth, files, AI invocation, connector refresh, app install, onboarding, release evidence, watchdog) — each as ASCII diagram + breakpoint table | 350 |
| V. Integration Audit | 13 providers, each with: state · token flow · refresh · health · kill-switch · proof · gaps | 350 |
| VI. Database & Policy Audit | Table-by-table coverage for the 11 canonical tables + RLS gaps + missing indexes + missing migrations | 300 |
| VII. Runtime / Electron / OS Audit | Per-module .cjs audit, preload exposure matrix, OS daemon table, watchdog escalation, recovery flow | 300 |
| VIII. AI / Advisor / Autonomy Audit | Provider registry, model routing matrix, receipt coverage, fallback chain, autonomy ladder L0-L6, simulation paths | 300 |
| IX. App Platform / SDK / Windowing Audit | Type A/B/C/D matrix, manifest schema, install lifecycle, Native Bridge, SDK hooks, window isolation | 250 |
| X. Admin / Operator / Support Audit | 12-domain admin IA, dashboards, kill-switch UX, support bundle, runbook linkage | 250 |
| XI. Onboarding / Journey Audit | All 29 screens × {implemented, telemetry, branching, copy adaptation, resume} | 300 |
| XII. Validation / Evidence / Release Audit | All 21 BLOCK gates + their validator + artifact + line in aggregator + freshness | 300 |
| XIII. Contradictions, Drift, Legacy | Phantom folders verified absent, stale generated artifacts (mtime evidence), duplicate paths, dead validators | 200 |
| XIV. Exact Fix Plan | P0/P1/P2/P3 grouped — each fix: title · problem · files · new artifacts · wiring · validator · proof · rollback | 500 |
| XV. 30/60/90 Day Plan | Critical path Gantt-style ASCII + parallel workstreams + owner suggestions | 200 |

### Step 4 — Mirror & verify
- Write to `/mnt/documents/MISSING_AUDIT_v2.md` (preserves v1 for diff) AND overwrite `public/generated/MISSING_AUDIT.md`.
- `md5sum` confirms `/mnt/documents/MISSING_AUDIT.md` (overwrite) ≡ `public/generated/MISSING_AUDIT.md`.
- `grep -c "^## Part "` returns 15.
- `wc -l` ≥ 3,500.
- Spot-check 8 random claims against filesystem.

### Step 5 — Emit artifact tag for download
```
<lov-artifact path="MISSING_AUDIT.md" mime_type="text/markdown"></lov-artifact>
```

## What this does NOT touch

- No code, validators, registries, edge functions, migrations, or generated JSON.
- No changes to the 21 BLOCK gates or any release pipeline.
- No edits anywhere except `/mnt/documents/MISSING_AUDIT.md` and `public/generated/MISSING_AUDIT.md`.

## Verification after approval

```bash
wc -l public/generated/MISSING_AUDIT.md /mnt/documents/MISSING_AUDIT.md
md5sum public/generated/MISSING_AUDIT.md /mnt/documents/MISSING_AUDIT.md
grep -c "^## Part " public/generated/MISSING_AUDIT.md           # 15
grep -E "src/lib/(policies|sync|proof|execution|eventing|notifications)/" public/generated/MISSING_AUDIT.md  # only in proof-of-absence context
npm run release:readiness                                        # 21/21 BLOCK GREEN (unchanged)
```

