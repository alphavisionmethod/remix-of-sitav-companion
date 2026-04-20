

## Diagnosis

The audit's claim is structurally correct, the numbers are slightly off:

**Real state on disk:**
- **185 validators** in `scripts/architecture/checks/check-*.ts` (audit said 183 — close enough)
- **~140 unique gate ids** wired into `REQUIRED_GATES` in `check-os-release-readiness.ts` (BLOCK tier)
- **2 WARN buckets** (`MOBILE_WARN_GATES`, `ADMIN_AI_ENGINEER_WARN_GATES`) — both currently empty arrays
- **135 validator scripts have no consumer** in the master aggregator (neither BLOCK nor WARN)
- **`src/lib/ci/ci-gate-registry.ts` has only 36 entries** — 152 validators are not registered there either

The audit's "21 BLOCK" figure is stale legacy framing from `MASTER_REMEDIATION_VERIFICATION_v2.md`; the real BLOCK count is ~140. But the **substantive gap is real**: 135 validator scripts run nowhere, surface nowhere, and silently rot. They're advisory in name but invisible in fact.

The fix: build a **canonical Validator-to-Gate Map** that classifies every validator script as `block`, `warn`, `advisory`, `disabled`, or `archived`, wire all advisory validators into a new WARN bucket the aggregator reads (without changing BLOCK semantics), and add a CI gate that prevents any new validator from being added without a declared consumer.

## Strategy

Three deliverables, all additive, zero behavior change to existing BLOCK gates:

### Step 1 — Validator classification registry (typed, on disk)

New: `src/lib/ci/validator-gate-map.ts`

A typed array of every `check-*.ts` script with declared:
```ts
{
  validator: string,           // "check-foo"
  gateId: string,              // "foo"
  classification: "block" | "warn" | "advisory" | "disabled" | "archived",
  consumer: string,            // "release-readiness" | "deployment-gap-suite" | "warn-ratchet" | "advisory-only"
  bucket?: string,             // optional WARN bucket name
  rationale: string,           // why this classification
}
```

Hand-curated from the diff between disk validators and `REQUIRED_GATES`. Defaults sensibly: anything currently in `REQUIRED_GATES` → `block`. Anything in `run-all-deployment-gap-gates.ts` → `warn` in `deployment-gap` bucket. Everything else → `advisory` in `architecture-hygiene` bucket.

### Step 2 — Auto-discovery + drift validator

New: `scripts/manifests/generate/generate-validator-gate-map.ts`

Scans `scripts/architecture/checks/check-*.ts` on disk, cross-references the typed registry, and emits:
```
generated/validator-gate-map.json
```

Per entry: validator path, gateId, classification, consumer, declaredInRegistry, lastModifiedAt, hasReportArtifact (does `generated/<gate>-report.json` exist).

Coverage summary: `{ totalValidators, classified, unclassified, blockCount, warnCount, advisoryCount, orphanCount, coveragePercent }`.

New: `scripts/architecture/checks/check-validator-gate-coverage.ts`

WARN-tier validator (does **not** join BLOCK list). Asserts:
1. Every `check-*.ts` on disk has an entry in the validator-gate-map (≥ 95% target, ≥ 80% floor)
2. Every classified `block` entry's gateId appears in `REQUIRED_GATES`
3. Every classified `warn` entry's gateId appears in a declared WARN bucket
4. No validator is `archived` while still living in `scripts/architecture/checks/` (must be moved to `archive/`)
5. No `disabled` entry exists without a kill-switch reference

### Step 3 — Surface advisory validators in the aggregator

Modify `scripts/architecture/checks/check-os-release-readiness.ts`:
- Read `validator-gate-map.json`
- Add a new `ADVISORY_GATES` ingestion loop (mirrors existing `MOBILE_WARN_GATES` pattern) that surfaces every `advisory`-classified gate's report status in the readiness summary as warnings, NEVER errors
- Output adds new sections: `## Advisory gates (N)` and `## Validator coverage` showing the map % to the readiness summary
- BLOCK verdict logic untouched — `verdict` still derived only from `REQUIRED_GATES` errors

### Step 4 — npm script wiring

Add to `package.json`:
```json
"generate:validator-gate-map": "npx tsx scripts/manifests/generate/generate-validator-gate-map.ts",
"check:validator-gate-coverage": "npx tsx scripts/architecture/checks/check-validator-gate-coverage.ts",
"validators:run-advisory": "npx tsx scripts/architecture/checks/run-all-advisory-validators.ts"
```

New: `scripts/architecture/checks/run-all-advisory-validators.ts` — spawns every advisory-classified validator (so their report JSONs exist for the aggregator to surface).

### Step 5 — Update `MISSING_AUDIT.md` (both mirrors)

- **Part III** Cluster Audit — `scripts/` row → `MAPPED → validator-gate-map.json (185 validators classified, BLOCK/WARN/advisory consumer surfaced)`
- **Part XIII** Drift — move "Validator-to-gate mapping" from OPEN to RESOLVED ledger
- **Part XIV** Fix Plan — strike the P2 item; add `RESOLVED 2026-04-20 — validator-gate-map.json + check:validator-gate-coverage`
- Bump audit timestamp

## What this does NOT touch

- `REQUIRED_GATES` array — unchanged (BLOCK count and verdict logic preserved)
- The 185 existing validator scripts — read only
- DB / RLS / edge functions / auth / routes / UI — none
- `MANIFEST_REGISTRY`, `CI_GATE_REGISTRY` — unchanged (validator-gate-map is a new orthogonal map)

## Files touched

**New (4):**
- `src/lib/ci/validator-gate-map.ts` (typed registry)
- `scripts/manifests/generate/generate-validator-gate-map.ts`
- `scripts/architecture/checks/check-validator-gate-coverage.ts`
- `scripts/architecture/checks/run-all-advisory-validators.ts`

**Auto-generated (1):**
- `generated/validator-gate-map.json`

**Modified (4):**
- `scripts/architecture/checks/check-os-release-readiness.ts` (add advisory ingestion, BLOCK logic untouched)
- `package.json` (3 new scripts)
- `public/generated/MISSING_AUDIT.md` + `/mnt/documents/MISSING_AUDIT.md` (mark RESOLVED)

## Verification after approval

```bash
ls scripts/architecture/checks/check-*.ts | wc -l              # 185
npm run generate:validator-gate-map                            # produces map
jq '.coveragePercent, .blockCount, .warnCount, .advisoryCount' \
  generated/validator-gate-map.json                            # 100%, ~140, ~10, ~135
npm run check:validator-gate-coverage                          # PASS
npm run release:readiness                                      # BLOCK count UNCHANGED, advisory section now visible
npx tsc --noEmit                                               # 0 errors
md5sum public/generated/MISSING_AUDIT.md /mnt/documents/MISSING_AUDIT.md   # identical
```

Result: every validator on disk is classified, every advisory check has a surfaced consumer in the master readiness report, and a new gate prevents future drift — all without changing BLOCK semantics or breaking any of the existing wired gates.

