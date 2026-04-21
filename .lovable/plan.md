

# Archive and AI Workspace Cleanup Plan

## Summary

After inspecting every file in `.lovable/` and `archive/`, and searching the entire active codebase for references, the archive layer contains significant dead residue that should be removed. A small set of sentinel files are actively referenced by validators and compliance maps and must remain. The `.lovable/` directory contains a single stale plan file that needs governance.

---

## Classification Results

### Files to DELETE (dead residue, no live references)

| Path | Reason |
|---|---|
| `archive/generated/**` (35+ files) | Stale JSON/MD proof artifacts not produced by any active script. Create false readiness signals. |
| `archive/android-templates/**` | Dead Android template tree (build.gradle, proguard, google-services template). No active generator references it. |
| `archive/ios-templates/**` | Dead iOS template tree (Podfile, App shell). No active generator references it. |
| `archive/mobile-platform-native/**` (26 files) | Dead Capacitor/native adapter TS code. Never imported by active code. |
| `archive/src/**` (15+ files) | Dead admin pages, mobile clients, mobile-platform runtime, planes barrel. No active imports. |
| `archive/scripts/**` (18 files) | Dead mobile validation scripts. Not called by any CI workflow or npm script. |
| `archive/workflows/**` (4 files) | Dead GitHub Actions workflows for iOS/Android bootstrap and release. |

### Files to KEEP (actively referenced by validators, compliance maps, or governance docs)

| Path | Referenced by |
|---|---|
| `archive/mobile/ARCHIVED.md` | `check-mobile-deferral-attestation.ts`, `demo-only-surface-registry.ts`, `MOBILE_HONESTY.md` |
| `archive/capacitor/capacitor.config.ts` | `check-mobile-manifest-archive-classification.ts`, `emit-mobile-scope-artifacts.ts`, `mobile-platform-compliance-map.ts` |
| `archive/infra/mobile.yaml` | `check-mobile-manifest-archive-classification.ts`, `emit-mobile-scope-artifacts.ts`, `PLATFORM_SCOPE.md` |
| `archive/mobile/ios/*` | `mobile-platform-compliance-map.ts` (PrivacyInfo, Info.plist, SIGNING.md) |
| `archive/mobile/android/*` | `mobile-platform-compliance-map.ts` (TARGET_SDK_POLICY, SIGNING, FCM) |
| `archive/mobile/store-metadata/*` | `mobile-platform-compliance-map.ts` (data-safety, listings) |
| `archive/mobile/icons/` | Needed for mobile reactivation path |
| `archive/README.md` | Referenced by `PLATFORM_SCOPE.md`, `SITA_OS_NATIVE_DEPLOYMENT_AUDIT.md` |

---

## Changes

### 1. Delete stale archive content
Remove the 7 dead subtrees listed above (~100 files total). These are verified to have zero active imports, zero CI references, and zero workflow references.

### 2. Update `archive/README.md`
Rewrite to reflect the cleaned state -- only `mobile/`, `capacitor/`, and `infra/` remain. Remove references to deleted directories.

### 3. Create `archive/POLICY.md`
Defines: what belongs in archive, what must never accumulate (generated artifacts, dead template trees, dead source code), retention rules, and the boundary between archive and active truth.

### 4. Create `.lovable/README.md`
Declares the `.lovable/` directory as an internal AI planning workspace -- non-canonical, non-runtime, non-release-truth. Prevents it from being confused with product truth.

### 5. Clean `.lovable/plan.md`
Replace with a minimal stub noting the plan has been fully implemented. The current 171-line plan document describes work that is already complete.

### 6. Create `scripts/root/check-archive-boundary.ts`
Validator that enforces:
- No generated JSON/MD artifacts under `archive/`
- No `.ts`/`.tsx` source files under `archive/` except the capacitor config sentinel
- No `node_modules` or `package.json` under `archive/`
- All archive sentinel files (ARCHIVED.md, capacitor.config.ts, mobile.yaml) are present

### 7. Stale reference in `public/generated/`
Verify and clean `public/generated/mobile-identity-reconciliation/` -- this mirrors stale archive content in the public-facing generated directory.

---

## Technical Details

### Validator logic (`check-archive-boundary.ts`)
```text
PASS conditions:
  - archive/mobile/ARCHIVED.md exists
  - archive/capacitor/capacitor.config.ts exists
  - archive/infra/mobile.yaml exists
  - No *.json files under archive/generated/
  - No *.ts/*.tsx files under archive/ except capacitor.config.ts
  - No package.json under archive/

FAIL: any violation above
Output: generated/archive-boundary-report.json
```

### Files deleted (~100 files across 7 subtrees)
- `archive/generated/` -- 35+ stale proof reports
- `archive/android-templates/` -- 6 files
- `archive/ios-templates/` -- 4 files
- `archive/mobile-platform-native/` -- 26 files
- `archive/src/` -- 15+ files
- `archive/scripts/` -- 18 files
- `archive/workflows/` -- 4 files

### Files kept (minimal governed set)
- `archive/README.md` (updated)
- `archive/POLICY.md` (new)
- `archive/mobile/` (ARCHIVED.md, ios/, android/, store-metadata/, icons/)
- `archive/capacitor/capacitor.config.ts`
- `archive/infra/mobile.yaml`

