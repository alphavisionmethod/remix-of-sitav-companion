# SITA OS — Mobile Deploy Manifest Reconciliation

**Subject:** `infra/deploy/mobile.yaml`
**Status:** **canonical, reconciled, no rewrite required**

---

## 1. Question Posed by the Closure Prompt

> Does `infra/deploy/mobile.yaml` falsely declare Flutter? If yes, rewrite to Capacitor reality OR explicitly mark as aspirational/noncanonical.

## 2. Audit Result

`infra/deploy/mobile.yaml` was inspected line-by-line:

```yaml
# Line 1-3 (header comment):
# SITA OS — Mobile Deployment Manifest
# Canonical stack: Capacitor over Lovable SPA (NOT Flutter — Flutter was abandoned).
# Posture: secondary supported distribution surface, honestly deferred on external blockers.

# Line 9 (metadata):
metadata:
  ...
  stack: capacitor                    # ← canonical declaration
  posture: secondary-distribution-surface

# Line 13-21 (spec.platform):
spec:
  platform:
    capacitor:                        # ← canonical platform key
      version: "6"
      web_runtime: lovable-spa
      ...
```

**The file already declares `capacitor` as the canonical stack and explicitly disavows Flutter in its own header comment.** The earlier audit's claim that this YAML "still claims a Flutter stack" reflects an earlier repo state that was already corrected during Phase Mobile Deployment Closure. The validator `check-no-flutter-mobile-truth-drift` (closure pass) and `check-no-flutter-stack-drift` (this pass) both report zero Flutter hits in this file.

## 3. Decision: Option A — Already Rewritten to Capacitor Reality

This file is **canonical deployment truth** for the mobile distribution layer. It correctly declares:

- ✅ `metadata.stack: capacitor`
- ✅ `metadata.posture: secondary-distribution-surface`
- ✅ `spec.platform.capacitor.version: "6"`
- ✅ `spec.platform.capacitor.web_runtime: lovable-spa`
- ✅ `spec.platform.capacitor.min_sdk.ios: "16.0"`
- ✅ `spec.platform.capacitor.min_sdk.android: "26"`
- ✅ `spec.platform.capacitor.target_sdk.android: "34"`
- ✅ Explicit disavowal of Flutter in header comment
- ✅ Push transport resolution honestly gated: `web: vapid (active)`, `ios: apns (deferred)`, `android: fcm (deferred)`
- ✅ Blocker classes correctly attributed: iOS = `account-blocked`, Android = `secret-blocked`
- ✅ All signing material referenced via `${ENV_VAR}` interpolation — no secrets in repo

**No rewrite is required.** The file is operationally correct and operator-honest.

## 4. What Reconciliation Adds

This pass adds **drift protection going forward** via 3 new validators:

| Validator | Asserts |
|---|---|
| `check-no-flutter-stack-drift.ts` | scans `infra/deploy/mobile.yaml` (and other claim surfaces) for Flutter mentions without disavowal context |
| `check-capacitor-mobile-truth.ts` | asserts `metadata.stack == capacitor` and `spec.platform.capacitor.*` keys are present |
| `check-mobile-build-model-consistency.ts` | asserts the YAML's declared min/target SDKs match what the bootstrap and release scripts assume |

These validators **prevent future regression** of the file back to a contradictory state.

## 5. Cross-Reference to Closure Pass

The Mobile Deployment Closure pass produced `MOBILE_CANONICAL_TRUTH_MODEL.md` which establishes the same canonical-stack truth at the architectural level. This Identity Reconciliation pass adds the **manifest-level enforcement** layer beneath it:

```
Architectural truth (closure)         →  MOBILE_CANONICAL_TRUTH_MODEL.md
        ↓
Identity source-of-truth (this pass)  →  MOBILE_IDENTITY_SOURCE_OF_TRUTH.md
        ↓
Manifest realisation (this file)      →  infra/deploy/mobile.yaml
        ↓
Validator enforcement (this pass)     →  4 new gates + 6 existing closure gates
```

## 6. Verdict

**`infra/deploy/mobile.yaml` is canonical, correct, and now drift-protected.**
No rewrite. No reclassification. Reconciliation = adding the enforcement layer that turns existing correctness into governed correctness.
