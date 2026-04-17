

## Re-Audit Verdict — Checklists 19 & 20: 8/10 Truthful, 2 Real Gaps

Phase 26 is **mostly real**. Live disk evidence:

| # | Item | Status | Evidence |
|---|---|---|---|
| **Checklist 19** | | | |
| 1 | 4 product reality tiers exist | ✅ | `runtime-tier-model.ts` declares all 4 |
| 2 | Features classified by tier | ✅ | 48 entries in `feature-runtime-tier-registry.ts` |
| 3 | Launch honesty fed by real data | ✅ | 10 `*LaunchHonesty*.tsx` pages read live registries |
| 4 | Simulated vs real explicit | ✅ | `TierGate` + `simulated-surface-registry.ts` |
| 5 | Unsupported capabilities surfaced | ✅ | `DegradedStatePanel` + `capability-fallbacks.ts` |
| 6 | Runtime capability matrix exists | ✅ | `runtime-capability-matrix.json` exists & registered |
| 7 | Release/readiness validates runtime truth | ✅ | Registry conformance enforced |
| **Checklist 20** | | | |
| 1-7 | Per-entry metadata complete | ✅ | All 110 entries have `sourceInputs`, `validator`, `ciGate`, `owner`, `runtimeConsequence` |
| 8 | Runtime manifests backed by evidence | ✅ | 7 manifests use `runtime-evidence/collectors/*` |
| 9-12 | Route/Service/Function/Schema match | ✅ | Per-domain drift checks present |
| 13 | Drift CI-blocking | ✅ | Gate 37 registered with `consequence: "blocks-deploy"` |
| 14 | **Manifest theater eliminated** | ⚠️ | **3 honest drifts found below** |

### Concrete Gaps (3 items)

1. **One orphan on disk** — `generated/manifest-theater-report.json` itself is not in the registry. The Phase-26 gate hard-codes a `SELF_EMITTED` skip, but the artifact still exists on disk and operators can't audit it via the manifest dashboard. Either register it (preferred — it's a real, owned, gate-produced artifact) or document the self-exclusion in the registry as `kind: "self-emitted"`.

2. **One missing validator** — registry declares `validator: "scripts/manifests/validate/check-manifest-schema-integrity.ts"` for at least one entry, but the file does not exist on disk (`ls scripts/manifests/validate/` shows no schema validator). Phase-26 gate would currently FAIL on `missing-validator` if any of those entries are `authority: "authoritative"`.

3. **Stale baseline counts** — `generated/manifest-theater-report.json` claims `registry: 110, onDiskJson: 98, orphanOnDisk: 0, missingValidators: 0`. Live counts are `registry: 110, onDiskJson: 99, orphanOnDisk: 1, missingValidators: 1`. The committed baseline lies; rerunning the gate will fail.

---

## Phase 26.1 — Manifest Truth Final Closure

### 26.1.A — Register `manifest-theater-report.json` (fixes #1)
Append entry to `src/lib/truth-manifests/manifest-registry.ts`:
```ts
{
  id: "manifest-theater-report",
  path: "generated/manifest-theater-report.json",
  class: "compliance",
  authority: "derived",
  owner: "platform-architecture",
  sourceInputs: ["src/lib/truth-manifests/manifest-registry.ts", "generated/**/*.json"],
  validator: "scripts/manifests/validate/check-manifest-source-truth.ts",
  ciGate: "manifest-theater-elimination",
  runtimeConsequence: "Reveals manifest theater (orphans, phantoms, missing validators).",
  releaseConsequence: "Blocks deploy when registry/disk drift exists.",
  driftSeverity: "high",
  tags: ["manifest", "ci", "phase-26"],
}
```
Then remove the `SELF_EMITTED` skip in `check-manifest-source-truth.ts` since the entry is now legitimate.

### 26.1.B — Create the missing validator OR remove the reference (fixes #2)
Audit which registry entry references `check-manifest-schema-integrity.ts`. Two valid resolutions:
- **Preferred:** Create `scripts/manifests/validate/check-manifest-schema-integrity.ts` as a thin validator that asserts every registry entry has required fields (`id`, `path`, `class`, `authority`, `owner`, `sourceInputs`, `runtimeConsequence`).
- **Alternative:** Repoint the affected entries' `validator` field to an existing validator (e.g., `check-manifest-completeness.ts`).

### 26.1.C — Refresh the committed baseline (fixes #3)
Regenerate `generated/manifest-theater-report.json` so committed numbers match live truth:
```json
{
  "totals": { "registry": 111, "onDiskJson": 99, "orphanOnDisk": 0, "phantomEntries": 0, "missingValidators": 0 },
  "ok": true
}
```
(After 26.1.A registry grows to 111 and orphan goes to 0; after 26.1.B missing-validator goes to 0.)

### Files

| Layer | Change |
|---|---|
| `src/lib/truth-manifests/manifest-registry.ts` | APPEND `manifest-theater-report` entry (110 → 111) |
| `scripts/manifests/validate/check-manifest-source-truth.ts` | Remove `SELF_EMITTED` skip (no longer needed) |
| `scripts/manifests/validate/check-manifest-schema-integrity.ts` | NEW — registry shape validator |
| `generated/manifest-theater-report.json` | Refresh totals to match live disk |

### Acceptance

- `comm -23 disk.txt registry.txt` returns **empty** (zero orphans, including the report itself)
- `comm -13 disk.txt registry.txt` returns **empty** (zero phantoms — already true)
- Every `validator:` path in registry resolves to an existing file (zero missing-validators)
- `generated/manifest-theater-report.json` shows `registry: 111, orphanOnDisk: 0, phantomEntries: 0, missingValidators: 0, ok: true`
- Gate 37 (`manifest-theater-elimination`) passes when re-run
- Checklist 19 truthfully **7/7 — fully deployable**
- Checklist 20 truthfully **14/14 — fully deployable**

