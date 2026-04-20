

## Truth check (what I found on disk, right now)

The "3 missing required-gate outputs" status the cockpit is showing is **stale text inside `public/generated/MASTER_AUDIT.md`**, not a real aggregator failure. Two parts of that same file disagree with each other:

| Section | What it says | Reality |
|---|---|---|
| §1.3 lines 92–94 | OS-ISO/OVA/RAW = 🟡 STAGING, 3 missing required-gate outputs | **Stale** — written pre-Wave 1 |
| §12.1–§12.2 line 334+ | "All previously missing required-gate outputs produced; 244/244 BLOCK GREEN; Wave 5 complete" | **Current truth** |

Live evidence: `generated/os-build-pipeline-report.json` and `generated/qemu-vm-readiness-report.json` both report `errorCount: 0, ok: true`. Aggregator summary confirms `os-build-pipeline`, `os-trust-chain-readiness`, `os-update-readiness`, `os-recovery-readiness`, `qemu-vm-readiness` and `os-support-bundle-readiness` all ✅ GREEN with 0 errors / 0 warnings. So the cockpit message is doc drift, not a code gap.

**However**, while validating this I found two real, deployment-affecting ISO/OVA/RAW gaps that nobody has gated yet. Wave 6 closes both, plus the doc drift, plus the missing CI wiring.

## Real residual gaps for ISO/OVA/RAW pipeline

### Tier 1 — Real artifact gap
1. **`os-build-iso.yml` never invokes `os/vmware/build-ova.sh`.** The OVA exists as a script but is NOT produced by CI on release. Operators have no signed OVA artifact in the GitHub Release. The release pipeline `os/scripts/release.sh` also stops at step 13 (QEMU) and never wraps the ISO into an OVA.
2. **`build-ova.sh` ships a "live-from-CD" appliance** (line 37–40 of the script confirms it). This is documented in `docs/os/VMWARE_APPLIANCE_BUILD_PIPELINE.md` as Phase-2 work but is unsuitable for production. No autoinstall preseed is consumed; `scripts/release/iso/autoinstall/` is wired for ISO but not OVA.

### Tier 2 — Doc drift causing the cockpit panel
3. `MASTER_AUDIT.md` §1.3 still claims the 8-surface verdict table shows STAGING. Operators reading the cockpit panel cannot trust it.

### Tier 3 — Missing release-time gates
4. There is no `iso-artifact-presence` / `ova-artifact-presence` / `raw-img-artifact-presence` block gate that physically verifies `out/*.iso`, `out/*.ova`, `out/*.img` exist after a release-tagged build. Today the `os-build-pipeline` gate only checks scripts exist, not that they produced artifacts.

## Wave 6 — ISO/OVA/RAW production readiness

### 6.1 Fix doc drift (cockpit goes GREEN immediately)
- Update `public/generated/MASTER_AUDIT.md` §1.3 lines 92–94: flip OS-ISO / OVA / RAW IMG from 🟡 STAGING to 🟢 READY, and replace "3 missing required-gate outputs" with the Wave-5 truth ("ISO+IMG produced by CI; OVA gated to release events; 244/244 BLOCK GREEN — see §12.1").
- Update §1.4 "Critical path to GREEN": replace the 4-step list with "Already GREEN as of Wave 5 (2026-04-20)".
- Mirror the change into `public/generated/artifacts/audits/MASTER_AUDIT.md` (same file, second copy).

### 6.2 Wire OVA into CI (close the real artifact gap)
- Add a new `build-ova` job to `.github/workflows/os-build-iso.yml` that depends on `build`, runs only on `release: published` and `workflow_dispatch`, downloads the ISO artifact, installs `qemu-img qemu-system-x86 ovmf tar`, runs `bash os/vmware/build-ova.sh`, then uploads `out/*.ova`, `out/*.ova.sha256`, `out/*.ova.manifest.json` as a separate artifact and attaches to the GitHub Release.
- Add a final step in `os/scripts/release.sh` (step 14/14): `bash os/vmware/build-ova.sh` after step 13 QEMU. Make it skip-with-warning if `qemu-img` / `qemu-system-x86_64` are missing so local dev still passes.

### 6.3 Add three artifact-presence gates (lock the wins)
Create three new BLOCK gates that physically verify produced artifacts (not just scripts):
- `scripts/architecture/checks/check-iso-artifact-presence.ts` → looks for `out/sita-os-*.iso` + `.sha256` + `.manifest.json` OR a documented `--allow-empty` flag for non-build environments. Emits `generated/iso-artifact-presence-report.json`.
- `scripts/architecture/checks/check-ova-artifact-presence.ts` → same pattern for `.ova`.
- `scripts/architecture/checks/check-raw-img-artifact-presence.ts` → same for `.img`.
- Each gate runs in two modes: **CI release mode** (artifacts must exist) and **dev mode** (artifacts may be absent; gate reports OK with `mode: "dev"`). Mode is selected by `SITA_RELEASE_MODE=ci|dev` env (defaults to `dev`).
- Register all three in `scripts/architecture/checks/check-os-release-readiness.ts`:
  - Add to `REQUIRED_OUTPUT_WRITERS` map.
  - Add to the BLOCK-tier gate list (now 247/247).
  - Add to the validator-map.

### 6.4 Wire the three new gates into CI
- In `.github/workflows/os-build-iso.yml` `build` job, after the "Inspect output" step, add: `SITA_RELEASE_MODE=ci npx tsx scripts/architecture/checks/check-iso-artifact-presence.ts` and the IMG one.
- In the new `build-ova` job, after upload, add: `SITA_RELEASE_MODE=ci npx tsx scripts/architecture/checks/check-ova-artifact-presence.ts`.
- Failure of any of the three fails the workflow.

### 6.5 Make OVA autoinstall real (Phase-2 graduation)
- Wire the existing `scripts/release/iso/autoinstall/` (meta-data, network-config, user-data) into `os/vmware/build-ova.sh`: pass `-cdrom seed.iso` containing the autoinstall payload and a fixed-size 32GB qcow2 target so the install lands on disk, not live-from-CD.
- Update the OVF descriptor written by `build-ova.sh` to advertise vmx-19 hardware and 4 GiB RAM / 2 vCPU defaults that match the validated targets in `docs/os/VMWARE_APPLIANCE_BUILD_PIPELINE.md`.
- Document the Phase-2 graduation in the same doc: change "Phase 2 (planned)" to "Phase 2 (shipped Wave 6)".

### 6.6 Refresh ground truth
- Append a `WAVE6_ISO_OVA_RAW_PRODUCTION.md` operator note (sibling of `WAVE5_PRODUCTION_HARDENING.md`) summarising what Wave 6 changed.
- Update `docs/os/RELEASE_ARTIFACT_MODEL.md` to mark OVA from "workflow_dispatch only" to "release-triggered (workflow_dispatch + release events)".
- Update `docs/PLATFORM_SCOPE.md` line for "VMware OVA appliance" from 🟡 Partial → 🟢 GA, with note "unattended install graduated from live-from-CD as of Wave 6".
- Update memory `governance/readiness-framework` count from 244 → 247 BLOCK gates after the three new gates land.

### 6.7 Re-run aggregator and verify
- Run `npx tsx scripts/architecture/checks/check-os-release-readiness.ts` locally.
- Expected: 247/247 BLOCK GREEN, 0 errors, 0 missing. Verdict stays YELLOW only because of the three deferred mega-gates (Phase-15 lib decomposition / legacy wrappers / lib ownership) which remain explicitly out of scope.

## Files to be created
- `scripts/architecture/checks/check-iso-artifact-presence.ts`
- `scripts/architecture/checks/check-ova-artifact-presence.ts`
- `scripts/architecture/checks/check-raw-img-artifact-presence.ts`
- `WAVE6_ISO_OVA_RAW_PRODUCTION.md`

## Files to be edited
- `public/generated/MASTER_AUDIT.md` (§1.3 + §1.4 truth refresh)
- `public/generated/artifacts/audits/MASTER_AUDIT.md` (mirror)
- `.github/workflows/os-build-iso.yml` (new `build-ova` job + 3 gate-runner steps)
- `os/scripts/release.sh` (new step 14 wraps OVA)
- `os/vmware/build-ova.sh` (autoinstall seed wiring + OVF defaults)
- `scripts/architecture/checks/check-os-release-readiness.ts` (register 3 new BLOCK gates + writers)
- `docs/os/VMWARE_APPLIANCE_BUILD_PIPELINE.md` (Phase-2 graduation)
- `docs/os/RELEASE_ARTIFACT_MODEL.md` (OVA trigger update)
- `docs/PLATFORM_SCOPE.md` (OVA → GA)

## Stop conditions
1. Any of the existing 244 BLOCK gates flips RED after the 3 new gates are registered → halt.
2. `build-ova.sh` autoinstall seed cannot be assembled without `xorrisofs` available in CI → fall back to live-from-CD with a `::warning::` and document.
3. Adding `SITA_RELEASE_MODE=ci` to local validators breaks dev mode (artifacts absent locally) → enforce the dev/ci mode split and re-run before commit.

## What this delivers
- The cockpit panel for OS-ISO / OVA / RAW IMG flips from 🟡 STAGING → 🟢 READY (doc drift fixed).
- OVA artifact is actually produced, signed, and attached to GitHub Releases (not just `workflow_dispatch`).
- OVA graduates from live-from-CD to true unattended-install appliance.
- 3 new BLOCK gates physically verify ISO/OVA/IMG artifacts existed at release time, preventing future silent regressions.
- Aggregator reaches 247/247 BLOCK GREEN, 0 errors, 0 missing — system is genuinely real-life deployment-ready for sovereign Linux.

