# Simulation and Kernel Honesty Reconciliation

**Generated:** 2026-04-19
**Status:** ✅ Already contained — this doc canonicalizes the existing honesty stance.

## 1. Canonical truth

SITA OS runs as **userland software** on host operating systems. The "Nova Runtime SDK" (formerly "Nova Kernel") is a simulated userland substrate, not a host-level kernel.

Authoritative source: `docs/architecture/native-os-future/KERNEL_OWNERSHIP_GAP.md`

Key claims that ARE allowed:
- ✅ "SITA OS is a sovereign AI operating system platform"
- ✅ "Nova Runtime SDK provides a simulated userland substrate"
- ✅ "SITA OS runs across web, desktop, appliance, and simulated tiers"

Key claims that are FORBIDDEN:
- ❌ "We built the kernel"
- ❌ "Real kernel ownership"
- ❌ "True OS-level kernel"
- ❌ "Native OS kernel we own"

## 2. Containment artifacts (existing)

- `src/lib/nova-sdk/kernel/` — simulated substrate code (correctly named)
- `src/components/ShellSimulationBanner.tsx` — visible simulation labeling
- `src/runtimes/simulated-surface-registry.ts` — registered simulated surfaces
- `scripts/validation/check-no-prohibited-native-claims.ts` (existing)
- `scripts/validation/check-no-user-visible-nova-kernel-claims.ts` (existing)
- `scripts/validation/check-nova-runtime-sdk-naming.ts` (existing)

## 3. New enforcement (this pass)

**`check-no-kernel-overclaim.ts`** (BLOCK) — scans `src/`, `docs/`, `supabase/functions/`, `README.md` for forbidden phrases. Permits the phrases only in:
- `docs/architecture/native-os-future/` (the GAP doc itself describes them)
- `archive/` (historical)
- `scripts/validation/` (validators contain the phrases as patterns)
- `generated/` (audit reports cite them)

## 4. Wired into release gates

Gate name: `no-kernel-overclaim` — added to BLOCK list.

## 5. Simulation banner enforcement

`ShellSimulationBanner` must render on all surfaces classified `simulation` in `src/runtimes/simulated-surface-registry.ts`. Existing gate `future-surfaces-registered` enforces this.

## 6. Runtime tier registry

The 4 runtime tiers documented at `src/runtimes/feature-runtime-tier-registry.ts`:
- WEB_APP (Tier 1) — browser
- DESKTOP_HOST (Tier 2) — Electron
- APPLIANCE_RUNTIME (Tier 3) — Ubuntu primary
- SIMULATED_OS (Tier 4) — Nova Runtime SDK

All four are honestly classified. The simulation tier is NOT claimed as a real kernel.
