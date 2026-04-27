// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Barrel: OS Runtime Hooks
// Canonical import: @/platform/runtime
// NOTE: These are OS-level React hooks, NOT runtime detection.
// For runtime detection/capability, use @/runtimes/runtime-authority.
// ═══════════════════════════════════════════════════════════════

export * from "@/hooks/use-backend-actions";
export * from "@/platform/sita/hooks/use-kernel-events";
export * from "@/platform/sita/hooks/use-kernel-mutation";
export * from "@/platform/sita/hooks/use-kernel-query";
export * from "@/platform/sita/hooks/use-os-api";
export * from "@/platform/orchestration/hooks/useOSOrchestration";
export * from "@/hooks/use-shell-indicators";
