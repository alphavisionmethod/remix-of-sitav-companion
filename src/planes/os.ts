// ═══════════════════════════════════════════════════════════════
// SITA OS — OS Plane Public API
// Kernel, runtime, SDK, shell, security, recovery.
// Direct imports from @/lib/nova-sdk/ are forbidden outside this barrel.
// ═══════════════════════════════════════════════════════════════

// ── Nova SDK (full barrel) ──
export {
  validateManifest,
  AppRegistry,
  useAppRuntime,
  useNovaApp,
} from "@/lib/nova-sdk";

export type {
  AppManifest,
  NovaPermissionId,
  RegisteredApp,
  AppRuntimeState,
} from "@/lib/nova-sdk";

// ── Kernel subsystems ──
export { NovaKernel } from "@/lib/nova-sdk/kernel/boot";
export { Compositor } from "@/lib/nova-sdk/kernel/compositor";
export { Scheduler } from "@/lib/nova-sdk/kernel/scheduler";
export { Syscall, ERRNO } from "@/lib/nova-sdk/kernel/syscall";
export { MemoryManager } from "@/lib/nova-sdk/kernel/memory-manager";
