
## Diagnosis

The audit gap: 459 generated artifacts exist under `generated/**` but there is no **directed producer→consumer ownership graph** that lets stale-output detection work end-to-end. Today:

- ✅ `generated/artifact-ownership-manifest.json` exists (producer-side coverage, ≥95% target via `check-artifact-ownership-coverage.ts`)
- ✅ `generated/manifest-truth-dashboard.json` tracks freshness/staleness per artifact (7-day threshold)
- ✅ `check-manifest-truth-completeness.ts` runs WARN-level governance
- ❌ **No consumer side** — nothing maps which scripts/components/edge-functions *read* each artifact
- ❌ **No directed edges** — can't answer "if `routes-manifest.json` goes stale, what downstream artifacts/UI/gates break?"
- ❌ **No transitive staleness** — when a producer changes, downstream consumers aren't auto-flagged stale
- ❌ **No BLOCK gate** asserting the graph is complete and acyclic

Same shape as the evidence graph (nodes + edges + completeness gate), but for build-time artifacts instead of runtime evidence.

## Plan — wire producer→consumer ownership graph end-to-end

### 1. Consumer scanner
Create `scripts/architecture/generate/scan-artifact-consumers.ts`:
- Walks `scripts/**/*.ts`, `src/**/*.{ts,tsx}`, `supabase/functions/**/*.ts`, `os/**/*.sh`
- Detects reads of `generated/**/*.json` and `public/generated/**/*.json` via:
  - `readJsonSafe("generated/...")` / `JSON.parse(fs.readFileSync("generated/..."))`
  - `fetch("/generated/...")` / `import.meta.glob("/generated/...")`
  - String-literal references to `generated/<name>.json`
- Emits `generated/artifact-consumer-scan.json` with `{ artifact, consumers: [{ path, kind, line }] }`

### 2. Graph builder
Create `scripts/architecture/generate/generate-artifact-ownership-graph.ts`:
- Joins `artifact-ownership-manifest.json` (producers) ⊕ `artifact-consumer-scan.json` (consumers)
- Joins `manifest-truth-dashboard.json` (freshness) for staleness propagation
- Emits `generated/artifact-ownership-graph.json`:
  ```json
  {
    "nodes": [{ "id": "routes-manifest.json", "producer": "scripts/...", "owner": "architecture", "freshness": "fresh|aging|stale", "lastGeneratedAt": "..." }],
    "edges": [{ "from": "service-ownership.json", "to": "routes-manifest.json", "relation": "consumed-by", "consumerKind": "script|component|edge-function|shell" }],
    "transitivelyStale": ["downstream-artifact.json"],
    "orphanProducers": [],
    "orphanConsumers": [],
    "cycles": []
  }
  ```
- Computes **transitive staleness**: if A is stale and B consumes A, B is flagged `transitively-stale`
- Detects cycles (should be zero)

### 3. BLOCK gate #30 `check-artifact-ownership-graph`
Create `scripts/architecture/checks/check-artifact-ownership-graph.ts`:
- Asserts `artifact-ownership-graph.json` exists and is fresh (<24h)
- Asserts ≥95% of nodes have at least one consumer OR are explicitly marked terminal (e.g., dashboards, audit reports)
- Asserts zero cycles
- Asserts zero orphan producers (producer exists but artifact missing on disk)
- Asserts `transitivelyStale.length === 0` for any artifact in the **release-critical set** (the 21 BLOCK gate inputs)
- Emits `generated/artifact-ownership-graph-report.json`
- Wire into `MANDATORY_BLOCK_GATES` in `check-os-release-readiness.ts` as gate #30 (right after `recovery-boot-evidence`)

### 4. Strengthen freshness signal
Extend `check-manifest-truth-completeness.ts` (currently WARN-only) to additionally surface `transitivelyStale` count from the new graph — still WARN-tier, no behavior change to existing exit codes.

### 5. Admin surface (read-only)
Create `src/components/admin/ArtifactOwnershipGraphCard.tsx` and mount on the existing `/admin/governance` (or nearest existing governance route) showing:
- Total nodes / edges / orphan producers / orphan consumers / transitively stale count
- Top 10 most-consumed artifacts (hubs)
- Top 10 stale artifacts with downstream blast radius
- Loaded from `public/generated/artifact-ownership-graph.json` (mirrored by existing `mirror-generated-to-public` step)

### 6. NPM scripts + CI wiring
Add to `package.json`:
- `generate:artifact-consumers` → runs scanner
- `generate:artifact-ownership-graph` → runs builder (depends on producer manifest + consumer scan + freshness dashboard)
- `check:artifact-ownership-graph` → runs BLOCK gate

Add the two `generate:*` commands to the existing `prebuild`/`generate:all` chain so the graph regenerates on every build.

### 7. Audit doc update (all 6 mirrors)
Patch the row "Producer-to-consumer ownership graph for the 459 artifacts" in:
- `public/generated/MISSING_AUDIT.md`
- `public/generated/MISSING_AUDIT_v2.md`
- `public/generated/artifacts/audits/MISSING_AUDIT.md`
- `public/generated/artifacts/audits/MISSING_AUDIT_v2.md`
- `/mnt/documents/MISSING_AUDIT.md`
- `/mnt/documents/MISSING_AUDIT_v2.md`

Replace status with **RESOLVED 2026-04-20** marker citing the consumer scanner, graph builder, BLOCK gate #30, and admin surface. Verify byte-identical via md5sum across the 6 mirrors.

## Files

**Created (5):**
- `scripts/architecture/generate/scan-artifact-consumers.ts`
- `scripts/architecture/generate/generate-artifact-ownership-graph.ts`
- `scripts/architecture/checks/check-artifact-ownership-graph.ts`
- `src/components/admin/ArtifactOwnershipGraphCard.tsx`
- `generated/artifact-ownership-graph-report.json` (auto-emitted on first run)

**Edited (4):**
- `scripts/architecture/checks/check-manifest-truth-completeness.ts` (+ transitive-staleness surfacing, WARN only)
- `scripts/architecture/checks/check-os-release-readiness.ts` (+ gate #30)
- `package.json` (+ 3 npm scripts, wire into prebuild)
- 6× audit mirrors

**Mounting:**
- One existing admin governance page receives `<ArtifactOwnershipGraphCard />` (read-only widget)

## What this does NOT touch

- Zero changes to existing 29 BLOCK gates' logic
- Zero changes to `artifact-ownership-manifest.json` producer side (already at ≥95%)
- Zero changes to `manifest-truth-dashboard.json` shape
- Zero schema changes (graph is build-time JSON, not a DB table)
- Zero changes to any of the 459 artifact producers themselves
