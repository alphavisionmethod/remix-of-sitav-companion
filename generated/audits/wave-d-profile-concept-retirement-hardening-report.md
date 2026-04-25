# Wave D — Profile Separation, Concept Uniqueness & Safe Retirement Hardening

**Status:** Adopted · **Mode:** Governance only · **Logic/UI/API changes:** None

## Part 1 — Profile Separation Model
- New constitutional Rule 45 (§D.1)
- Manifest: `generated/manifests/profile-route-visibility-map.json` (673 routes, 191 operator-only, 159 user, 33 both)
- Validator (BLOCK): `check-profile-visibility-leakage.ts` — enforces (a) operator-only routes need AdminRoute guard, (b) `// @profile:` directive matches manifest
- Baseline: `generated/baselines/profile-visibility-leakage-baseline.json` sealed at **0**

## Part 2 — Concept Uniqueness Model
- New constitutional Rule 46 (§D.2)
- Registry: `src/platform/architecture/primary-concept-registry.ts` (12 cross-cutting concepts)
- Manifest: `generated/manifests/primary-concept-ownership-map.json`
- Validator (BLOCK): `check-primary-concept-uniqueness.ts`
- Baseline: 2 pre-existing duplicate-risks pinned (`finance-front-door`, `files`); 0 net-new permitted

## Part 3 — Safe Retirement Model
- New constitutional Rule 47 (§D.3) — strengthens Rule 24
- Policy manifest: `generated/manifests/reverse-dependency-retirement-policy.json` (9 frozen subtrees)
- Generator: `generate-retirement-evidence-proof.ts` — auto-emits 5-kind proof from `rg`
- Validator (BLOCK): `check-retirement-evidence-completeness.ts` — re-greps reference-zero at CI time
- Baseline: 1 pre-Wave-D ledger entry grandfathered

## Part 4 — Manifest & Artifact Changes
- Added: `profile-route-visibility-map.json`, `primary-concept-ownership-map.json`, `reverse-dependency-retirement-policy.json`, `deletion-merge-evidence-map.json` (created on first use)
- Added baselines: `profile-visibility-leakage-baseline.json`, `primary-concept-duplicate-baseline.json`, `retirement-evidence-completeness-baseline.json`
- Added reports: `profile-visibility-leakage-report.json`, `primary-concept-uniqueness-report.json`, `retirement-evidence-completeness-report.json`

## Part 5 — Constitution Hardening
- 3 new rules (45, 46, 47) appended to `REPOSITORY_CONSTITUTION.md`
- 3 new model docs in `docs/architecture/`

## Part 6 — Validation & CI
- 3 new BLOCK validators registered in `src/lib/ci/validator-gate-map.ts`
- All 3 pass locally; existing baselines untouched

## Part 7 — Verification
- `tsc --noEmit`: clean
- All 3 new validators: ✅ pass
- No file moves, no logic changes, no UI changes, no API changes

## Part 8 — Future Work (deferred)
- Reconcile `finance-front-door` duplicate (merge experimental routes into money-routes)
- Reconcile `files` duplicate (consolidate os-routes mount)
- Wire `health-front-door`, `mission-control`, `atlas` route families into runtime registry
- Reseal Wave 10 attestation: `npx tsx scripts/architecture/wave-10-emit-attestation.ts`
