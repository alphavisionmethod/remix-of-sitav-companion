

# Release Distribution Closure — Implementation Plan

## Summary

Implement a complete release-proof system covering desktop signing/notarization truth, OS boot validation, install/upgrade/rollback matrix, hardware compatibility, first-boot certification, channel migration, provenance/attestation, checksum publication, and evidence packs. All work extends existing canonical systems — no second release platform.

---

## PART 1 — Canonical Systems to Preserve and Extend

| System | Location | Action |
|---|---|---|
| Electron release pipeline | `.github/workflows/release-electron.yml` | Extend with signing steps |
| OS ISO/OVA build pipeline | `.github/workflows/os-build-iso.yml` | Already has QEMU smoke, extend with matrix proof |
| Desktop credential verifier | `scripts/release/desktop/verify-signing-credentials.ts` | Extend to emit notarization status |
| Artifact proof closure check | `scripts/release/check-artifact-proof-closure.ts` | Extend required artifacts list |
| Release contracts package | `src/packages/release-contracts/` | Add new types |
| First-boot script | `scripts/release/iso/sita-first-boot.sh` | Reference in certification |
| Provenance attestation | `public/generated/release-provenance-attestation.json` | Replace with richer model |
| OS boot proof bundle | `public/generated/os-boot-proof-bundle.json` | Extend |
| VMware supply-chain scripts | `scripts/release/vmware/` | Reference, do not duplicate |

---

## PART 2 — Duplicates to Consolidate

- `scripts/release/supply-chain/sita-ota-agent.sh` vs `scripts/release/iso/sita-ota-agent.sh` — keep ISO version, alias supply-chain
- `scripts/release/checks/check-release-readiness.ts` is misnamed (checks prompts, not release) — rename or repurpose

---

## PART 3 — New Files to Create

### Phase 1: Core Contracts (src/lib/release/)

1. **`src/lib/release/artifact-proof-contract.ts`** — Canonical proof model per build target (target ID, artifact type, signing requirements, provenance, checksums, channels, boot/install validation, hardware compat, support linkage, readiness state)

2. **`src/lib/release/desktop-signing-policy.ts`** — Per-platform signing requirements (linux: ready, macOS: deferred-on-cert, win32: deferred-on-cert), required secrets, gate behavior, closure path

3. **`src/lib/release/os-boot-validation-policy.ts`** — Boot criteria per format (ISO, OVA, RAW), CI job mapping, failure detection, recovery expectations, evidence emitted

4. **`src/lib/release/install-upgrade-rollback-matrix.ts`** — Fresh install, upgrade, rollback, channel migration, downgrade constraints per target

5. **`src/lib/release/hardware-compatibility-matrix.ts`** — Desktop OS variants, VM environments (QEMU, VMware, VirtualBox), appliance targets, GPU/TPM requirements

6. **`src/lib/release/first-boot-certification.ts`** — First shell launch, runtime readiness, essential daemons, profile resolution, crash-safe startup checks

7. **`src/lib/release/release-channel-policy.ts`** — Channels (dev, internal, beta, stable), promotion rules, migration semantics, rollback behavior, data safety

8. **`src/lib/release/provenance-attestation-builder.ts`** — Builder that assembles provenance records from build workflow, source revision, signing status, materials

9. **`src/lib/release/checksum-publication.ts`** — Per-artifact checksum algorithm, value generation, publication path, verification guidance

10. **`src/lib/release/release-evidence-pack-builder.ts`** — Assembles coherent evidence packs per target combining all above artifacts

### Phase 2: Generated Proof Artifacts

A generator script **`scripts/release/generate-release-proof-artifacts.ts`** that produces:

- `public/generated/release-artifact-proof/desktop/proof-pack.json`
- `public/generated/release-artifact-proof/os-images/proof-pack.json`
- `public/generated/desktop-notarization-status.json`
- `public/generated/os-boot-ci-matrix.json`
- `public/generated/release-checksums.json`
- `public/generated/install-upgrade-rollback-matrix.json`
- `public/generated/hardware-compatibility-validation.json`
- `public/generated/first-boot-certification-report.json`
- `public/generated/release-channel-migration-report.json`
- `public/generated/supply-chain-attestation.json`
- `public/generated/release-supportability-report.json`

Updates existing `public/generated/release-provenance-attestation.json` with full provenance model.

### Phase 3: Validators / Gate Scripts

Create under `scripts/release/checks/`:

1. `check-desktop-signing-and-notarization.ts`
2. `check-os-boot-validation.ts`
3. `check-install-upgrade-rollback-matrix.ts`
4. `check-hardware-compatibility.ts`
5. `check-first-boot-certification.ts`
6. `check-release-channel-migration.ts`
7. `check-provenance-attestation.ts`
8. `check-checksum-publication.ts`
9. `check-release-evidence-packs.ts`

Each validator inspects the generated artifacts, classifies findings as BLOCK or ADVISORY, and emits gate reports via the existing `emitGateReport` utility.

### Phase 4: Integration Wiring

- Update `scripts/release/check-artifact-proof-closure.ts` to require all new generated artifacts
- Add `generate:release-proof` script to `package.json`
- Add `check:release-proof` script that runs all 9 validators
- Wire into `scripts/generate-all.ts`
- Link to existing runbooks: `docs/runbooks/release-rollback.md`, `docs/runbooks/vmware-boot-failure.md`, `docs/runbooks/desktop-host-bridge-failure.md`

---

## PART 4 — Deployment Closure Checklist

Distribution is production-closed only when ALL are true:

- [ ] Desktop signing/notarization status explicitly declared per platform
- [ ] OS image boot validation runs in CI (QEMU smoke for ISO, OVA)
- [ ] Install/upgrade/rollback matrix declared and referenced
- [ ] Hardware compatibility matrix declared with honest gap reporting
- [ ] First-boot certification criteria defined per shipped format
- [ ] Release channel promotion/migration rules codified
- [ ] Provenance attestation emitted per artifact
- [ ] SHA-256 checksums published per artifact
- [ ] Evidence packs generated for desktop and OS-images targets
- [ ] All 9 gate validators pass (BLOCK issues = 0)
- [ ] No duplicate release logic remains

---

## Technical Notes

- All contract files use TypeScript interfaces extending existing patterns from `src/packages/release-contracts/`
- All validators use the existing `ViolationCollector` and `emitGateReport` utilities
- Generated artifacts follow the existing `public/generated/` convention
- The generator script is idempotent and safe to run in CI or locally
- Desktop signing remains honestly "deferred-on-cert" until Apple/Windows secrets land — the system codifies the exact closure path without false claims
- Approximately 22 new files total across contracts, generators, and validators

