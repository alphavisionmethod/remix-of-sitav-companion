// ═══════════════════════════════════════════════════════════════
// Nova Runtime SDK — Canonical alias surface
//
// This is the canonical, claim-honest name for what was previously
// called "Nova Kernel". Nova Runtime SDK is a userland substrate
// that simulates OS-like primitives (scheduler, memory manager,
// file system, IPC) inside the React/Electron host. It is NOT a
// host kernel and does NOT own real hardware.
//
// Internal code symbols under src/platform/nova-sdk/kernel/* keep
// their existing names (compatibility) but are re-exported here
// under the canonical Nova Runtime SDK surface. New callers
// SHOULD import from this module.
// ═══════════════════════════════════════════════════════════════

export const NOVA_RUNTIME_SDK_VERSION = "1.0.0";
export const NOVA_RUNTIME_SDK_NAME = "Nova Runtime SDK";
export const NOVA_RUNTIME_SDK_HONESTY_NOTE =
  "Nova Runtime SDK is a userland runtime substrate. It simulates OS-like primitives inside the host process (React + Electron). It does not own real hardware, does not replace the host kernel, and does not provide kernel-level isolation.";

// Re-export the existing internal modules under the canonical name.
// These wrappers exist so new code uses honest naming while
// pre-existing imports continue to work unchanged.
export * as NovaRuntimeBoot from "@/platform/nova-sdk/kernel/boot";
export * as NovaRuntimeScheduler from "@/platform/nova-sdk/kernel/scheduler";
export * as NovaRuntimeMemory from "@/platform/nova-sdk/kernel/memory-manager";
export * as NovaRuntimeProcess from "@/platform/nova-sdk/kernel/process-manager";
export * as NovaRuntimeIPC from "@/platform/nova-sdk/kernel/ipc";
export * as NovaRuntimePower from "@/platform/nova-sdk/kernel/power-manager";
export * as NovaRuntimeCrash from "@/platform/nova-sdk/kernel/crash-resilience";
export * as NovaRuntimePrivilege from "@/platform/nova-sdk/kernel/privilege";
export * as NovaRuntimeSyscall from "@/platform/nova-sdk/kernel/syscall";
export * as NovaRuntimeCompositor from "@/platform/nova-sdk/kernel/compositor";
export * as NovaRuntimeWayland from "@/platform/nova-sdk/kernel/wayland";

export const NovaRuntimeSDK = {
  name: NOVA_RUNTIME_SDK_NAME,
  version: NOVA_RUNTIME_SDK_VERSION,
  honestyNote: NOVA_RUNTIME_SDK_HONESTY_NOTE,
  classification: "userland-runtime-substrate" as const,
  notKernel: true,
  notSecurityBoundary: true,
} as const;
