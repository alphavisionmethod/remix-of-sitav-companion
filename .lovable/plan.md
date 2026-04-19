
The user wants me to plan a Mobile Identity & Stack Truth Reconciliation pass. This is separate from the previously-completed Mobile Deployment Closure (which covered signing/submission). This new pass focuses on **identity, stack truth declarations, native generation contract, build/dependency model, env strategy** — and explicitly calls out that `infra/deploy/mobile.yaml` previously claimed Flutter (per their audit). Looking at the file excerpt I have, `infra/deploy/mobile.yaml` already declares `stack: capacitor` — but they want full audit + 16 new artifacts + 8 new validators.

I'll keep the plan tight: 4 phases, each independently deployable.

<lov-plan>
# Mobile Identity & Stack Truth Reconciliation — Implementation Plan

Builds on the completed Mobile Deployment Closure. Adds a parallel reconciliation track focused on **identity, stack truth, native generation contract, build model, env strategy** under `generated/mobile-identity-reconciliation/`.

## Phase 1 — Identity & Stack Truth Audit + Source-of-Truth Model
**Deployable outcome:** Canonical identity model published; all conflicting identity references normalized.

- Audit every identity-bearing surface (`capacitor.config.ts`, `mobile/store-metadata/*.json`, `mobile/*/SIGNING.md`, `infra/deploy/mobile.yaml`, bootstrap scripts, workflow files)
- Define single source of truth: `appId=com.sita.os`, `appName=SITA OS`, wrapper=Capacitor 6, web=Vite/React SPA, backend=Lovable Cloud
- Normalize any drift (e.g. `app.lovable.*` placeholders rejected for signed builds)
- **Artifacts:** `PROJECT_IDENTIFICATION_AUDIT.md`, `MOBILE_IDENTITY_SOURCE_OF_TRUTH.md`, `MOBILE_STACK_TRUTH_AUDIT.md`, `MOBILE_DEPLOY_MANIFEST_RECONCILIATION.md`, `mobile-project-identification-status.json`, `mobile-stack-truth-status.json`
- **Validators:** `check-mobile-project-identification.ts`, `check-mobile-identity-source-of-truth.ts`, `check-no-flutter-stack-drift.ts`, `check-capacitor-mobile-truth.ts`

## Phase 2 — Native Project Generation Contract
**Deployable outcome:** Explicit, validated contract for how `android/` and `ios/` come into existence.

- Audit `scripts/android/bootstrap.sh`, `scripts/archive/ios/bootstrap.sh`, `.github/workflows/mobile-build.yml`
- Promote iOS bootstrap from `scripts/archive/ios/` → `scripts/ios/bootstrap.sh` (real, hardened, not archived)
- Document: native projects are **generated on demand**, not committed; pinned tool versions; post-generation sanity checks; failure diagnostics
- **Artifacts:** `NATIVE_PROJECT_GENERATION_AUDIT.md`, `NATIVE_PROJECT_GENERATION_CONTRACT.md`, `native-generation-contract-status.json`
- **Validators:** `check-android-native-generation.ts`, `check-ios-native-generation.ts`, `check-native-project-generation-contract.ts`, `check-mobile-bootstrap-contract.ts`

## Phase 3 — Build, Dependency & Environment Model
**Deployable outcome:** One canonical build/dep/env story; no mixed narratives.

- Define: web=npm/Vite, Android=Gradle, iOS=xcodebuild+CocoaPods (post-gen), Capacitor sync as bridge
- Define env strategy: Lovable `.env` (web runtime) vs GitHub Actions secrets (signing) vs Supabase function secrets (push/backend) vs Apple/Google credential stores (never in repo)
- **Artifacts:** `MOBILE_BUILD_AND_DEPENDENCY_AUDIT.md`, `MOBILE_BUILD_AND_DEPENDENCY_MODEL.md`, `MOBILE_ENV_AND_SECRET_STRATEGY_AUDIT.md`, `MOBILE_ENV_AND_SECRET_STRATEGY_MODEL.md`, `mobile-build-model-status.json`
- **Validators:** `check-mobile-build-model-consistency.ts`, `check-mobile-env-strategy-consistency.ts`

## Phase 4 — Governance Wiring & Final Verification
**Deployable outcome:** All new validators wired into the 130-gate aggregator; final verification artifact attests GREEN.

- Add 8 new validators to `scripts/validation/check-os-release-readiness.ts` aggregator (gates 131–138)
- Add npm script `mobile:identity:run-all` mirroring existing `mobile:closure:run-all`
- Update `src/planes/MOBILE_MANIFEST.md` to reference identity reconciliation alongside closure
- **Artifacts:** `MOBILE_IDENTITY_RECONCILIATION_FINAL_VERIFICATION.md`, `mobile-identity-verification.json`
- Run full aggregator → confirm 138 gates GREEN, 0 errors

## Files Touched (Summary)

```text
generated/mobile-identity-reconciliation/   [16 new files]
scripts/validation/                         [8 new validators]
scripts/ios/bootstrap.sh                    [promoted from archive, hardened]
scripts/validation/check-os-release-readiness.ts   [+8 gates]
src/planes/MOBILE_MANIFEST.md               [identity section added]
package.json                                [+ mobile:identity:run-all script]
infra/deploy/mobile.yaml                    [verified canonical, no changes expected]
```

## Guarantees

- No stubs, no placeholders — every doc has real audit findings + concrete contracts
- No duplicates — identity reconciliation is a **parallel track** to closure (different concerns: identity/stack vs signing/submission), wired together via the aggregator
- No false readiness — Apple/Play account-blocked items remain honestly classified
- Each phase ends GREEN on the aggregator before moving to the next
