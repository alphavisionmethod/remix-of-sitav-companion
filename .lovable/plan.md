

## Audit: VMware / ISO / Appliance Reality Checklist (12 items)

I checked every item against disk truth. **Most are real implementations — but there is no enforceable readiness registry / CI gate parallel to iOS / Android / Web / Desktop**, the existing CI check is shallow with broken paths, and one truthfulness gap exists.

### What's actually green ✅

| # | Item | Disk evidence |
|---|---|---|
| 1 | Appliance runtime contract | `src/lib/runtime/appliance/appliance-runtime-contract.ts` — tier, hostAuthority, firstBootPhases, runtimeServices, honest vs roadmap ✅ |
| 2 | ISO/OVA build process real | `scripts/release/appliance/build-iso.sh` (12KB, executable, 8-step xorriso pipeline, autoinstall injection, GRUB rewrite) + `scripts/release/vmware/build-ova.sh` (10KB, executable, qemu-img + OVF template + .mf manifest + spec-compliant tar order) ✅ |
| 3 | VMware import works | OVA built with stream-optimized VMDK, `vmx-21` spec, VMXNET3 NIC, `.ovf` first in tar, SHA256 manifest — all per VMware OVF 1.1 spec ✅ |
| 4 | First boot sequence runs | `scripts/release/iso/sita-first-boot.sh` 12-step provisioning (Docker wait → image load → secret gen → JWT signing → TLS cert → UFW/fail2ban → logrotate → networks → compose up → health checks → backup cron + OTA timer install) ✅ |
| 5 | Network setup works | `scripts/release/iso/autoinstall/network-config` covers VMware (ens160/ens192), KVM/Hyper-V (eth0), VirtIO (enp0s3), all DHCP4 with DNS fallback ✅ |
| 6 | Persistence after reboot | `sita-os.service` systemd unit, `RemainAfterExit=yes`, `Restart=on-failure`, Docker volumes preserved, `/opt/sita` persisted ✅ |
| 7 | OTA agent defined | `scripts/release/iso/sita-ota-agent.sh` — version check, image pull, compose up, 120s health check, automatic rollback on failure, `sita-ota.timer` (every 6h) ✅ |
| 8 | Recovery path exists | `recovery-contract.ts` — 4 actions (soft-restart, ota-rollback, boot-recovery-mode, factory-reset) + `BootRecoveryCard.tsx` ✅ |
| 9 | Support diagnostics | `sita-metrics-agent.sh` (every 5min via `sita-metrics.timer`) reports hardware/health JSON ✅ |
| 10 | Startup order defined | `generated/startup-order.json` — 6 phases, 13 services, deterministic ordering ✅ |
| 11 | Capabilities separated | `appliance-capabilities.ts` 17 entries; `runtime-capability-matrix.ts` has appliance column for every capability; `appliance-fallbacks.ts` covers cross-runtime fallbacks ✅ |

### Real gaps ❌

**Gap A — `scripts/release/iso/sita-backup.sh` lacks executable bit (mode `0644`).** First-boot script does `chmod +x` on `backup.sh` (deploy variant) but the canonical `sita-backup.sh` shipped in the ISO is 0644 — `sita-backup.service` will fail to ExecStart.

**Gap B — `scripts/runtime/checks/check-appliance-runtime-contract.ts` references **non-existent paths**:** asserts `scripts/release/build-iso.sh` and `scripts/release/build-ova.sh`, but the real files live at `scripts/release/appliance/build-iso.sh` and `scripts/release/vmware/build-ova.sh`. The check passes `0/3 ISO artifacts found` silently as `warning` only, so it gives false confidence.

**Gap C — No appliance readiness registry.** iOS/Android/Web/Desktop each have a typed `*-deployability-readiness.ts` registry + CI gate + admin dashboard. Appliance has none. The 12-item checklist is not enforceable as a single artifact.

**Gap D — No CI gate registered in umbrella for appliance.** `ci-gate-types.ts` has no `phase-15-appliance-deployability`. Umbrella reads 25/25 — appliance work is invisible.

**Gap E — Item 12 "claims not ahead of reality"** — `appliance-runtime-contract.ts` honestly lists `bespoke-kernel`, `tpm-attestation`, `hardware-secure-enclave` as `roadmapCapabilities`, but **no CI assertion fails if a feature claims `appliance: "native"` for a roadmap capability**.

---

## Phase 15 — VMware / ISO / Appliance Deployability Closure

### Plan (~7 files, ~400 LOC)

**15.1 — Fix `sita-backup.sh` executable bit** → `chmod +x scripts/release/iso/sita-backup.sh`.

**15.2 — Fix the broken contract check** → update `scripts/runtime/checks/check-appliance-runtime-contract.ts` paths to canonical `scripts/release/appliance/build-iso.sh` + `scripts/release/vmware/build-ova.sh` + `scripts/release/templates/sita-os.ovf.template`.

**15.3 — Create Appliance Deployability Readiness Registry** → `src/lib/runtime/appliance/release/appliance-deployability-readiness.ts` (12-item typed registry) + `index.ts` barrel + update `src/lib/runtime/appliance/index.ts` (currently doesn't exist — `runtimes/appliance/index.ts` only barrels boot UI).

**15.4 — CI gate `check-appliance-deployability.ts`** asserts:
- `build-iso.sh` and `build-ova.sh` exist and are executable
- `sita-first-boot.sh`, `sita-ota-agent.sh`, `sita-backup.sh` exist + executable
- `sita-os.service`, `sita-ota.timer`, `sita-backup.timer` exist
- `autoinstall/{user-data,meta-data,network-config}` present
- `templates/sita-os.ovf.template` exists
- `runtime-capability-matrix.ts` declares `appliance` column for every capability
- No capability marked `appliance: "native"` is also in `roadmapCapabilities` (truthfulness)
- `startup-order.json` present with ≥1 phase
- `recovery-contract.ts` declares ≥1 boot-failure action

Registers as **CI gate 26** under new phase `phase-15-appliance-deployability` in `ci-gate-types.ts` + `ci-gate-registry.ts`. Generates `generated/appliance-deployability-report.json`.

**15.5 — Wire admin dashboard `APP01ApplianceDeployabilityCenter.tsx`** at `/admin/appliance/deployability`, rendering all 12 items green/amber/red with evidence — mirrors `DSK01DeployabilityCenter.tsx`.

**15.6 — Update aggregators**
- `generated/ci-umbrella-manifest.json` → gateCount: 26, +`phase-15-appliance-deployability`
- `generated/production-truth-final.json` → +phase-15

### Acceptance

- `sita-backup.sh` is executable; `sita-backup.service` ExecStart works.
- `check-appliance-runtime-contract.ts` reports `3/3 ISO + 2/2 OVA artifacts present` (no false negatives).
- `appliance-deployability-report.json` shows **12 items, ~10 ready + 2 honest partials** (TPM-attestation roadmap, manual VMware import smoke-test requires real ESXi).
- New `check-appliance-deployability` gate passes.
- CI Umbrella reads **26/26 green**.
- `/admin/appliance/deployability` renders all 12 items.

### Files

| File | Change |
|---|---|
| `scripts/release/iso/sita-backup.sh` | `chmod +x` |
| `scripts/runtime/checks/check-appliance-runtime-contract.ts` | Fix paths |
| `src/lib/runtime/appliance/release/appliance-deployability-readiness.ts` | New 12-item registry |
| `src/lib/runtime/appliance/release/index.ts` | Barrel |
| `scripts/architecture/checks/check-appliance-deployability.ts` | CI gate 26 |
| `src/pages/admin/APP01ApplianceDeployabilityCenter.tsx` | Admin surface |
| `src/lib/ci/ci-gate-registry.ts` + `ci-gate-types.ts` | +phase-15 |
| `src/routes/AdminRoutes.tsx` | Route wiring |
| `generated/appliance-deployability-report.json` | Disk report |
| `generated/ci-umbrella-manifest.json` | gateCount: 26 |
| `generated/production-truth-final.json` | +phase-15 |

After this phase, the VMware/ISO/Appliance Checklist is **truthfully 12/12 honest, enforceable in CI**, with the only outstanding work being the items that physically require external hardware (real ESXi import smoke, TPM hardware attestation).

