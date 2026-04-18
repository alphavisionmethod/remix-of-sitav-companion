

## Ubuntu-Native Platform Reorientation — Phased Implementation

### Pre-flight audit findings (from live repo)

I need to inventory active iOS/Apple footprint before drafting phases.
<lov-tool-use id="toolu_vrtx_01UrFvXiJL9GHGdRWi6hH8xu" name="code--exec" integration-id="code" data="{\"command\": \"cd /dev-server && echo \\\"=== iOS workflows ===\\\" && ls .github/workflows | grep -iE \\\"ios|apple|mobile\\\" && echo \\\"=== iOS scripts ===\\\" && find scripts -ipath \\\"*ios*\\\" -o -ipath \\\"*apple*\\\" 2>/dev/null | head -40 && echo \\\"=== iOS templates ===\\\" && ls ios-templates 2>/dev/null && echo \\\"=== Capacitor ===\\\" && ls capacitor.config.ts 2>/dev/null && grep -l \\\"@capacitor\\\" package.json && echo \\\"=== Mobile readiness checks ===\\\" && find scripts/architecture -name \\\"*mobile*\\\" -o -name \\\"*ios*\\\" 2>/dev/null && echo \\\"=== Generated mobile reports ===\\\" && ls generated 2>/dev/null | grep -iE \\\"mobile|ios|apple|store-readiness\\\" && echo \\\"=== Docs iOS ===\\\" && find docs -ipath \\\"*ios*\\\" 2>/dev/null && echo \\\"=== OS docs present ===\\\" && ls docs/os 2>/dev/null && echo \\\"=== OS scripts ===\\\" && ls os/scripts 2>/dev/null && echo \\\"=== OS workflows ===\\\" && ls .github/workflows | grep -iE \\\"os-|electron|qemu|vmware\\\"\", \"user_facing_description\": \"Auditing iOS and Ubuntu-native footprint\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01QE4Ehm3Jorazv1gsTTzXRW" name="code--exec" integration-id="code" data="{\"command\": \"cd /dev-server && echo \\\"=== iOS/Apple workflows ===\\\" && ls .github/workflows 2>/dev/null | grep -iE \\\"ios|apple|mobile|android\\\" && echo \\\"--- all workflows ---\\\" && ls .github/workflows 2>/dev/null && echo \\\"=== iOS scripts ===\\\" && find scripts -ipath \\\"*ios*\\\" -o -ipath \\\"*apple*\\\" 2>/dev/null | head -40 && echo \\\"=== iOS templates dir ===\\\" && ls -la ios-templates 2>/dev/null && echo \\\"=== android-templates ===\\\" && ls -la android-templates 2>/dev/null && echo \\\"=== capacitor ===\\\" && ls capacitor.config.ts 2>/dev/null && grep -l \\\"@capacitor\\\" package.json 2>/dev/null && echo \\\"=== Mobile arch checks ===\\\" && find scripts/architecture -iname \\\"*mobile*\\\" -o -iname \\\"*ios*\\\" -o -iname \\\"*apple*\\\" 2>/dev/null\", \"user_facing_description\": \"Auditing iOS footprint part 1\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_016Uo1GApT4ERinEDrJ88Pw1" name="code--exec" integration-id="code" data="{\"command\": \"cd /dev-server && echo \\\"=== generated mobile/ios reports ===\\\" && ls generated 2>/dev/null | grep -iE \\\"mobile|ios|apple|store\\\" && echo \\\"=== docs/ios ===\\\" && find docs -ipath \\\"*ios*\\\" -o -ipath \\\"*apple*\\\" -o -ipath \\\"*mobile*\\\" 2>/dev/null && echo \\\"=== docs/os ===\\\" && ls docs/os 2>/dev/null && echo \\\"=== os/scripts ===\\\" && ls os/scripts 2>/dev/null && echo \\\"=== os/ structure ===\\\" && ls os 2>/dev/null && echo \\\"=== electron files ===\\\" && ls electron 2>/dev/null && echo \\\"=== src/lib/mobile-platform ===\\\" && ls src/lib/mobile-platform 2>/dev/null && echo \\\"=== package.json mobile deps ===\\\" && grep -E \\\"@capacitor|@aparajita\\\" package.json 2>/dev/null\", \"user_facing_description\": \"Auditing iOS footprint part 2\"}">
</lov-tool-use>
I have enough context. The repo currently treats iOS/Android/Capacitor as active platforms — 4 mobile workflows, iOS templates, scripts, mobile readiness checks, and 11 Capacitor deps. The user wants Ubuntu-native to become the canonical native truth and Apple/iOS to be archived.

<lov-plan>

## Ubuntu-Native Reorientation — Phased Implementation Plan

### Audit findings (real state)

**Currently active iOS/Apple/mobile-native surface:**
- 4 CI workflows: `ios-bootstrap.yml`, `release-ios.yml`, `android-bootstrap.yml`, `release-android.yml`
- Scripts: `scripts/ios/bootstrap.sh`, `scripts/release/ios/build-ios.sh`, `exportOptions.plist`
- Templates: `ios-templates/App/`, `android-templates/app/`
- Capacitor stack: `capacitor.config.ts` + 11 `@capacitor/*` deps + `@aparajita/capacitor-biometric-auth`
- Architecture checks: `check-mobile-build-pipeline.ts`, `check-mobile-store-readiness.ts`
- Generated reports: `mobile-build-pipeline-report.json`, `mobile-store-readiness-report.json`
- Docs: `docs/ios/IOS_NATIVE_RUNTIME.md`, `docs/architecture/MOBILE_*`, `docs/runbooks/mobile-push-registration.md`
- `src/lib/mobile-platform/` with ios/, android/, native/ subdirs (8 native adapters)

**Already shipped Ubuntu-native foundation (keep + extend):**
- `os/scripts/` (19 scripts: build-raw-img, verity, signing, TPM, SBOM, rollback, support bundle, release.sh)
- `os/` (image-builder, installer, recovery, runtime, update, vm, vmware, qemu-validate.sh)
- `docs/os/` (18 canonical docs already present)
- `electron/` (15 .cjs hardening modules)
- `.github/workflows/os-build-iso.yml`, `desktop-build.yml`, `release-electron.yml`

### Phase 1 — Decision boundary & archive scaffolding
- Create `archive/` top-level with `archive/README.md` declaring archive policy.
- Create `docs/archive/ios/` and `scripts/archive/ios/` with INACTIVE banner READMEs.
- Add canonical `docs/PLATFORM_SCOPE.md` — single source of truth for active vs inactive platforms.

### Phase 2 — Archive Apple/iOS active assets
- Move `docs/ios/IOS_NATIVE_RUNTIME.md` → `docs/archive/ios/`
- Move `scripts/ios/bootstrap.sh` → `scripts/archive/ios/`
- Move `scripts/release/ios/` → `scripts/archive/ios/release/`
- Move `ios-templates/` → `archive/ios-templates/`
- Move `android-templates/` → `archive/android-templates/` (Android also non-active per user)
- Prepend INACTIVE banners to each archived file.
- Delete `.github/workflows/{ios-bootstrap,release-ios,android-bootstrap,release-android}.yml` (or move to `.github/workflows-archive/`).
- Remove all 11 `@capacitor/*` deps + `@aparajita/capacitor-biometric-auth` from `package.json`.
- Delete `capacitor.config.ts`.
- Move `src/lib/mobile-platform/{ios,android,native,release,security,sync,services,analytics,migration,navigation,runtime,contracts}/` native-specific pieces to `archive/mobile-platform/`. Keep only browser/PWA-safe pieces if any are imported by web code; otherwise archive the whole tree and remove imports.

### Phase 3 — Replace mobile readiness with Ubuntu-native readiness
- Delete `scripts/architecture/checks/check-mobile-build-pipeline.ts`
- Delete `scripts/architecture/checks/check-mobile-store-readiness.ts`
- Delete `generated/mobile-build-pipeline-report.json`, `generated/mobile-store-readiness-report.json`
- Create real, executable checks (no stubs):
  - `scripts/architecture/checks/check-os-build-pipeline.ts` → emits `generated/os-build-pipeline-report.json`
  - `scripts/architecture/checks/check-os-trust-chain-readiness.ts` → `generated/os-trust-chain-readiness-report.json`
  - `scripts/architecture/checks/check-os-update-readiness.ts` → `generated/os-update-readiness-report.json`
  - `scripts/architecture/checks/check-os-recovery-readiness.ts` → `generated/os-recovery-readiness-report.json`
  - `scripts/architecture/checks/check-electron-shell-session-readiness.ts` → `generated/native-shell-session-readiness-report.json`
  - `scripts/architecture/checks/check-qemu-vm-readiness.ts` → `generated/qemu-vm-readiness-report.json`
  - `scripts/architecture/checks/check-os-support-bundle-readiness.ts` → `generated/os-support-bundle-readiness-report.json`
  - `scripts/architecture/checks/check-native-observability-readiness.ts` → `generated/native-observability-readiness-report.json`
- Each check inspects real files in `os/scripts/`, `os/`, `electron/`, `.github/workflows/` and emits a JSON verdict — no fake green checks.

### Phase 4 — Wire Ubuntu-native readiness into CI
- Update `.github/workflows/os-build-iso.yml` to run all 8 new readiness checks and upload reports as artifacts.
- Add new workflow `.github/workflows/native-readiness.yml` that runs the 8 checks on every PR.
- Update `package.json` scripts: add `os:readiness`, `os:readiness:trust`, `os:readiness:update`, `os:readiness:recovery`, `os:readiness:shell`, `os:readiness:qemu`, `os:readiness:support`, `os:readiness:observability`.

### Phase 5 — Canonical Ubuntu-native deployment audit
- Write `docs/os/SITA_OS_NATIVE_DEPLOYMENT_AUDIT.md` — same rigor as the iOS v2 audit but for Ubuntu-native: verdict, shipped assets, gap matrix (P0/P1/P2 in Ubuntu-native terms — not Apple terms), remediation phases A–G, ownership split (Lovable vs operator), preflight checklist, residual gaps, end-to-end timeline.
- Write `docs/os/SITA_OS_NATIVE_RUNTIME.md` — operator runbook (bootstrap → build → sign → release → update → rollback → recover).
- Write `docs/os/IMAGE_LAYOUT_AND_PARTITIONS.md` — A/B layout, ESP, recovery, verity hash device.
- Update existing `docs/os/*.md` cross-refs.

### Phase 6 — Platform truth doc + admin/observability wiring
- `docs/PLATFORM_SCOPE.md` — supported (Web, Edge, Ubuntu-native ISO, Electron on Ubuntu, QEMU), partial (VMware OVA, hardware matrix), inactive (iOS, Android, Capacitor, App Store, TestFlight).
- Update `docs/architecture/MOBILE_PLATFORM_SYSTEM.md` and `MOBILE_EXPERIENCE_SYSTEM.md` to remove Capacitor/iOS/Android language; reframe as PWA + responsive web only, or archive them.
- Update `os/README.md` and root `README.md` with platform scope statement.

### Phase 7 — Memory & registry cleanup
- Update memory `architecture/mobile-platform` and `features/platform-runtimes` to reflect inactive iOS/Android.
- Update `architecture/index.md` metric counts.
- Remove iOS/Android references from manifest registries (`generated/ci-umbrella-manifest.json`, etc.) where present.
- Run a grep sweep for `App Store`, `TestFlight`, `Apple Developer`, `Capacitor`, `APNs`, `FCM`, `iOS native`, `Android native` across `docs/`, `src/`, `scripts/` and rewrite or remove (no silent leftovers).

### Phase 8 — Verification & broken-reference sweep
- Grep for imports of removed `@capacitor/*`, `capacitor.config`, `mobile-platform/{ios,android,native}` paths and fix every consumer.
- Run `npm run build` + `npm run typecheck` to confirm no broken references.
- Re-run all 8 native readiness checks; commit fresh `generated/*-report.json` artifacts.
- Update `SITA_MASTER_AUDIT.md` v7.0 → v7.1 reflecting Ubuntu-native canonical truth (mobile dimensions removed/renamed, deployability matrix down to 6 active targets).

### Constraints enforced
- No stubs: every readiness check inspects real files and returns real verdicts.
- No duplicates: existing `os/scripts/`, `docs/os/`, `electron/` are extended — not parallel-built.
- No silent leftovers: every Apple/Capacitor reference is archived, deleted, or rewritten.
- No broken refs: typecheck + build must pass after Phase 8.
- Fully wired: docs ↔ scripts ↔ CI ↔ generated artifacts ↔ admin truth pages.

### Files touched (scope summary)
- **Delete:** 4 workflows, 2 mobile checks, 2 mobile reports, `capacitor.config.ts`, 12 npm deps
- **Move to archive:** `ios-templates/`, `android-templates/`, `scripts/ios/`, `scripts/release/ios/`, `docs/ios/`, ~12 `src/lib/mobile-platform/` subdirs
- **Create:** 8 readiness checks + 8 generated reports, 1 new workflow, 3 canonical docs (`PLATFORM_SCOPE`, `SITA_OS_NATIVE_DEPLOYMENT_AUDIT`, `IMAGE_LAYOUT_AND_PARTITIONS`)
- **Update:** `package.json`, `os-build-iso.yml`, `docs/os/*` cross-refs, root + `os/README.md`, `SITA_MASTER_AUDIT.md`

