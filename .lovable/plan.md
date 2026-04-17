

## Re-Audit — Checklists 24 & 25: 22/30 Truthful, 8 Concrete Gaps

Live disk shows a strong testing+CI foundation: 283 test files, 103 architecture checks, full launch-gate workflow, ring promotion, mobile/electron/vmware build scripts, backup script, restore script, and `verify-backup-restore.ts`. But several items are claimed and **not wired** as dedicated tests, gates, or release artifacts.

### Checklist 24 — Testing / Validation (10/14 truthful)

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Unit tests cover critical logic | ✅ | 283 test files; 48 page batches; ~100 lib/hook/context tests |
| 2 | Integration tests cover critical chains | ✅ | `tests/integration/` (4 chains) + `src/test/integration/` |
| 3 | E2E tests cover golden paths | ✅ | 30+ `tests/e2e/customer-journey/**` specs |
| 4 | Mobile-specific tests | ⚠️ partial | `src/lib/mobile-platform/__tests__/` exists but no Capacitor/iOS/Android E2E test target |
| 5 | Runtime truth tests | ⚠️ thin | `managed-runtime.test.ts` + `domain-runtime-service.test.ts` only — no test that asserts `runtime-conformance-manifest.json` matches live evidence |
| 6 | Policy/trust tests | ✅ | 7 policy-engine test files |
| 7 | DB/schema truth tests | ✅ | `src/__tests__/db/` (4 specs) |
| 8 | **Route/IA truth tests** | ❌ | No `route-registry.test.ts` asserting registry vs filesystem; only `route-coverage.test.ts` (limited) |
| 9 | **Service boundary tests** | ❌ | No vitest spec for service-layer-boundaries (only the script gate) |
| 10 | **Edge function topology tests** | ❌ | Zero `*backend-topology*.test.*` files — only the architecture script |
| 11 | **Manifest truth tests** | ❌ | Zero tests for `manifest-registry.ts`, `ci-gate-registry.ts`, no spec asserting registry consistency at runtime |
| 12 | Kill-switch enforcement tests | ⚠️ | `check-kill-switch-coverage.ts` script exists but no vitest spec validates the enforcement map executes |
| 13 | Release readiness checks | ✅ | `check-release-readiness.ts`, `release-launch-truth-audit.ts` |
| 14 | Backup/restore validation | ⚠️ | `verify-backup-restore.ts` exists but **NOT bound** to any CI workflow or `validate-all.ts` |

### Checklist 25 — CI/CD / Release Truth (12/16 truthful)

| # | Item | Status | Evidence |
|---|---|---|---|
| 1a | Architecture drift gate | ✅ | `check-drift.ts` |
| 1b | Route drift gate | ✅ | `check-route-drift.ts` |
| 1c | Service drift gate | ✅ | `check-service-registry-sync.ts` |
| 1d | Schema drift gate | ✅ | `check-db-reality.ts` |
| 1e | Manifest drift gate | ✅ | `check-ci-umbrella-integrity.ts` + manifest validators |
| 1f | Runtime truth drift gate | ✅ | `check-runtime-foundations.ts` + runtime-tier-governance |
| 1g | Policy/permission drift gate | ✅ | `check-policy-coverage.ts` + `check-policy-mapping.ts` |
| 1h | Launch readiness gate | ✅ | `launch-gate` job in `ci.yml` + `release-launch-truth-audit.ts` |
| 2 | Web deploy pipeline | ✅ | `deploy.yml` + `deploy-frontend.yml` |
| 3 | **iOS release pipeline** | ⚠️ | `build-ios.sh` exists but **not wired** to any `.github/workflows/*.yml` |
| 4 | **Android release pipeline** | ⚠️ | `build-android.sh` exists but **not wired** to any GHA workflow |
| 5 | **Electron release pipeline** | ⚠️ | `build-electron.sh` exists but **not wired** to any GHA workflow |
| 6 | VMware/ISO build pipeline | ✅ | `build-ova.sh` + `deploy-vmware.sh` + 9 generators |
| 7 | Rollback path | ✅ | `rollback-engine.ts` + `rollback-behavior-map.ts` + `release-rollback.md` |
| 8 | **Release notes / build artifact truth** | ❌ | No `RELEASE_NOTES.md` generator, no `build-artifact-manifest.json`, no checksum/SBOM emission |
| 9 | Promotion / ring logic | ✅ | `ring-promotion.ts` wired in CI for canary/pilot/GA |

---

## Phase 30 — Test & Release Truth Closure (8 fixes)

### 30.A — Add 4 missing vitest truth-tests (fixes 24.8, 24.10, 24.11, 24.12)
- `src/__tests__/route-truth.test.ts` — assert `ROUTE_REGISTRY` ↔ `src/pages/` filesystem (every page has a route, every route has a page)
- `src/__tests__/edge-function-topology.test.ts` — assert `EDGE_FUNCTION_TOPOLOGY` ↔ `supabase/functions/*/index.ts` (no phantom, no orphan)
- `src/__tests__/manifest-truth.test.ts` — assert every `MANIFEST_REGISTRY` entry has on-disk artifact OR validator script; assert `CI_GATE_REGISTRY` script paths exist
- `src/__tests__/kill-switch-enforcement.test.ts` — execute `KILL_SWITCH_REGISTRY` consequence map and assert each switch resolves a real subsystem

### 30.B — Add service-boundary vitest spec (fixes 24.9)
- `src/__tests__/service-boundary-truth.test.ts` — runs `service-layer-boundaries` rules at test time so violations show up in `npm test` not just CI script

### 30.C — Add mobile + runtime truth runtime tests (fixes 24.4, 24.5)
- `src/lib/mobile-platform/__tests__/capacitor-capability-contract.test.ts` — assert all declared native capabilities have an adapter implementation
- `src/__tests__/runtime-conformance-truth.test.ts` — assert `runtime-conformance-manifest.json` matches live evidence collectors

### 30.D — Wire backup/restore validation to CI (fixes 24.14)
- Register `scripts/db/backup/verify-backup-restore.ts` in `validate-all.ts` under `"db"` domain
- Add a step `npx tsx scripts/db/backup/verify-backup-restore.ts` to the `security-scan` job (closest semantic fit) in `ci.yml`

### 30.E — Wire mobile + electron release pipelines into GHA (fixes 25.3, 25.4, 25.5)
Create three new workflows:
- `.github/workflows/release-ios.yml` — manual dispatch + tag trigger; runs `scripts/release/ios/build-ios.sh`; uploads IPA artifact; gates on launch-gate report
- `.github/workflows/release-android.yml` — manual dispatch + tag trigger; runs `scripts/release/android/build-android.sh`; uploads AAB artifact
- `.github/workflows/release-electron.yml` — matrix build (linux/darwin/win32); runs `scripts/release/desktop/build-electron.sh`; uploads tarball/zip artifacts

Each workflow:
- Verifies CI green on the commit
- Validates signing env (or skips with explicit "unsigned-debug" mode)
- Emits a `generated/release-{platform}-manifest.json` with version, sha256, signing status

### 30.F — Add release notes + build artifact truth generator (fixes 25.8)
- `scripts/release/generate-release-notes.ts` — reads git log between tags, emits `generated/RELEASE_NOTES.md` + `generated/release-notes.json`
- `scripts/release/generate-build-artifact-manifest.ts` — scans `dist/`, `electron-release/`, `*.ipa/aab`, emits `generated/build-artifact-manifest.json` with sha256 of each artifact + version + commit
- Register both in `MANIFEST_REGISTRY` (entries 115, 116)
- Wire into `launch-gate` job

### 30.G — Generate operability report + register manifests
- `generated/test-and-release-truth-report.json` with:
  ```json
  {
    "checklist24": { "items": 14, "truthful": 14, "ok": true },
    "checklist25": { "items": 16, "truthful": 16, "ok": true }
  }
  ```
- Register entry 117 in `manifest-registry.ts`

### Files

| Layer | Change |
|---|---|
| `src/__tests__/route-truth.test.ts` | NEW |
| `src/__tests__/edge-function-topology.test.ts` | NEW |
| `src/__tests__/manifest-truth.test.ts` | NEW |
| `src/__tests__/kill-switch-enforcement.test.ts` | NEW |
| `src/__tests__/service-boundary-truth.test.ts` | NEW |
| `src/__tests__/runtime-conformance-truth.test.ts` | NEW |
| `src/lib/mobile-platform/__tests__/capacitor-capability-contract.test.ts` | NEW |
| `.github/workflows/release-ios.yml` | NEW |
| `.github/workflows/release-android.yml` | NEW |
| `.github/workflows/release-electron.yml` | NEW |
| `.github/workflows/ci.yml` | Add backup/restore step |
| `scripts/validate-all.ts` | Bind `verify-backup-restore.ts` under `"db"` |
| `scripts/release/generate-release-notes.ts` | NEW |
| `scripts/release/generate-build-artifact-manifest.ts` | NEW |
| `src/lib/truth-manifests/manifest-registry.ts` | Add entries 115–117 |
| `generated/release-notes.json` | NEW (seed) |
| `generated/build-artifact-manifest.json` | NEW (seed) |
| `generated/test-and-release-truth-report.json` | NEW |

### Acceptance

- `npm test` runs and passes 6 new truth-tests with 0 failures
- `verify-backup-restore.ts` executes in CI security-scan job
- `.github/workflows/release-{ios,android,electron}.yml` exist and pass `actionlint`
- `generated/build-artifact-manifest.json` lists every artifact with sha256
- `generated/RELEASE_NOTES.md` generated from git log
- `MANIFEST_REGISTRY` grows from 114 → 117 entries; Gate 37 (CI Umbrella Integrity) stays green
- `generated/test-and-release-truth-report.json` shows `ok: true`
- Checklist 24 truthfully **14/14**; Checklist 25 truthfully **16/16** — fully deployable

