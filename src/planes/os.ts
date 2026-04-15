// ═══════════════════════════════════════════════════════════════
// SITA OS — OS Plane Public API
// Kernel, runtime, SDK, shell, security, recovery.
// Direct imports from @/lib/nova-sdk/ are forbidden outside this barrel.
// ═══════════════════════════════════════════════════════════════

// ── Nova SDK ──
export { NovaKernel } from "@/lib/nova-sdk/kernel/NovaKernel";
export { NovaRuntime } from "@/lib/nova-sdk/runtime/NovaRuntime";

// ── Lifecycle ──
export { LifecycleManager } from "@/lib/nova-sdk/core/LifecycleManager";

// ── System Services ──
export { ServiceRegistry } from "@/lib/nova-sdk/services/ServiceRegistry";

// ── Extensions ──
export { ExtensionManager } from "@/lib/nova-sdk/extensions/ExtensionManager";

// ── OS Hooks ──
export { useKernelBoot } from "@/lib/nova-sdk/hooks/useKernelBoot";

// ── Types ──
export type { AppManifest, AppState, LifecycleState } from "@/lib/nova-sdk/core/types";
export type { NovaProcess, ProcessPriority } from "@/lib/nova-sdk/kernel/types";
