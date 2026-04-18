# Track B — Native OS Substrate Gap Classification

> **Status:** All items in this directory are **classified gaps**, not implementations.
> **Honesty rule:** Nothing in this folder may be cited as a feature, capability, or
> shipping behavior of SITA OS. Marketing, runtime tier badges, launch claims, and
> the deployment certification report explicitly exclude these areas.

SITA OS is a **product/platform** built on top of standard runtimes (web, Electron desktop, appliance VMs). It is **not** a from-scratch commercial OS in the macOS/Windows kernel sense.

This directory exists so the project can:

1. Be **launch-honest** about what is not implemented.
2. Reserve future architecture vocabulary without faking present capability.
3. Prevent product/runtime/messaging drift toward overstated claims.

## Classified gaps (8)

| File | Area | Classification |
|---|---|---|
| `KERNEL_OWNERSHIP_GAP.md` | True kernel | Future / native-substrate |
| `BOOT_CHAIN_OWNERSHIP_GAP.md` | Bootloader | Future / native-substrate |
| `HAL_AND_DRIVER_MODEL_GAP.md` | Hardware abstraction | Future / native-substrate |
| `NATIVE_COMPOSITOR_STACK_GAP.md` | Display/input | Future / native-substrate |
| `ABI_AND_NATIVE_APP_PLATFORM_GAP.md` | Stable ABI | Future / native-substrate |
| `OS_LEVEL_I18N_ACCESSIBILITY_GAP.md` | a11y substrate | Future / native-substrate |
| `POWER_AND_SCHEDULER_GAP.md` | Power/scheduler | Future / native-substrate |
| `HARDWARE_CERTIFICATION_GAP.md` | OEM certification | Future / native-substrate |

## Enforcement

These docs are referenced by the deployment certification report. The runtime tier
registry (`src/platform/architecture/feature-runtime-tier-registry.ts`) and
`TierBadge` component must never claim Tier-0 (native kernel) capability for
any feature backed only by these docs.
