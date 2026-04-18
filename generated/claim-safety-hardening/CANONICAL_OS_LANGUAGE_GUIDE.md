# Canonical OS Language Guide

**Status**: BLOCK-level governance — enforced by `check-os-claim-safety.ts`
**Owner**: Platform Truth Council
**Effective**: 2026-04-18

This guide is the **single source of truth** for how SITA describes itself in any outward-facing surface (docs, UI copy, READMEs, admin truth boards, demos, investor materials).

## ✅ APPROVED phrases — use freely

### Identity
- **sovereign AI operating system platform**
- **Ubuntu-native AI operating environment**
- **installable Ubuntu-native deployable platform**
- **userland AI operating environment on a signed Linux substrate**
- **AI-first deployable system on Ubuntu 24.04 LTS**
- **signed appliance image** / **signed desktop platform**
- **AI-native userland**
- **AI workforce runtime**

### Architecture / Substrate
- **built on Ubuntu 24.04 LTS (kernel 6.8+)**
- **userland services above the Linux kernel**
- **signed substrate with UEFI Secure Boot, TPM 2.0, dm-verity, LUKS2**
- **A/B partition layout for atomic updates**
- **userland boot orchestration above systemd**

### Capabilities
- **deployable on bare-metal, VM, and appliance form factors**
- **production-capable on Track A** (with active P1 caveat block — see Phase 4)
- **pilot-ready** / **controlled-launch-ready**
- **release-system-ready with a short P1 closure list**

## 🟣 TRACK-B-ONLY phrases — only in `docs/nova/`, `src/lib/nova-sdk/`, or files containing `<!-- track-b -->` marker

- "Nova Runtime SDK simulated kernel"
- "future-native substrate"
- "future host-kernel research track"
- "simulated boot sequence" / "simulated HAL"

These describe Nova SDK research only and **must never** appear in product copy, READMEs, marketing, or admin truth boards.

## 🔴 PROHIBITED phrases — never use anywhere

| Phrase | Why prohibited |
|---|---|
| "custom kernel" | implies SITA owns the host kernel — false |
| "our own kernel" | same |
| "native OS kernel" | implies host-kernel ownership |
| "full OS from scratch" | overclaims substrate ownership |
| "we built the kernel" | false |
| "Windows/macOS-class substrate ownership" | overclaim |
| "replaces Linux" | false; SITA *runs on* Linux |
| "no host OS dependency" | false |
| "kernel-level isolation we wrote" | false |
| "our bootloader" | bootloader is systemd-boot, signed, not authored by SITA |
| "our HAL" (outside Nova SDK docs) | only Nova SDK simulates a HAL |

## 🟡 QUALIFIER-REQUIRED phrases — must be paired with truthful context

| Phrase | Required qualifier |
|---|---|
| "operating system" | must pair with "Ubuntu-native" or "userland" or "AI-first userland" |
| "boot" / "boot sequence" | must clarify "userland boot above systemd" if not obvious |
| "appliance" | must clarify "signed Ubuntu-based appliance image" |
| "desktop platform" | must clarify "userland desktop environment" |
| "installable platform" | must clarify "installable on Ubuntu 24.04 LTS" |
| "system software" | must clarify "AI userland system software" |
| "shell" | must clarify "userland shell" or "AI shell runtime" if user-visible |

## Wording Examples

### ✅ Good
> SITA OS is a sovereign AI operating system platform built on Ubuntu 24.04 LTS. It ships as a signed, deployable userland environment with UEFI Secure Boot, TPM 2.0 attestation, dm-verity root integrity, and LUKS2 disk encryption.

### 🔴 Bad
> SITA OS is a custom kernel and full operating system we built from scratch.

### ✅ Good
> Production-capable on Track A. See `Active Caveats` for the current P1 closure list.

### 🔴 Bad
> Fully production-certified with nothing left to prove.

## Enforcement

- **Phase 5** introduces three CI gates that fail on prohibited phrases:
  1. `check-os-claim-safety.ts` — scans `src/` and product-facing `docs/` for the prohibited list
  2. `check-track-b-language-boundaries.ts` — ensures Track-B phrases stay in Track-B files
  3. `check-no-prohibited-native-claims.ts` — strict scan of READMEs, product pages, admin truth boards
- All three gates are BLOCK-level in the master release aggregator.

## Change Process

To add or remove a phrase:
1. Open a PR updating this file.
2. Update the corresponding allow/deny list in `check-os-claim-safety.ts`.
3. Run `pnpm tsx scripts/validation/check-os-claim-safety.ts` locally.
4. Get sign-off from Platform Truth Council.
