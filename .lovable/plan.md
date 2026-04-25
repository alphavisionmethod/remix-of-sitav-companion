
# Wave D — Profile Separation + Concept Uniqueness + Safe Retirement Hardening

**Mode:** Governance + manifests + validators. **Zero source-code logic changes. Zero UI/API changes. Zero file moves.**

This wave closes Gaps 14–16 by elevating already-partial enforcement into constitutional, manifest-backed, CI-gated law — *without* introducing duplicate governance or breaking any existing validator/profile/baseline contract.

---

## Audit Findings (what exists, what's missing)

| Capability | Already exists | Gap |
|---|---|---|
| Profile-route map (673 routes) | ✅ `generated/profile-and-runtime-hardening/app-route-profile-map.json` | ❌ Not centralized into a stable `generated/manifests/` artifact; no constitutional rule binding it; no validator that fails CI on operator-route leakage into user profile shells |
| Profile leakage check | ✅ `check-shared-component-profile-pollution.ts`, `check-command-palette-profile-leakage.ts` | ❌ No top-level "operator-only-cannot-leak-into-user-route-tree" gate; no per-page-adapter `// @profile:` declaration |
| Admin concept uniqueness | ✅ `check-no-duplicate-primary-concept.ts` (admin domains only) | ❌ No equivalent registry for primary product/platform concepts (Business, Boardroom, Trust, Personal Brain, Mission Control, Files, Concierge, Finance, Health) |
| Safe-change ledger | ✅ Rule 24 + `safe-change-evidence-ledger.json` + `check-safe-change-evidence.ts` | ❌ No reverse-dependency *policy* doc; no automated grep-proof *generator*; no manifest mapping retired/deleted/merged paths to evidence |

---

## Deliverables

### A. Profile Separation (Gap 14)

1. **`generated/manifests/profile-route-visibility-map.json`** *(active-blocking, TTL 7d)*
    - Generator: `scripts/architecture/generate/generate-profile-route-visibility-map.ts`
    - Source: existing `app-route-profile-map.json` (no new audit; pure projection into a stable `generated/manifests/` location)
    - Schema: `{ path, plane, profiles[], operatorOnly, sourceOwner, routeAdapter, validationStatus }`
2. **`docs/architecture/PROFILE_VISIBILITY_AND_OPERATOR_SEPARATION_MODEL.md`** — formal model
3. **`scripts/architecture/checks/check-profile-visibility-leakage.ts`** *(BLOCK gate)*
    - Fails if a route with `profiles: ["operator"]` is reachable from a user-profile shell registry (`AppRoutes.tsx`, launcher app registry) without an explicit `AdminRoute` guard
    - Fails if the visibility manifest is stale
4. **Constitution amendment §D.1 — Profile Visibility Law** (Rule 45)
    - Operator-only surfaces MUST NOT leak into user route trees without explicit `AdminRoute`/`PermissionGatedRoute` guard
    - Profile visibility is centrally registered in `profile-route-visibility-map.json`
    - Page adapters MAY declare `// @profile: <user|operator|both>`; when present it MUST match the manifest

### B. Concept Uniqueness (Gap 15)

5. **`src/platform/architecture/primary-concept-registry.ts`** — typed registry of primary cross-cutting concepts:
    - `business-front-door`, `concierge-front-door`, `finance-front-door`, `health-front-door`
    - `boardroom`, `trust`, `personal-brain`, `mission-control`, `files`, `atlas`, `owner`
    - Each entry: `{ concept, ownerType: "module"|"platform"|"admin", ownerPath, canonicalRouteFamily, canonicalPageFamily, aliases[] }`
6. **`generated/manifests/primary-concept-ownership-map.json`** *(active-blocking, TTL 7d)*
    - Generator: `scripts/architecture/generate/generate-primary-concept-ownership-map.ts`
    - Cross-references the registry against actual route/page ownership; flags duplicates as `duplicate-risk`
7. **`docs/architecture/PRIMARY_CONCEPT_UNIQUENESS_MODEL.md`** — formal model
8. **`scripts/architecture/checks/check-primary-concept-uniqueness.ts`** *(BLOCK gate)*
    - Each concept has exactly one canonical owner path, one canonical route family, one canonical page family
    - Aliases must remain ≤2-line re-exports (reuses Rule 17 wrapper detection)
    - Net-new duplicate canonical implementations BLOCK CI
    - Pre-existing duplicates (if any) baselined in `generated/baselines/primary-concept-duplicate-baseline.json` (monotone-decreasing)
9. **Constitution amendment §D.2 — Concept Uniqueness Law** (Rule 46)

### C. Safe Retirement (Gap 16)

10. **`docs/architecture/SAFE_RETIREMENT_AND_REVERSE_DEPENDENCY_MODEL.md`** — formal evidence policy
11. **`generated/manifests/reverse-dependency-retirement-policy.json`** *(reference, TTL 180d)*
    - Maps each frozen subtree to required evidence kinds and the script that produces them
12. **`scripts/architecture/generate/generate-retirement-evidence-proof.ts`** — automation helper
    - Given `--target <path>`, runs `rg` across `src/`, `tests/`, `docs/`, `generated/`, `scripts/`, `.github/workflows/` and emits a `{ grepProof, manifestProof, routeProof, testProof, docsProof }` JSON ready to append to `safe-change-evidence-ledger.json`
    - Does not delete anything; only generates evidence
13. **`scripts/architecture/checks/check-retirement-evidence-completeness.ts`** *(BLOCK gate, augments Rule 24)*
    - Every entry in `safe-change-evidence-ledger.json` MUST have non-empty proof for all five kinds
    - Merge entries MUST have `duplicateReconciliation`
    - Every retired path in the ledger MUST yield zero hits when re-grepped at validation time (reference-zero proof)
14. **Constitution amendment §D.3 — Reverse-Dependency Retirement Law** (Rule 47, formalizes & strengthens existing Rule 24)

### D. Wiring & Verification

15. Update `src/lib/ci/validator-gate-map.ts` — register the 3 new BLOCK gates
16. Update `generated/manifests/foundation-manifest-index.json` — add the 2 new active-blocking manifests
17. Update `generated/manifests/generated-artifact-governance-map.json` — classify the 3 new artifacts
18. Update `generated/manifests/flowos-deliverables-index.json` — Wave D row
19. Generate `generated/audits/wave-d-profile-concept-retirement-hardening-report.md`
20. Run all new generators; verify `tsc --noEmit` is clean; run the 3 new validators locally; confirm no existing baseline regresses
21. **Reseal step (user-runnable):** `npx tsx scripts/architecture/wave-10-emit-attestation.ts` (only via the canonical script, per Rule 19)

---

## Safety Guarantees

- **No file moves, no logic changes, no UI changes, no API changes** — pure governance/manifest/validator additions
- **No duplicate governance** — reuses existing `safe-change-evidence-ledger`, `app-route-profile-map`, `validator-gate-map`, `foundation-manifest-index`
- **Single canonical owner path per moved/registered concept** — enforced by the new concept registry
- **Reverse-dependency proof for every retirement** — formalized in §D.3 + automated by the new generator
- **Strict no-logic / no-UI / no-API-change rule** — explicit; this wave only adds 3 docs, 3 manifests, 3 validators, 1 typed registry, 2 generator scripts, and amends the constitution

## Out of Scope (deferred)

- Physically migrating the 145 page-backend bypass violations (Wave B baseline; future Wave E)
- Physically migrating the 550 page-semantic violations (Wave 0.7 baseline; future Page Body Relocation Wave)
- Physically migrating the 576 admin page bodies (Wave A baseline; future Admin Sharding Wave)
- Removing any existing compatibility wrapper

These remain governed by their existing baselines and ratchets; Wave D only strengthens the rules under which they will eventually be retired.
