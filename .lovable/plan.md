
## Diagnosis

Audit observation is accurate:
- **`generated/INDEX.json` does NOT exist** on disk — external validators (CI, auditors, third-party reviewers) cannot trace any artifact back to its producer script or downstream consuming gate without parsing the heavyweight 913-entry `artifact-ownership-manifest.json`
- The existing `artifact-ownership-manifest.json` has producer mapping but its `consumers: []` field is **empty for every entry** — no gate→artifact dependency graph is built
- No CI gate enforces `INDEX.json` presence/freshness/schema, so future drift is unguarded

The audit specifically calls out the **producer-script → consuming-gate map**. The current manifest gives only half (artifact→producer); the consumer half is missing entirely.

## Fix — additive, mirrors existing manifest patterns

### Step 1 — Generator script: `scripts/manifests/generate/generate-artifact-index.ts`

Builds `generated/INDEX.json` by:
1. **Reading** existing `generated/artifact-ownership-manifest.json` for the artifact→producer mapping (no recomputation — single source of truth)
2. **Scanning** `scripts/architecture/checks/*.ts` and `scripts/validation/*.ts` to extract every `readJsonSafe("generated/X.json")` / `readFileSync("generated/X.json")` reference — this builds the artifact→consumers reverse index
3. **Joining** producer + consumers into a slim, externally-readable record
4. **Emitting** `generated/INDEX.json` with shape:
```json
{
  "schemaVersion": 1,
  "generatedAt": "...",
  "generator": "scripts/manifests/generate/generate-artifact-index.ts",
  "totalArtifacts": 913,
  "withProducer": 858,
  "withConsumers": <N>,
  "fullyTraceable": <N>,        // both producer + ≥1 consumer
  "coveragePercent": <N>,
  "entries": [
    {
      "artifact": "generated/5-plane-boundaries-report.json",
      "producer": "scripts/architecture/checks/check-5-plane-boundaries.ts",
      "npmScript": "check:5-plane-boundaries",
      "consumers": ["scripts/architecture/checks/check-os-release-readiness.ts"],
      "owner": "architecture"
    }
  ]
}
```

Also mirrors to `public/generated/INDEX.json` so external validators can fetch over HTTPS.

### Step 2 — BLOCK gate: `scripts/architecture/checks/check-artifact-index-traceability.ts`

Asserts (gate #24):
1. `generated/INDEX.json` exists and parses
2. Schema valid (required keys present)
3. `coveragePercent ≥ 90` (matches existing ownership coverage threshold)
4. Every entry's `producer` path either exists on disk or is a known external (`.github/`, `supabase/functions/`, `package.json`)
5. `public/generated/INDEX.json` byte-identical to `generated/INDEX.json` (mirror parity)

Emits `generated/artifact-index-traceability-report.json`.

### Step 3 — Wire into pipeline

- Add npm script `generate:artifact-index` and `check:artifact-index-traceability`
- Register gate #24 in `src/lib/ci/ci-gate-registry.ts`
- Add to mandatory roster in `scripts/architecture/checks/check-os-release-readiness.ts` (now 24)
- Add `INDEX.json` to public mirror policy so it auto-mirrors on every regeneration

### Step 4 — Update audit mirrors to RESOLVED

Update line `generated/INDEX.json (artifact → producer-script → consuming-gate map)` in all four mirrors (`public/generated/MISSING_AUDIT.md`, `/mnt/documents/MISSING_AUDIT.md`, `public/generated/MISSING_AUDIT_v2.md`, `/mnt/documents/MISSING_AUDIT_v2.md`) to:

`**RESOLVED 2026-04-20** — generated/INDEX.json emitted by scripts/manifests/generate/generate-artifact-index.ts; slim externally-readable map joining artifact → producer-script → consuming-gates by scanning all check-*.ts files for readJsonSafe/readFileSync references. Mirrored to public/generated/INDEX.json. BLOCK gate #24 (check-artifact-index-traceability) asserts existence, schema validity, ≥90% traceability coverage, producer-on-disk, and mirror parity.`

Preserve byte-identical mirror parity via md5sum.

## What this does NOT touch

- Zero changes to existing `artifact-ownership-manifest.json` generator
- No changes to existing 23 BLOCK gates
- No changes to runtime behavior

## Files touched

**New (3):**
- `scripts/manifests/generate/generate-artifact-index.ts`
- `scripts/architecture/checks/check-artifact-index-traceability.ts`
- `generated/INDEX.json` + `public/generated/INDEX.json` (emitted)

**Modified (5):**
- `package.json` (2 new scripts)
- `src/lib/ci/ci-gate-registry.ts` (gate #24)
- `scripts/architecture/checks/check-os-release-readiness.ts` (roster → 24)
- `scripts/architecture/lib/public-mirror-policy.ts` (whitelist INDEX.json)
- 4 audit mirrors (MISSING_AUDIT.md/v2 × 2 locations)

## Verification after approval

```bash
npm run generate:artifact-index                                            # emits INDEX.json
ls -la generated/INDEX.json public/generated/INDEX.json                    # both present
npx tsx scripts/architecture/checks/check-artifact-index-traceability.ts  # 0 errors
npm run release:readiness                                                  # 24/24 green
md5sum generated/INDEX.json public/generated/INDEX.json                    # identical
md5sum public/generated/MISSING_AUDIT.md /mnt/documents/MISSING_AUDIT.md   # identical
md5sum public/generated/MISSING_AUDIT_v2.md /mnt/documents/MISSING_AUDIT_v2.md  # identical
```

Result: External validators can `curl https://<host>/generated/INDEX.json` and trace any artifact end-to-end (producer script ↔ artifact ↔ consuming gates) without parsing the heavyweight ownership manifest.
